const { test, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { createRequire } = require('node:module');
const { postIds } = require('./routes.cjs');

// Run the real loader against a temporary content directory, never editing posts/.
const root = process.cwd();
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'pdn-markdown-test-'));
fs.cpSync(path.join(root, 'posts'), path.join(temporary, 'posts'), { recursive: true });
fs.cpSync(path.join(root, 'public/images'), path.join(temporary, 'public/images'), { recursive: true });
const loaderUrl = pathToFileURL(path.join(root, 'lib/posts.js'));
// The existing loader mixes ES imports and CommonJS require; preserve it this phase.
globalThis.require = createRequire(loaderUrl);
process.chdir(temporary);
const loader = import(loaderUrl.href);
after(async () => {
  await loader;
  process.chdir(root);
  assert.equal(path.dirname(temporary), os.tmpdir());
  assert.ok(path.basename(temporary).startsWith('pdn-markdown-test-'));
  fs.rmSync(temporary, { recursive: true, force: true });
});

test('the seven historical article IDs remain available', async () => {
  const { getAllPostIds } = await loader;
  assert.deepEqual(getAllPostIds().map(({ params }) => params.id).sort(), postIds);
});

test('all existing articles preserve metadata, rendered Markdown and cover assets', async () => {
  const { getPostData } = await loader;
  const baseline = require('./fixtures/articles.json');
  for (const id of postIds) {
    const post = await getPostData(id);
    assert.equal(post.id, id);
    assert.equal(post.canonical, id);
    for (const field of ['title', 'description', 'date', 'time', 'coverImage']) {
      assert.equal(post[field], baseline[id][field], `${id}: ${field}`);
    }
    const originalHtml = post.contentHtml.replace(/ width="\d+" height="\d+" loading="lazy" decoding="async"/g, '');
    assert.equal(originalHtml, baseline[id].contentHtml, `${id}: editorial Markdown changed`);
    for (const [tag, source, width, height] of post.contentHtml.matchAll(/<img[^>]*src="([^"]+)"[^>]*width="(\d+)" height="(\d+)" loading="lazy" decoding="async"[^>]*>/g)) {
      const data = fs.readFileSync(path.join(temporary, 'public', source.replace('../', '')));
      assert.equal(Number(width), data.readUInt32BE(16), tag);
      assert.equal(Number(height), data.readUInt32BE(20), tag);
    }
    assert.equal((post.contentHtml.match(/loading="lazy"/g) || []).length,
      (baseline[id].contentHtml.match(/<img\b/g) || []).length);
    assert.ok(fs.existsSync(path.join(root, 'public/images/posts', id, post.coverImage)));
    const cover = fs.readFileSync(path.join(root, 'public/images/posts', id, post.coverImage));
    assert.equal(cover.readUInt32BE(16), 1024, `${id}: cover width used by Layout`);
    assert.equal(cover.readUInt32BE(20), 512, `${id}: cover height used by Layout`);
  }
});

test('image enrichment leaves remote, traversal and unsupported sources untouched', async () => {
  const { optimizeMarkdownImages } = await import(pathToFileURL(path.join(root, 'lib/markdown-images.js')).href);
  for (const source of ['https://example.com/a.png', '../images/posts/../../private.png',
    '../images/posts/test/photo.jpg', 'data:image/png;base64,AA']) {
    const html = `<img src="${source}" alt="unchanged">`;
    assert.equal(optimizeMarkdownImages(html), html);
  }
  const directory = path.join(temporary, 'public/images/posts/test');
  fs.mkdirSync(directory, { recursive: true });
  fs.writeFileSync(path.join(directory, 'invalid.png'), 'not a PNG');
  assert.throws(() => optimizeMarkdownImages('<img src="../images/posts/test/invalid.png">'), /Invalid Markdown PNG/);
});

test('image enrichment reads only the actual src attribute regardless of attribute order', async () => {
  const { optimizeMarkdownImages } = await import(pathToFileURL(path.join(root, 'lib/markdown-images.js')).href);
  const source = '../images/posts/il-mio-miglior-snippet-di-codice-in-assoluto/diegoluna.png';
  const added = ' width="300" height="468" loading="lazy" decoding="async">';
  for (const html of [
    `<img data-src="${source}" alt="unchanged">`,
    '<img alt="no source">',
    `<img alt='text src="${source}"'>`,
    `<img data-src="${source}" src="https://example.com/photo.png" alt="remote">`,
    `<img src="../images/posts/../../private.png" data-src="${source}">`,
  ]) assert.equal(optimizeMarkdownImages(html), html);
  for (const html of [
    `<img src="${source}" alt="unchanged">`,
    `<img alt="unchanged" src="${source}" title="image">`,
    `<img data-src="../images/posts/missing/decoy.png" alt="unchanged" src="${source}">`,
    `<img src="${source}" data-src="../images/posts/missing/decoy.png">`,
    `<img\nalt="unchanged"\nsrc = "${source}">`,
    `<img alt='text src="../images/posts/missing/decoy.png"' src="${source}">`,
  ]) assert.equal(optimizeMarkdownImages(html), html.replace(/>$/, added));
});

test('PNG header reads reject truncated IHDR and zero dimensions', async () => {
  const { optimizeMarkdownImages } = await import(pathToFileURL(path.join(root, 'lib/markdown-images.js')).href);
  const original = fs.readFileSync(path.join(temporary, 'public/images/posts/il-mio-miglior-snippet-di-codice-in-assoluto/diegoluna.png'));
  const directory = path.join(temporary, 'public/images/posts/header-test');
  fs.mkdirSync(directory);
  fs.writeFileSync(path.join(directory, 'truncated.png'), original.subarray(0, 23));
  assert.throws(() => optimizeMarkdownImages('<img src="../images/posts/header-test/truncated.png">'), /Invalid Markdown PNG/);
  const zero = Buffer.from(original.subarray(0, 24));
  zero.writeUInt32BE(0, 16);
  fs.writeFileSync(path.join(directory, 'zero.png'), zero);
  assert.throws(() => optimizeMarkdownImages('<img src="../images/posts/header-test/zero.png">'), /Invalid PNG dimensions/);
});

test('the real Markdown loader removes executable HTML and unsafe links', async () => {
  const { getPostData } = await loader;
  fs.writeFileSync(path.join(temporary, 'posts/security-fixture.md'), [
    '---', 'title: Security fixture', '---',
    '<script>alert(1)</script>', '',
    '<img src=x onerror=alert(1)>', '',
    '[unsafe](javascript:alert%281%29)', '',
    '## Safe heading {#safe-heading}', '',
    '```php', '<?php echo "safe";', '```',
  ].join('\n'));
  const { contentHtml } = await getPostData('security-fixture');
  assert.doesNotMatch(contentHtml, /<script|onerror|href="javascript:/i);
  assert.match(contentHtml, /id="user-content-safe-heading"/);
  assert.match(contentHtml, /<pre tabindex="0" role="group" aria-label="Blocco di codice scorrevole"><code>/);
  assert.match(contentHtml, /&#x3C;\?php/);
});
