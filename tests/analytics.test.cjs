const { test } = require('node:test');
const assert = require('node:assert/strict');
const { pathToFileURL } = require('node:url');
const path = require('node:path');

const analyticsModule = import(pathToFileURL(path.resolve('lib/ga/index.js')).href);
const flush = () => new Promise((resolve) => queueMicrotask(resolve));

async function setup(statistics, measurementId = 'G-TEST') {
  const { createAnalytics } = await analyticsModule;
  const browser = new EventTarget();
  const calls = [];
  let reloads = 0;
  browser.location = { href: 'https://example.test/', reload() { reloads++; } };
  browser.document = { title: 'Home', referrer: '' };
  browser.gtag = (...args) => calls.push(args);
  if (statistics !== undefined) {
    browser.Cookiebot = { hasResponse: true, consent: { statistics } };
  }
  const analytics = createAnalytics(browser, measurementId);
  analytics.commitPage(browser.location.href, browser.document.title);
  const permissions = [];
  const stop = analytics.start((allowed) => permissions.push(allowed));
  await flush();
  return {
    analytics, browser, calls, permissions, stop,
    get reloads() { return reloads; },
    views: () => calls.filter((call) => call[0] === 'event' && call[1] === 'page_view'),
    async consent(value, event = 'CookiebotOnConsentReady') {
      browser.Cookiebot = { hasResponse: true, consent: { statistics: value } };
      browser.dispatchEvent(new Event(event));
      await flush();
    },
  };
}

test('absent CMP and refusal keep analytics disabled', async () => {
  for (const statistics of [undefined, false]) {
    const state = await setup(statistics);
    state.analytics.onReady();
    state.analytics.pageview();
    state.analytics.event({ action: 'test' });
    assert.ok(state.permissions.every((allowed) => allowed === false));
    assert.deepEqual(state.calls, []);
    assert.equal(state.browser['ga-disable-G-TEST'], true);
    assert.equal(state.reloads, 0);
    state.stop();
  }
});

test('opening preferences does not revoke an existing statistics choice', async () => {
  const state = await setup(true);
  state.analytics.onReady();
  // Cookiebot.show can reset hasResponse while preserving the actual choice.
  state.browser.Cookiebot.hasResponse = false;
  state.browser.location.href = 'https://example.test/about';
  state.analytics.commitPage('/about', 'About');
  assert.equal(state.reloads, 0);
  assert.equal(state.views().length, 2);
  state.stop();
});

test('missing ID prevents initialization even with valid consent', async () => {
  const state = await setup(true, '');
  state.analytics.onReady();
  assert.equal(state.permissions.at(-1), false);
  assert.deepEqual(state.calls, []);
  state.stop();
});

test('saved consent initializes once after load and survives remounts without duplicate views', async () => {
  const state = await setup(true);
  assert.equal(state.permissions.at(-1), true);
  assert.deepEqual(state.calls, []);
  state.analytics.onReady();
  state.analytics.onReady();
  state.analytics.pageview();
  state.stop();
  const stop = state.analytics.start(() => {});
  await flush();
  await state.consent(true, 'CookiebotOnAccept');
  assert.equal(state.calls.filter(([name]) => name === 'config').length, 1);
  assert.deepEqual(state.calls.find(([name]) => name === 'config'),
    ['config', 'G-TEST', { send_page_view: false }]);
  assert.equal(state.views().length, 1);
  stop();
});

test('acceptance records only the current page after loading, with no denied backlog', async () => {
  const state = await setup(false);
  state.browser.location.href = 'https://example.test/about';
  state.analytics.pageview();
  state.analytics.event({ action: 'denied' });
  await state.consent(true);
  state.browser.location.href = 'https://example.test/posts/current?private=value#part';
  state.browser.document.title = 'Current';
  state.analytics.commitPage(state.browser.location.href, 'Current');
  state.analytics.onReady();
  assert.equal(state.views().length, 1);
  assert.equal(state.views()[0][2].page_location, 'https://example.test/posts/current');
  assert.equal(state.views()[0][2].page_title, 'Current');
  assert.equal(state.views()[0][2].page_referrer, '');
  assert.equal(state.calls.some((call) => call[1] === 'denied'), false);
  state.stop();
});

test('navigation excludes hash/query duplicates and counts return visits with referrer', async () => {
  const state = await setup(true);
  state.analytics.onReady();
  for (const route of ['/#anchor', '/?private=value', '/about', '/about', '/']) {
    state.browser.location.href = 'https://example.test' + route;
    state.analytics.commitPage(route, state.browser.document.title);
  }
  assert.deepEqual(state.views().map((call) => call[2].page_location),
    ['https://example.test/', 'https://example.test/about', 'https://example.test/']);
  assert.equal(state.views()[2][2].page_referrer, 'https://example.test/about');
  state.stop();
});

