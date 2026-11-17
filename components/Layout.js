import Head from "next/head";
import Image from "next/image";
import utilStyles from "styles/utils.module.css";
import Link from "next/link";
import { name } from "helpers/config";
import Navigation from "./Navigation";

export default function Layout({
  children,
  home,
  postPage,
  postImage,
  postCanonical,
}) {
  const imagePostPath = "/images/posts/" + postCanonical + "/";
  return (
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
          {home && (
            <>
              <Image
                preload
                src="/images/profile.jpg"
                className={utilStyles.borderCircle}
                height={2211}
                width={1658}
                sizes="144px"
                style={{ width: 144, height: "auto" }}
                alt={name}
                title={name}
              />
              <h1 className="font-bold text-lg">{name}</h1>
            </>
          )}
          {postPage && (
            <>
              <Image
                preload
                src={imagePostPath + postImage}
                height={300}
                width={650}
                style={{ width: 650, height: "auto", aspectRatio: "650 / 300" }}
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
}
