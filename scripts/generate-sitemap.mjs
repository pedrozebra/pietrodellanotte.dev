import fs from "node:fs";
import { generateSitemap } from "../lib/sitemap.js";

fs.writeFileSync("public/sitemap.xml", generateSitemap());
console.log("Generated public/sitemap.xml from the Markdown inventory");
