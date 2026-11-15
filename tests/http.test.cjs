const { before, after, test } = require('node:test');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const { once } = require('node:events');
const { postIds } = require('./routes.cjs');
const articles = require('./fixtures/articles.json');

let server;
let origin;
let logs = '';
const escape = (text) => text.replaceAll('&', '&amp;').replaceAll('"', '&quot;')
  .replaceAll("'", '&#x27;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const title = (html) => html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/)?.[1];

before(async () => {
  server = spawn(process.execPath, [require.resolve('next/dist/bin/next'),
    'start', '-H', '127.0.0.1', '-p', '0'], { stdio: ['ignore', 'pipe', 'pipe'] });
  for (const stream of [server.stdout, server.stderr]) {
    stream.on('data', (data) => {
      logs += data;
      const address = logs.match(/http:\/\/127\.0\.0\.1:(\d+)/);
      if (address) origin = address[0];
    });
  }
  const deadline = Date.now() + 30000;
  while (Date.now() < deadline) {
    if (server.exitCode !== null) throw new Error(`Server exited: ${logs}`);
    if (origin) {
      try { if ((await fetch(origin)).ok) return; } catch { /* not ready yet */ }
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`Production server did not become ready: ${logs}`);
});

after(async () => {
  if (server && server.exitCode === null) {
    const stopped = once(server, 'exit');
    server.kill();
    await stopped;
  }
});

async function page(route, status = 200) {
  const response = await fetch(origin + route, { redirect: 'manual' });
  assert.equal(response.status, status, route);
  const html = await response.text();
  assert.match(html, /<html[^>]*lang="it"/);
  return html;
}

test('home preserves title, all article links and the static article inventory', async () => {
  const html = await page('/');
  assert.equal(title(html), 'Pietro Della Notte Developer');
  for (const id of postIds) assert.ok(html.includes(`href="/posts/${id}"`), id);
  const manifest = JSON.parse(fs.readFileSync('.next/prerender-manifest.json', 'utf8'));
  assert.deepEqual(Object.keys(manifest.routes).filter((route) => route.startsWith('/posts/')).sort(),
    postIds.map((id) => `/posts/${id}`));
});

test('About preserves its title and contact links', async () => {
  const html = await page('/about');
  assert.equal(title(html), 'Pietro Della Notte Developer | About');
  assert.match(html, /href="mailto:pdellanotte@gmail.com"/);
  assert.match(html, /https:\/\/github.com\/pedrozebra/);
});

for (const id of postIds) {
  test(`article /posts/${id} preserves metadata, body and local images`, async () => {
    const post = articles[id];
    const html = await page(`/posts/${id}`);
    assert.equal(title(html), escape(post.title));
    for (const snippet of [
      `rel="canonical" href="https://www.pietrodellanotte.dev/posts/${id}"`,
      `name="description" content="${escape(post.description)}"`,
      `property="og:title" content="${escape(post.title)}"`,
      `property="og:url" content="https://www.pietrodellanotte.dev/posts/${id}"`,
      `dateTime="${post.date}"`, post.contentHtml,
    ]) assert.ok(html.includes(snippet), `${id}: missing ${snippet.slice(0, 100)}`);
    const image = await fetch(`${origin}/_next/image?url=${encodeURIComponent(`/images/posts/${id}/${post.coverImage}`)}&w=750&q=75`);
    assert.equal(image.status, 200, `${id}: optimized cover`);
    assert.match(image.headers.get('content-type'), /^image\//);
    for (const [, source] of post.contentHtml.matchAll(/<img[^>]+src="([^"]+)"/g)) {
      const imageUrl = new URL(source, origin + `/posts/${id}`);
      assert.equal(imageUrl.origin, origin);
      assert.equal((await fetch(imageUrl)).status, 200, imageUrl.pathname);
    }
  });
}

test('unknown article and unknown page return HTTP 404', async () => {
  await page('/posts/inesistente-regression', 404);
  await page('/inesistente-regression', 404);
});
