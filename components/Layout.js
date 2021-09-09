import Head from 'next/head'
import Image from 'next/image'
import styles from './Layout.module.css'
import utilStyles from '../styles/utils.module.css'
import Link from 'next/link'
import { name } from '../helpers/config';

export default function Layout({ children, home, postImage, postCanonical }) {
  const imagePostPath="/images/posts/"+postCanonical+"/";
  return (
    <div className={styles.container}>
      <Head>
         {/* Global Site Tag (gtag.js) - Google Analytics */}
         <script
            async
            src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS}`}
          />
          <script
            dangerouslySetInnerHTML={{
              __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS}', {
              page_path: window.location.pathname,
            });
          `,
            }}
          />
        <link rel="icon" href="/favicon.ico" />
        <meta
          name="description"
          content="Pietro Della Notte, sviluppatore web sempre alla ricerca di migliorarsi. Remote worker convinto e papà user friendly."
        />
      </Head>
      <header className={styles.header}>
        {home ? (
          <>
            <Image
              priority
              src="/images/profile.jpg"
              className={utilStyles.borderCircle}
              height={144}
              width={144}
              alt={name}
              title={name}
            />
            <h1 className={utilStyles.heading2Xl}>{name}</h1>
          </>
        ) : (
          <>
           
                <Image
                  priority
                  src= {imagePostPath+postImage}                  
                  height={300}
                  width={650}
                  alt={postCanonical}
                  title={postCanonical}
                />
             
            <h2 className={utilStyles.headingLg}>
              <Link href="/">
                <a className={utilStyles.colorInherit}>← Torna alla home</a>
              </Link>
            </h2>
          </>
        )}
      </header>
      <main>{children}</main>
      {!home && (
        <div className={styles.backToHome}>
          <Link href="/">
            <a>← Torna alla home</a>
          </Link>
        </div>
      )}
    </div>
  )
}