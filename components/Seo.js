import Head from "next/head";
import { name, siteImage, siteName } from "helpers/config";

export default function Seo({
  title,
  description,
  canonical,
  image = siteImage,
  imageAlt = name,
  type = "website",
}) {
  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} key="description" />
      <link rel="canonical" href={canonical} key="canonical" />
      <meta property="og:title" content={title} key="og:title" />
      <meta property="og:type" content={type} key="og:type" />
      <meta property="og:url" content={canonical} key="og:url" />
      <meta property="og:image" content={image} key="og:image" />
      <meta property="og:image:alt" content={imageAlt} key="og:image:alt" />
      <meta property="og:description" content={description} key="og:description" />
      <meta property="og:site_name" content={siteName} key="og:site_name" />
      <meta name="twitter:card" content="summary" key="twitter:card" />
      <meta name="twitter:title" content={title} key="twitter:title" />
      <meta name="twitter:description" content={description} key="twitter:description" />
      <meta name="twitter:image" content={image} key="twitter:image" />
      <meta name="twitter:image:alt" content={imageAlt} key="twitter:image:alt" />
    </Head>
  );
}
