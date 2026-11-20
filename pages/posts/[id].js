import Layout from "components/Layout";
import Date from "components/date";
import { getAllPostIds, getPostData } from "lib/posts";
import Seo from "components/Seo";
import styles from "styles/article.module.css";
import Image from "next/image";
import { siteImagesUrl, postUrl } from "helpers/config";
import Link from "next/link";

export default function Post({ postData }) {
  const postImageUrl =
    siteImagesUrl + postData.canonical + "/" + postData.coverImage;
  return (
    <Layout className={styles.page}>
      <Seo
        title={postData.title}
        description={postData.description}
        canonical={postUrl + postData.canonical}
        image={postImageUrl}
        imageAlt={postData.title}
        type="article"
      />
      <article className={styles.article}>
        <header className={styles.header}>
          <h1>{postData.title}</h1>
          <div className={styles.date}>
            <Date dateString={postData.date} /> <span>{postData.time}</span>
          </div>
          <Image
            preload
            src={"/images/posts/" + postData.canonical + "/" + postData.coverImage}
            height={512}
            width={1024}
            sizes="(max-width: 400px) calc(100vw - 40px), 360px"
            style={{ width: 360, maxWidth: "100%", height: "auto" }}
            alt={postData.canonical}
            title={postData.canonical}
          />
        </header>
        <div
          className="prose dark:prose-dark"
          dangerouslySetInnerHTML={{ __html: postData.contentHtml }}
        />
        <p className={styles.returnHome}>
          <Link
            href="/"
            title="Torna alla Home"
            aria-label="Torna alla Home"
          >
            ← Home
          </Link>
        </p>
      </article>
    </Layout>
  );
}

export async function getStaticPaths() {
  const paths = getAllPostIds();
  return {
    paths,
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  const postData = await getPostData(params.id);
  return {
    props: {
      postData,
    },
  };
}
