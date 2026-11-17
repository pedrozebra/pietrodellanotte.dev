import Layout from "components/Layout";
import Date from "components/date";
import { getAllPostIds, getPostData } from "lib/posts";
import Seo from "components/Seo";
import utilStyles from "styles/utils.module.css";
import { useRouter } from "next/router";
import { siteImagesUrl, postUrl } from "helpers/config";
import Link from "next/link";

export default function Post({ postData }) {
  const router = useRouter();
  const postImageUrl =
    siteImagesUrl + postData.canonical + "/" + postData.coverImage;
  return (
    <Layout
      home={false}
      postPage={true}
      postImage={postData.coverImage}
      postCanonical={postData.canonical}
    >
      <Seo
        title={postData.title}
        description={postData.description}
        canonical={postUrl + postData.canonical}
        image={postImageUrl}
        imageAlt={postData.title}
        type="article"
      />
      <article>
        <h1 className="mb-3 text-gray-900 dark:text-white">{postData.title}</h1>
        <div className="mb-10 text-sm text-gray-500 dark:text-gray-400">
          <Date dateString={postData.date} /> <span>{postData.time}</span>
        </div>
        <div
          className="prose"
          dangerouslySetInnerHTML={{ __html: postData.contentHtml }}
        />
      </article>
      <p className="mt-5">
        <Link
          href="/"
          className={utilStyles.colorInherit}
          title="Torna alla Home"
        >
          ← Home
        </Link>
      </p>
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
