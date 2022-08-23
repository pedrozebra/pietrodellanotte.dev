import "../styles/global.css";

import { useEffect } from 'react'
import { useRouter } from 'next/router'
import Script from 'next/script'

import * as ga from '../lib/ga'


const App = ({ Component, pageProps }) => {
  const router = useRouter()
  useEffect(() => {
    const handleRouteChange = (url) => {
      ga.pageview(url)
    }
    router.events.on('routeChangeComplete', handleRouteChange)
    router.events.on('hashChangeComplete', handleRouteChange)
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange)
      router.events.off('hashChangeComplete', handleRouteChange)
    }
  }, [router.events])

  return (
    <>
      {/* Global Site Tag (gtag.js) - Google Analytics */}
      <script id="Cookiebot" src="https://consent.cookiebot.com/uc.js" data-cbid="482f77e0-144e-48bd-94e8-8b3077947fee" data-blockingmode="auto" type="text/javascript"></script>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS}`}
      />
      <Script
        id="gtag-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('consent', 'default', {
              'analytics_storage': 'denied'
            });
            gtag('js', new Date());
            gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS}', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />
      <Script>
        {`
        window.addEventListener('CookiebotOnAccept', function (e) {
          if (Cookiebot.consent.statistics) {
            gtag('consent', 'update', {
              'ad_storage': 'granted'
            });
          }
        }, false);
        window.addEventListener('CookiebotOnDecline', function (e) {
          gtag('consent', 'update', {
            'ad_storage': 'denied'
          });                  
        }, false);

      `}
      </Script>
      <Component {...pageProps} />
    </>
  )
}

export default App