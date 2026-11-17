const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { execFileSync } = require('node:child_process');
const { postIds } = require('./routes.cjs');
const { sitemapLocations } = require('./sitemap-xml.cjs');

const root = process.cwd();
// Resolve code from the checkout, while fixtures are read from the process cwd.
const moduleUrl = pathToFileURL(path.join(__dirname, '../lib/sitemap.js')).href;
const sitemap = import(moduleUrl);

test('generated sitemap is valid XML, deterministic, complete and canonical', async () => {
  const { generateSitemap } = await sitemap;
  const xml = generateSitemap();
  const urls = sitemapLocations(xml);
  assert.equal(xml, generateSitemap());
  assert.equal(xml, fs.readFileSync('public/sitemap.xml', 'utf8'));
  assert.deepEqual(urls, ['/', '/about', ...postIds.map((id) => `/posts/${id}`)]
    .map((route) => `https://www.pietrodellanotte.dev${route}`));
  assert.equal(new Set(urls).size, urls.length);
  for (const value of urls) {
    const url = new URL(value);
    assert.equal(url.origin, 'https://www.pietrodellanotte.dev');
    assert.equal(url.search + url.hash, '');
  }
  assert.doesNotMatch(xml, /lastmod|changefreq|priority/);
});

test('XML escaping covers every reserved character and malformed XML is rejected', async () => {
  const { escapeXml, generateSitemap } = await sitemap;
  assert.equal(escapeXml('&<>"\''), '&amp;&lt;&gt;&quot;&apos;');
  const xml = generateSitemap();
  for (const malformed of [xml.replace('</url>', '</loc>'), xml.replace('</urlset>', ''),
    xml.replace('/about', '/about?a=1&b=2'), xml + '<extra/>']) {
    assert.throws(() => sitemapLocations(malformed));
  }
});

test('the build generator automatically includes a new Markdown article and ignores unrelated entries', async () => {
  const { generateSitemap } = await sitemap;
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'pdn-sitemap-'));
  try {
    const directory = path.join(temporary, 'posts');
    fs.cpSync(path.join(root, 'posts'), directory, { recursive: true });
    fs.mkdirSync(path.join(temporary, 'public'));
    fs.writeFileSync(path.join(directory, 'new-valid-article.md'),
      '---\ntitle: New article\ncanonical: new-valid-article\ndescription: Test\ndate: "2026-01-01"\n---\n# Test\n');
    fs.writeFileSync(path.join(directory, 'README.txt'), 'Not an article');
    fs.mkdirSync(path.join(directory, 'directory.md'));
    // Run the existing read-only consistency test against a stale sandbox,
    // without invoking the build or the file-writing generator first.
    const sitemapFile = path.join(temporary, 'public/sitemap.xml');
    const versionedXml = fs.readFileSync(path.join(root, 'public/sitemap.xml'));
    fs.writeFileSync(sitemapFile, versionedXml);
    const childEnv = { ...process.env };
    delete childEnv.NODE_TEST_CONTEXT;
    const check = () => execFileSync(process.execPath, ['--test',
      '--test-name-pattern=^generated sitemap is valid XML', __filename],
    { cwd: temporary, env: childEnv, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    assert.throws(check, (error) => error.status === 1
      && /ERR_ASSERTION/.test(error.stdout.toString())
      && /new-valid-article/.test(error.stdout.toString()));
    assert.deepEqual(fs.readFileSync(sitemapFile), versionedXml);
    execFileSync(process.execPath, [path.join(root, 'scripts/generate-sitemap.mjs')],
      { cwd: temporary, stdio: 'pipe' });
    const xml = fs.readFileSync(path.join(temporary, 'public/sitemap.xml'), 'utf8');
    assert.equal(xml, generateSitemap(directory));
    const urls = sitemapLocations(xml);
    assert.equal(urls.length, 10);
    assert.equal(urls.filter((url) => url.endsWith('/posts/new-valid-article')).length, 1);
    const { getPostInventory } = await import(pathToFileURL(path.join(root, 'lib/post-inventory.js')).href);
    assert.equal(getPostInventory(directory).length, 8);
    const loaderUrl = pathToFileURL(path.join(root, 'lib/posts.js')).href;
    const routes = JSON.parse(execFileSync(process.execPath, ['--input-type=module', '-e',
      `import { getAllPostIds } from ${JSON.stringify(loaderUrl)}; console.log(JSON.stringify(getAllPostIds()));`],
    { cwd: temporary, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }));
    assert.deepEqual(routes.map(({ params }) => `https://www.pietrodellanotte.dev/posts/${params.id}`).sort(),
      urls.filter((url) => new URL(url).pathname.startsWith('/posts/')).sort());

    for (const [filename, canonical] of [
      ['wrong-slug.md', 'another-slug'], ['UPPER.md', 'UPPER'],
      ['bad_slug.md', 'bad_slug'], ['bad-url.md', 'https://evil.example/'],
      ['missing-canonical.md', null], ['duplicate.md', 'new-valid-article'],
    ]) {
      const file = path.join(directory, filename);
      fs.writeFileSync(file, `---\ntitle: Invalid\ncanonical: ${canonical}\n---\n`);
      assert.throws(() => generateSitemap(directory), /Invalid article slug or canonical mismatch/);
      fs.unlinkSync(file);
    }
    fs.writeFileSync(path.join(directory, 'reserved.md'), '---\ncanonical: reserved\nid: new-valid-article\n---\n');
    assert.throws(() => generateSitemap(directory), /Reserved frontmatter field id/);
  } finally {
    assert.equal(path.dirname(temporary), os.tmpdir());
    assert.ok(path.basename(temporary).startsWith('pdn-sitemap-'));
    fs.rmSync(temporary, { recursive: true, force: true });
  }
});
