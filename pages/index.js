import Seo from "components/Seo";
import Layout from "components/Layout";
import styles from "styles/home.module.css";
import Image from "next/image";
import Link from "next/link";
import Date from "components/date";
import { name, siteTitle, homeDescription, siteUrl } from "helpers/config";
import { getSortedPostsData } from "lib/posts";

export async function getStaticProps() {
  const allPostsData = getSortedPostsData();
  return {
    props: {
      allPostsData,
    },
  };
}

export default function Home({ allPostsData }) {
  return (
    <Layout home={true} className={styles.page}>
      <Seo title={siteTitle} description={homeDescription} canonical={`${siteUrl}/`} />
      <section className={styles.introduction} aria-labelledby="home-title">
        <div className={styles.identity}>
          <Image
            preload
            src="/images/profile.jpg"
            width={1658}
            height={2211}
            sizes="56px"
            style={{ width: 56, height: "auto" }}
            className={styles.portrait}
            alt={name}
            title={name}
          />
          <h1 id="home-title">{name}</h1>
        </div>
        <p>
          Senior Backend Engineer.<br />
          PHP, Laravel, Yii2 e MySQL.
        </p>
      </section>
      {
        <section id="articoli" aria-labelledby="articles-title">
          <h2 id="articles-title" className={styles.articlesTitle}>Articoli</h2>
          <ul className={styles.list}>
            {allPostsData.map(({ id, date, title }) => (
              <li className={styles.listItem} key={id}>
                <Link href={`/posts/${id}`}>
                  {title}
                </Link>
                <div className={styles.date}>
                  <Date dateString={date} />
                </div>
              </li>
            ))}
          </ul>
        </section>
      }
    </Layout>
  );
}
