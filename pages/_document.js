import Document, { Html, Head, Main, NextScript } from 'next/document'

class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx)
    return { ...initialProps }
  }

  render() {
    return (
      <Html lang="it">
        <Head>
          <script
            id="google-consent-default"
            data-cookieconsent="ignore"
            dangerouslySetInnerHTML={{ __html: `
              window.dataLayer = window.dataLayer || [];
              window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
              window.gtag('consent', 'default', {
                analytics_storage: 'denied',
                ad_storage: 'denied',
                ad_user_data: 'denied',
                ad_personalization: 'denied'
              });
            ` }}
          />
          <script
            id="Cookiebot"
            src="https://consent.cookiebot.com/uc.js"
            data-cbid="482f77e0-144e-48bd-94e8-8b3077947fee"
            data-blockingmode="auto"
            type="text/javascript"
          />
        </Head>
        <body className="text-gray-900 font-body ">
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default MyDocument
