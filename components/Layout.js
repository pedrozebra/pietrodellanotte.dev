import Head from "next/head";
import Navigation from "./Navigation";
import editorialStyles from "styles/editorial.module.css";

export default function Layout({
  children,
  className,
}) {
  const layout = (
    <>
      <a href="#main-content" className="skip-link">Salta al contenuto</a>
      <Head>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <header>
        <div className="max-w-5xl px-8 mx-auto">
          <div className={className ? "flex items-center justify-between py-6" : editorialStyles.navigationRow}>
            <Navigation />
          </div>
        </div>
      </header>
      <main id="main-content" tabIndex={-1}>
        <div className="max-w-5xl px-8 py-4 mx-auto">{children}</div>
      </main>
    </>
  );
  return className ? <div className={className}>{layout}</div> : layout;
}
