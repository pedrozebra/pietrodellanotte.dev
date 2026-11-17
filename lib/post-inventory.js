import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

// Shared by static routes, the home page and the build-time sitemap.
export function getPostInventory(directory = path.join(process.cwd(), "posts")) {
  return fs.readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
    .sort((a, b) => a.name.localeCompare(b.name, "en"))
    .map(({ name }) => {
      const id = name.slice(0, -3);
      const { data } = matter(fs.readFileSync(path.join(directory, name), "utf8"));
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id) || data.canonical !== id) {
        throw new Error(`Invalid article slug or canonical mismatch: ${name}`);
      }
      if (Object.hasOwn(data, "id")) {
        throw new Error(`Reserved frontmatter field id: ${name}`);
      }
      return { ...data, id };
    });
}
