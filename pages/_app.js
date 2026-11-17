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
    const handleRouteChange = () => analytics.pageview();
    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      stop();
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

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
