import fs from "fs";
import path from "path";
import matter from "gray-matter";
import remark from "remark";
import html from "remark-html";
import remarkImages from "remark-images";
import { getPostInventory } from "./post-inventory.js";

const postsDirectory = path.join(process.cwd(), "posts");

export function getSortedPostsData() {
  const allPostsData = getPostInventory(postsDirectory);

  return allPostsData.sort((a, b) => {
    if (a.date < b.date) {
      return 1;
    } else {
      return -1;
    }
  });
}

export function getAllPostIds() {
  return getPostInventory(postsDirectory).map(({ id }) => {
    return {
      params: {
        id,
      },
    };
  });
}

export async function getPostData(id) {
  const fullPath = path.join(postsDirectory, `${id}.md`);
  const fileContents = fs.readFileSync(fullPath, "utf8");

  // Use gray-matter to parse the post metadata section
  const matterResult = matter(fileContents);

  // Use remark to convert markdown into HTML string
  const processedContent = await remark()
    .use(html)
    .use(remarkImages)
    .use(require("remark-heading-id"))
    .process(matterResult.content);
  // Make scrollable code explicitly reachable by keyboard.
  const contentHtml = processedContent.toString().replaceAll(
    '<pre>',
    '<pre tabindex="0" role="group" aria-label="Blocco di codice scorrevole">'
  );

  // Combine the data with the id and contentHtml
  return {
    id,
    contentHtml,
    ...matterResult.data,
  };
}
