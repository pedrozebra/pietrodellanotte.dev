import Head from "next/head";
import Image from "next/image";
import utilStyles from "styles/utils.module.css";
import Link from "next/link";
import Navigation from "./Navigation";

export default function Layout({
  children,
  home,
  postPage,
  postImage,
  postCanonical,
  className,
}) {
  const imagePostPath = "/images/posts/" + postCanonical + "/";
  const layout = (
    <>
      <a href="#main-content" className="skip-link">Salta al contenuto</a>
      <Head>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <header>
        <div className="max-w-5xl px-8 mx-auto">
          <div className="flex items-center justify-between py-6">
            <Navigation home={home} postPage={postPage} />
          </div>
          {postPage && (
            <>
              <Image
                preload
                src={imagePostPath + postImage}
                height={512}
                width={1024}
                sizes="(max-width: 713px) calc(100vw - 64px), 650px"
                style={{ width: 650, maxWidth: "100%", height: "auto" }}
                alt={postCanonical}
                title={postCanonical}
              />
              <div className={utilStyles.headingLg}>
                <Link
                  href="/"
                  className={utilStyles.colorInherit}
                  title="Torna alla Home"
                  aria-label="Torna alla Home"
                >
                  ←
                </Link>
              </div>
            </>
          )}
        </div>
      </header>
      <main id="main-content" tabIndex={-1}>
        <div className="max-w-5xl px-8 py-4 mx-auto">{children}</div>
      </main>
    </>
  );
  return className ? <div className={className}>{layout}</div> : layout;
}
