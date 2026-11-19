import fs from "fs";
import path from "path";

// Only local editorial PNGs are enriched. Keep sanitized HTML and historical URLs.
// Other formats and remote images remain untouched until their delivery is audited.
export function optimizeMarkdownImages(contentHtml) {
  return contentHtml.replace(/<img\b[^>]*>/g, (tag) => {
    const source = tag.match(/\bsrc="(\.\.\/images\/posts\/([a-z0-9-]+)\/([a-zA-Z0-9_-]+\.png))"/);
    if (!source) return tag;
    const filename = path.join(process.cwd(), "public/images/posts", source[2], source[3]);
    const data = fs.readFileSync(filename);
    // PNG signature and IHDR dimensions; no image library or client runtime needed.
    if (data.length < 24 || data.subarray(0, 8).toString("hex") !== "89504e470d0a1a0a" ||
        data.subarray(12, 16).toString() !== "IHDR") {
      throw new Error(`Invalid Markdown PNG: ${source[1]}`);
    }
    const width = data.readUInt32BE(16);
    const height = data.readUInt32BE(20);
    if (!width || !height) throw new Error(`Invalid PNG dimensions: ${source[1]}`);
    return tag.replace(/\s*\/?>$/, ` width="${width}" height="${height}" loading="lazy" decoding="async">`);
  });
}
