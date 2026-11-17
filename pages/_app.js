import "../styles/global.css";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Script from 'next/script';
import * as ga from '../lib/ga';

const App = ({ Component, pageProps }) => {
  const router = useRouter();
  const [analyticsAllowed, setAnalyticsAllowed] = useState(false);

  useEffect(() => {
    const analytics = ga.getAnalytics();
    const stop = analytics.start(setAnalyticsAllowed);
    return stop;
  }, []);

  // Child next/head effects have flushed before this parent effect runs.
  useEffect(() => {
    ga.getAnalytics().commitPage(router.asPath, document.title);
  }, [router.asPath, Component, pageProps]);

  return (
    <>
      {analyticsAllowed && (
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=${ga.measurementId}`}
          onReady={() => ga.getAnalytics().onReady()}
        />
      )}
      <Component {...pageProps} />
    </>
  );
};

export default App;
