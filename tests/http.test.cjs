const { before, after, test } = require('node:test');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const vm = require('node:vm');
const { once } = require('node:events');
const { postIds } = require('./routes.cjs');
const articles = require('./fixtures/articles.json');

const metadataPages = [
  {
    route: '/', title: 'Pietro Della Notte Developer',
    description: 'Articoli e appunti di Pietro Della Notte su PHP, JavaScript e sviluppo web, con esempi di codice ed esperienze di lavoro da remoto.',
    image: '/images/profile.jpg', imageAlt: 'Pietro Della Notte', type: 'website',
  },
  {
    route: '/about', title: 'Pietro Della Notte Developer | About',
    description: 'Il percorso di Pietro Della Notte nello sviluppo web, le esperienze professionali, il lavoro da remoto e i contatti.',
    image: '/images/profile.jpg', imageAlt: 'Pietro Della Notte', type: 'website',
  },
  ...postIds.map((id) => ({
    route: `/posts/${id}`, title: articles[id].title,
    description: articles[id].description,
    image: `/images/posts/${id}/${articles[id].coverImage}`,
    imageAlt: articles[id].title, type: 'article',
  })),
];

let server;
let origin;
let logs = '';
const escape = (text) => text.replaceAll('&', '&amp;').replaceAll('"', '&quot;')
  .replaceAll("'", '&#x27;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const title = (html) => html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/)?.[1];

before(async () => {
  server = spawn(process.execPath, [require.resolve('next/dist/bin/next'),
    'start', '-H', '127.0.0.1', '-p', '0'], { stdio: ['ignore', 'pipe', 'pipe'] });
  for (const stream of [server.stdout, server.stderr]) {
    stream.on('data', (data) => {
      logs += data;
      const address = logs.match(/http:\/\/127\.0\.0\.1:(\d+)/);
      if (address) origin = address[0];
    });
  }
  const deadline = Date.now() + 30000;
  while (Date.now() < deadline) {
    if (server.exitCode !== null) throw new Error(`Server exited: ${logs}`);
    if (origin) {
      try { if ((await fetch(origin)).ok) return; } catch { /* not ready yet */ }
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`Production server did not become ready: ${logs}`);
});

after(async () => {
  if (server && server.exitCode === null) {
    const stopped = once(server, 'exit');
    server.kill();
    await stopped;
  }
});

async function page(route, status = 200) {
  const response = await fetch(origin + route, { redirect: 'manual' });
  assert.equal(response.status, status, route);
  const html = await response.text();
  assert.match(html, /<html[^>]*lang="it"/);
  return html;
}

// Parse the quoted attributes emitted by React without decoding twice.
const attributes = (tag) => Object.fromEntries(
  [...tag.matchAll(/([\w:-]+)="([^"]*)"/g)].map((match) => [match[1], match[2]])
);

for (const expected of metadataPages) {
  test(`SSR metadata ${expected.route} is unique, canonical and coherent`, async () => {
    const html = await page(expected.route);
    const head = html.match(/<head\b[^>]*>([\s\S]*?)<\/head>/)[1];
    const metas = [...head.matchAll(/<meta\b[^>]*>/g)].map(([tag]) => attributes(tag));
    const links = [...head.matchAll(/<link\b[^>]*>/g)].map(([tag]) => attributes(tag));
    const canonical = `https://www.pietrodellanotte.dev${expected.route}`;
    const image = `https://www.pietrodellanotte.dev${expected.image}`;

    assert.equal((head.match(/<title\b/g) || []).length, 1);
    assert.equal(title(head), escape(expected.title));
    assert.deepEqual(metas.filter((meta) => meta.name === 'description').map((meta) => meta.content),
      [escape(expected.description)]);
    assert.deepEqual(links.filter((link) => link.rel === 'canonical').map((link) => link.href), [canonical]);

    const social = {
      'og:title': expected.title, 'og:type': expected.type, 'og:url': canonical,
      'og:description': expected.description, 'og:site_name': 'pietrodellanotte.dev',
      'og:image': image, 'og:image:alt': expected.imageAlt,
      'twitter:card': 'summary', 'twitter:title': expected.title,
      'twitter:description': expected.description,
      'twitter:image': image, 'twitter:image:alt': expected.imageAlt,
    };
    for (const [key, value] of Object.entries(social)) {
      assert.deepEqual(metas.filter((meta) => (meta.property || meta.name) === key).map((meta) => meta.content),
        [escape(value)], key);
    }
    assert.doesNotMatch(head, /&amp;#(?:0*39|x0*27);/i);
    assert.doesNotMatch(head, /application\/ld\+json/);

    const canonicalUrl = new URL(canonical);
    assert.equal(canonicalUrl.origin, 'https://www.pietrodellanotte.dev');
    const response = await fetch(origin + canonicalUrl.pathname, { redirect: 'manual' });
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('location'), null);
    await response.text();
    const imageResponse = await fetch(origin + new URL(image).pathname, { redirect: 'manual' });
    assert.equal(imageResponse.status, 200);
    assert.match(imageResponse.headers.get('content-type'), /^image\//);
    await imageResponse.arrayBuffer();

    assert.equal((head.match(/id="Cookiebot"/g) || []).length, 1);
    assert.equal((head.match(/id="google-consent-default"/g) || []).length, 1);
    assert.doesNotMatch(head, /<script[^>]+src="https:\/\/www\.googletagmanager\.com\/gtag\/js/);
  });
}

test('titles and descriptions are distinct across all nine pages', async () => {
  const titles = [];
  const descriptions = [];
  for (const expected of metadataPages) {
    const html = await page(expected.route);
    titles.push(title(html));
    descriptions.push([...html.matchAll(/<meta\b[^>]*>/g)]
      .map(([tag]) => attributes(tag)).find((meta) => meta.name === 'description').content);
  }
  assert.equal(new Set(titles).size, 9);
  assert.equal(new Set(descriptions).size, 9);
});

test('home preserves title, all article links and the static article inventory', async () => {
  const html = await page('/');
  assert.equal(title(html), 'Pietro Della Notte Developer');
  for (const id of postIds) assert.ok(html.includes(`href="/posts/${id}"`), id);
  const manifest = JSON.parse(fs.readFileSync('.next/prerender-manifest.json', 'utf8'));
  assert.deepEqual(Object.keys(manifest.routes).filter((route) => route.startsWith('/posts/')).sort(),
    postIds.map((id) => `/posts/${id}`));
});

test('About preserves its title and contact links', async () => {
  const html = await page('/about');
  assert.equal(title(html), 'Pietro Della Notte Developer | About');
  assert.match(html, /href="mailto:pdellanotte@gmail.com"/);
  assert.match(html, /https:\/\/github.com\/pedrozebra/);
});

test('SSR supplies one consent default before Cookiebot and omits the Google loader', async () => {
  const html = await page('/');
  const head = html.match(/<head\b[^>]*>([\s\S]*?)<\/head>/)[1];
  assert.equal((head.match(/id="Cookiebot"/g) || []).length, 1);
  assert.equal((html.match(/id="google-consent-default"/g) || []).length, 1);
  assert.ok(head.indexOf('id="google-consent-default"') < head.indexOf('id="Cookiebot"'));
  assert.match(head, /id="Cookiebot"[^>]*data-blockingmode="auto"/);
  assert.doesNotMatch(html, /<script[^>]+src="https:\/\/www\.googletagmanager\.com\/gtag\/js/);
  const bootstrap = head.match(/<script[^>]*id="google-consent-default"[^>]*>([\s\S]*?)<\/script>/)[1];
  const browser = {};
  vm.runInNewContext(bootstrap, { window: browser });
  assert.equal(browser.dataLayer.length, 1);
  assert.equal(browser.dataLayer[0][0], 'consent');
  assert.equal(browser.dataLayer[0][1], 'default');
  assert.deepEqual({ ...browser.dataLayer[0][2] }, {
    analytics_storage: 'denied', ad_storage: 'denied',
    ad_user_data: 'denied', ad_personalization: 'denied',
  });
});

for (const id of postIds) {
  test(`article /posts/${id} preserves metadata, body and local images`, async () => {
    const post = articles[id];
    const html = await page(`/posts/${id}`);
    assert.equal(title(html), escape(post.title));
    for (const snippet of [
      `rel="canonical" href="https://www.pietrodellanotte.dev/posts/${id}"`,
      `name="description" content="${escape(post.description)}"`,
      `property="og:title" content="${escape(post.title)}"`,
      `property="og:url" content="https://www.pietrodellanotte.dev/posts/${id}"`,
      `dateTime="${post.date}"`, post.contentHtml,
    ]) assert.ok(html.includes(snippet), `${id}: missing ${snippet.slice(0, 100)}`);
    const image = await fetch(`${origin}/_next/image?url=${encodeURIComponent(`/images/posts/${id}/${post.coverImage}`)}&w=750&q=75`);
    assert.equal(image.status, 200, `${id}: optimized cover`);
    assert.match(image.headers.get('content-type'), /^image\//);
    for (const [, source] of post.contentHtml.matchAll(/<img[^>]+src="([^"]+)"/g)) {
      const imageUrl = new URL(source, origin + `/posts/${id}`);
      assert.equal(imageUrl.origin, origin);
      assert.equal((await fetch(imageUrl)).status, 200, imageUrl.pathname);
    }
  });
}

test('unknown article and unknown page return HTTP 404', async () => {
  await page('/posts/inesistente-regression', 404);
  await page('/inesistente-regression', 404);
});