test('revocation disables collection synchronously and reloads only once', async () => {
  const state = await setup(true);
  state.analytics.onReady();
  state.browser.Cookiebot.consent.statistics = false;
  state.browser.dispatchEvent(new Event('CookiebotOnDecline'));
  assert.equal(state.browser['ga-disable-G-TEST'], true);
  assert.equal(state.reloads, 1);
  state.analytics.event({ action: 'after-revocation' });
  state.analytics.pageview();
  state.analytics.onReady();
  await state.consent(false);
  await state.consent(true);
  state.stop();
  const stop = state.analytics.start(() => {});
  await flush();
  assert.equal(state.reloads, 1);
  assert.equal(state.views().length, 1);
  assert.equal(state.calls.some((call) => call[1] === 'after-revocation'), false);
  const refreshed = await setup(false);
  assert.equal(refreshed.reloads, 0);
  refreshed.stop();
  stop();
});

test('revocation during download prevents late initialization and later events', async () => {
  const state = await setup(true);
  await state.consent(false, 'CookiebotOnAccept');
  state.analytics.onReady();
  assert.deepEqual(state.calls, []);
  assert.equal(state.reloads, 1);
  assert.equal(state.browser['ga-disable-G-TEST'], true);
  state.stop();
});

test('missing gtag and missing load callback safely discard events', async () => {
  const state = await setup(true);
  state.analytics.event({ action: 'before-load' });
  state.analytics.pageview();
  delete state.browser.gtag;
  assert.doesNotThrow(() => state.analytics.onReady());
  assert.doesNotThrow(() => state.analytics.pageview());
  assert.doesNotThrow(() => state.analytics.event({ action: 'missing-gtag' }));
  assert.deepEqual(state.calls, []);
  state.stop();
});

test('CMP updates finish before measurement and cleanup cancels pending synchronization', async () => {
  const state = await setup(false);
  state.analytics.onReady();
  state.browser.Cookiebot.consent.statistics = true;
  state.browser.dispatchEvent(new Event('CookiebotOnAccept'));
  state.calls.push(['consent', 'update', { analytics_storage: 'granted' }]);
  await flush();
  assert.equal(state.calls[0][0], 'consent');
  assert.equal(state.views().length, 1);
  state.stop();
  const callsBefore = state.calls.length;
  state.browser.dispatchEvent(new Event('CookiebotOnDecline'));
  assert.equal(state.calls.length, callsBefore);
  const stop = state.analytics.start(() => {});
  stop();
  await flush();
  assert.equal(state.calls.length, callsBefore);
});

test('events target the configured property only when consent is still valid', async () => {
  const state = await setup(true);
  state.analytics.onReady();
  state.analytics.event({ action: 'download', params: { value: 1, send_to: 'other' } });
  assert.deepEqual(state.calls.at(-1), ['event', 'download', { value: 1, send_to: 'G-TEST' }]);
  state.browser.Cookiebot = undefined;
  state.analytics.event({ action: 'cmp-unavailable' });
  assert.equal(state.browser['ga-disable-G-TEST'], true);
  assert.equal(state.reloads, 1);
  state.stop();
});

test('Accept before the CMP state update eventually permits mounting the Google loader', async () => {
  const state = await setup(false);
  state.browser.dispatchEvent(new Event('CookiebotOnAccept'));
  assert.equal(state.permissions.at(-1), false);
  state.browser.Cookiebot.consent.statistics = true;
  await flush();
  assert.equal(state.permissions.at(-1), true);
  assert.deepEqual(state.calls, []);
  state.analytics.onReady();
  assert.equal(state.views().length, 1);
  state.stop();
});

test('a completed route waits for its committed title before sending its pageview', async () => {
  const state = await setup(true);
  state.analytics.onReady();
  state.browser.location.href = 'https://example.test/about';
  // Router completion can precede next/head's passive effect.
  state.analytics.pageview();
  state.analytics.onReady();
  await state.consent(true);
  assert.equal(state.views().length, 1);
  state.browser.document.title = 'About';
  state.analytics.commitPage('/about', state.browser.document.title);
  state.analytics.pageview();
  state.analytics.onReady();
  await state.consent(true);
  assert.deepEqual(state.views().map((call) => [call[2].page_location, call[2].page_title]),
    [['https://example.test/', 'Home'], ['https://example.test/about', 'About']]);
  state.stop();
});

test('ConsentReady handles a CMP update arriving after the Accept microtask', async () => {
  const state = await setup(false);
  state.browser.dispatchEvent(new Event('CookiebotOnAccept'));
  await flush();
  assert.equal(state.permissions.at(-1), false);
  await state.consent(true);
  assert.equal(state.permissions.at(-1), true);
  state.analytics.onReady();
  assert.equal(state.views().length, 1);
  state.stop();
});

test('a page committed during loading is measured once with its own title', async () => {
  const state = await setup(true);
  state.browser.location.href = 'https://example.test/about';
  state.analytics.commitPage('/about', 'About');
  // A later callback must use the captured title, not an unrelated DOM value.
  state.browser.document.title = 'Unrelated';
  state.analytics.onReady();
  state.analytics.commitPage('/about', 'About');
  assert.equal(state.views().length, 1);
  assert.equal(state.views()[0][2].page_title, 'About');
  state.stop();
});
