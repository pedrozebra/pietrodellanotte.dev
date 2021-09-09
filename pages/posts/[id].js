import Layout from "../../components/Layout";
import Date from "../../components/date";
import { getAllPostIds, getPostData } from "../../lib/posts";
import Head from "next/head";
import utilStyles from "../../styles/utils.module.css";
import { useRouter } from 'next/router'
import { siteImagesUrl, postUrl, siteName } from '../../helpers/config';

export default function Post({ postData }) {
  const router = useRouter();
  const postImageUrl = siteImagesUrl+postData.canonical+'/'+postData.coverImage;
  return (
    <Layout home={false} postImage={postData.coverImage} postCanonical={postData.canonical}>
      <Head>
        <title>{postData.title}</title>
        <link rel="canonical" href={postUrl+postData.canonical}></link>
        <meta name="description" content={postData.description} />

        <meta property="og:title" content={postData.title} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={postUrl+postData.canonical} />
        <meta property="og:image" content={postImageUrl} />
        <meta property="og:image:alt" content={postData.title} />
        <meta property="og:description" content={postData.description} />
        <meta property="og:site_name" content={siteName} />

        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={postData.title} />
        <meta name="twitter:description" content={postData.description} />
        <meta name="twitter:image" content={postImageUrl} />
        <meta name="twitter:image:alt" content={postData.title} />
      </Head>
      <article>
        <h1 className={utilStyles.headingXl}>{postData.title}</h1>
        <div className={utilStyles.lightText}>
          <Date dateString={postData.date} /> <span>{postData.time}</span>
        </div>
        <div dangerouslySetInnerHTML={{ __html: postData.contentHtml }} />
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
