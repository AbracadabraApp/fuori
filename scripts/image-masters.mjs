/**
 * The picture masters (the JPEGs and recordings under public/images) kept in
 * R2 at masters/<path>, since git no longer holds them (Josh, 2026-11-06: the
 * deploy copied 868 MB of them on every push; "why have them in the build at
 * all"). The app never reads these: it reads the WebP files that
 * scripts/upload-images.mjs makes from them and lists in
 * content/<country>/images.json. The masters are what a picture is made again
 * from (a new size or quality), and what another machine needs to run
 * images:upload on an old picture.
 *
 *   node --env-file=.env.local scripts/image-masters.mjs         back up: send any master R2 doesn't have yet
 *   node --env-file=.env.local scripts/image-masters.mjs --pull  bring down any master this machine doesn't have
 *   … --untrack   after backing up, take every master that's safely in R2 out of git
 *                 (git rm --cached: the file stays on this machine)
 *   … --dry                                                      list what would move
 *
 * New pictures from a session that can't reach R2 (the cloud): it commits the
 * new JPEGs with git add -f (public/images is in .gitignore); on the laptop,
 * npm run images:upload, then this script with --untrack, then commit.
 *
 * A file counts as already there when R2 has the same path at the same size.
 * Needs R2_ACCOUNT_ID, R2_BUCKET, R2_ACCESS_KEY_ID and R2_SECRET_ACCESS_KEY
 * (.env.local), as images:upload does.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execFileSync } from 'child_process';
import { AwsClient } from 'aws4fetch';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIR = path.join(ROOT, 'public', 'images');
const PREFIX = 'masters/';
const CONCURRENCY = 8;
const TYPES = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.mp3': 'audio/mpeg' };

const pull = process.argv.includes('--pull');
const dry = process.argv.includes('--dry');
const untrack = process.argv.includes('--untrack');

const missingEnv = ['R2_ACCOUNT_ID', 'R2_BUCKET', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY'].filter((k) => !process.env[k]);
if (missingEnv.length) throw new Error(`Missing ${missingEnv.join(', ')} (see .env.local)`);
const r2 = new AwsClient({ accessKeyId: process.env.R2_ACCESS_KEY_ID, secretAccessKey: process.env.R2_SECRET_ACCESS_KEY, service: 's3', region: 'auto' });
const endpoint = `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${process.env.R2_BUCKET}`;

/** Every master in R2: path under public/images → size */
async function remote() {
  const out = new Map();
  let token = '';
  do {
    const q = new URLSearchParams({ 'list-type': '2', prefix: PREFIX, 'max-keys': '1000', ...(token ? { 'continuation-token': token } : {}) });
    const res = await r2.fetch(`${endpoint}?${q}`);
    if (!res.ok) throw new Error(`LIST → ${res.status} ${(await res.text()).slice(0, 200)}`);
    const xml = await res.text();
    for (const m of xml.matchAll(/<Contents>.*?<Key>(.*?)<\/Key>.*?<Size>(\d+)<\/Size>.*?<\/Contents>/gs)) out.set(m[1].slice(PREFIX.length).replace(/&amp;/g, '&'), Number(m[2]));
    token = xml.match(/<NextContinuationToken>(.*?)<\/NextContinuationToken>/)?.[1] ?? '';
  } while (token);
  return out;
}

/** Every master on this machine: path under public/images → size */
function local() {
  const out = new Map();
  const walk = (d) => {
    if (!fs.existsSync(d)) return;
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      if (e.name.startsWith('.')) continue;
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p);
      else out.set(path.relative(DIR, p).split(path.sep).join('/'), fs.statSync(p).size);
    }
  };
  walk(DIR);
  return out;
}

const [there, here] = [await remote(), local()];
const todo = pull
  ? [...there].filter(([p, size]) => here.get(p) !== size).map(([p]) => p)
  : [...here].filter(([p, size]) => there.get(p) !== size).map(([p]) => p);
const bytes = todo.reduce((n, p) => n + ((pull ? there : here).get(p) ?? 0), 0);
console.log(`${pull ? 'Pull' : 'Back up'}: ${todo.length} file(s), ${(bytes / 1e6).toFixed(1)} MB${dry ? ' (dry run)' : ''}; R2 has ${there.size}, this machine ${here.size}`);
if (dry) {
  for (const p of todo.slice(0, 20)) console.log(`  ${p}`);
  process.exit(0);
}

const failed = [];
let done = 0;
const queue = [...todo];
await Promise.all(Array.from({ length: CONCURRENCY }, async () => {
  for (let p = queue.shift(); p; p = queue.shift()) {
    const url = `${endpoint}/${PREFIX}${p.split('/').map(encodeURIComponent).join('/')}`;
    try {
      if (pull) {
        const res = await r2.fetch(url);
        if (!res.ok) throw new Error(`GET → ${res.status}`);
        const file = path.join(DIR, ...p.split('/'));
        fs.mkdirSync(path.dirname(file), { recursive: true });
        fs.writeFileSync(file, Buffer.from(await res.arrayBuffer()));
      } else {
        const res = await r2.fetch(url, { method: 'PUT', body: fs.readFileSync(path.join(DIR, ...p.split('/'))), headers: { 'content-type': TYPES[path.extname(p).toLowerCase()] ?? 'application/octet-stream' } });
        if (!res.ok) throw new Error(`PUT → ${res.status} ${(await res.text()).slice(0, 200)}`);
      }
      if (++done % 100 === 0) console.log(`  ${done}/${todo.length}`);
    } catch (err) {
      failed.push(`${p}: ${err.message}`);
    }
  }
}));
console.log(`${pull ? 'Pulled' : 'Backed up'} ${done} of ${todo.length}.`);
if (untrack && !pull && !failed.length) {
  // Only files R2 now holds at the same size; stamps/ (the web's icons) stays in git
  const inR2 = new Map([...there, ...todo.map((p) => [p, here.get(p)])]);
  const tracked = execFileSync('git', ['ls-files', '-z', 'public/images'], { cwd: ROOT }).toString().split('\0').filter(Boolean)
    .map((f) => f.slice('public/images/'.length)).filter((p) => !p.startsWith('stamps/') && inR2.get(p) === here.get(p));
  for (let i = 0; i < tracked.length; i += 200) execFileSync('git', ['rm', '-q', '--cached', '--', ...tracked.slice(i, i + 200).map((p) => `public/images/${p}`)], { cwd: ROOT });
  console.log(`Taken out of git (still on this machine): ${tracked.length} file(s). Commit to finish.`);
}
if (failed.length) {
  console.error(`FAILED ${failed.length} (re-run to retry):\n  ${failed.slice(0, 30).join('\n  ')}`);
  process.exitCode = 1;
}
