// State belongs to the document, so React remounts do not initialize GA twice.
export function createAnalytics(browser, measurementId) {
  let allowed = false;
  let loaded = false;
  let initialized = false;
  let reloadRequested = false;
  let lastPage = null;

  const hasConsent = () => Boolean(
    measurementId && !reloadRequested &&
    browser.Cookiebot?.consent?.statistics === true
  );

  function syncConsent() {
    const previouslyAllowed = allowed;
    allowed = hasConsent();
    if (measurementId) browser[`ga-disable-${measurementId}`] = !allowed;

    if (previouslyAllowed && !allowed && !reloadRequested) {
      reloadRequested = true;
      browser.location.reload();
    }
    return allowed;
  }

  function canSend() {
    return syncConsent() && initialized && typeof browser.gtag === 'function';
  }

  function cleanUrl(url) {
    if (!url) return '';
    const parsed = new URL(url, browser.location.href);
    return parsed.origin + parsed.pathname;
  }

  function pageview() {
    if (!canSend()) return;
    const currentPage = cleanUrl(browser.location.href);
    if (currentPage === lastPage) return;

    browser.gtag('event', 'page_view', {
      send_to: measurementId,
      page_location: currentPage,
      page_title: browser.document.title,
      page_referrer: lastPage || cleanUrl(browser.document.referrer),
    });
    lastPage = currentPage;
  }

  function initialize() {
    if (!syncConsent() || !loaded || typeof browser.gtag !== 'function') return;
    if (!initialized) {
      browser.gtag('js', new Date());
      browser.gtag('config', measurementId, { send_page_view: false });
      initialized = true;
    }
    pageview();
  }

  return {
    start(onConsentChange) {
      let active = true;
      const synchronize = () => {
        onConsentChange(syncConsent());
        // Cookiebot may emit Accept before finishing its consent update.
        queueMicrotask(() => { if (active) initialize(); });
      };
      const events = ['CookiebotOnConsentReady', 'CookiebotOnAccept', 'CookiebotOnDecline'];
      events.forEach((name) => browser.addEventListener(name, synchronize));
      synchronize();
      return () => {
        active = false;
        events.forEach((name) => browser.removeEventListener(name, synchronize));
      };
    },
    onReady() {
      loaded = true;
      initialize();
    },
    pageview,
    event({ action, params }) {
      if (canSend()) browser.gtag('event', action, { ...params, send_to: measurementId });
    },
  };
}

export const measurementId = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS;
let analytics;

export function getAnalytics() {
  if (typeof window === 'undefined') return null;
  if (!analytics) analytics = createAnalytics(window, measurementId);
  return analytics;
}

export const pageview = () => getAnalytics()?.pageview();
export const event = (details) => getAnalytics()?.event(details);
