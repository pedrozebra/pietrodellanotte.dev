const assert = require('node:assert/strict');

// Validate the complete, intentionally small XML vocabulary emitted by our generator.
// Anchoring the grammar rejects malformed XML, extra elements and unescaped entities.
function sitemapLocations(xml) {
  const text = '(?:[^<>&"\x00-\x1f]|&(?:amp|lt|gt|quot|apos);)+';
  const entry = `  <url><loc>${text}</loc></url>\n`;
  assert.match(xml, new RegExp('^<\\?xml version="1.0" encoding="UTF-8"\\?>\\n'
    + '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\\n'
    + `(?:${entry})+</urlset>\\n$`));
  const entities = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map(([, value]) => value.replace(/&(amp|lt|gt|quot|apos);/g, (_, name) => entities[name]));
}

module.exports = { sitemapLocations };
