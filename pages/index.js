import Head from "next/head";
import Layout from "../components/Layout";
import utilStyles from "../styles/utils.module.css";
import Link from "next/link";
import Date from "../components/date";
import { siteTitle } from "../helpers/config";
import { getSortedPostsData } from "../lib/posts";

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
    <Layout home={true}>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      <section className={utilStyles.headingMd}>
        <p className="text-base">Sviluppatore web sempre alla ricerca di migliorarsi.</p>
        <p className="text-base">Remote worker convinto e papà user friendly 👨‍👦</p>
      </section>
     { <section className={`${utilStyles.headingMd} ${utilStyles.padding1px}`}>
        <h2 className='my-8 text-base font-bold'>Blog</h2>
        <ul className={utilStyles.list}>
          {allPostsData.map(({ id, date, title }) => (
            <li className={utilStyles.listItem} key={id}>
              <Link href={`/posts/${id}`} passHref>
                <a className="text-indigo-500">{title}</a>
              </Link>
              <br />
              <small className={utilStyles.lightText}>
                <Date dateString={date} />
              </small>
            </li>
          ))}
        </ul>
      </section> }
    </Layout>
  );
}
