import { siteUrl } from "../helpers/config.js";
import { getPostInventory } from "./post-inventory.js";

export function escapeXml(value) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&apos;");
}

export function generateSitemap(directory) {
  const urls = ["/", "/about", ...getPostInventory(directory).map(({ id }) => `/posts/${id}`)]
    .map((pathname) => new URL(pathname, siteUrl).href);
  if (new Set(urls).size !== urls.length) throw new Error("Duplicate sitemap URLs");
  return '<?xml version="1.0" encoding="UTF-8"?>\n'
    + '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    + urls.map((url) => `  <url><loc>${escapeXml(url)}</loc></url>`).join("\n")
    + "\n</urlset>\n";
}
