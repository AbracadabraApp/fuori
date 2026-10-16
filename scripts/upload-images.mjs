/**
 * Images to Cloudflare R2 for the iPhone app (docs/12-native-app.md → Content
 * and images). Converts each city, place, portrait and country-card JPEG under public/ to
 * WebP, names it by its contents (<country>/<kind>/<id>.<hash>.webp, so a new
 * picture gets a new address and no cache can show the old one), uploads it,
 * and records it in content/<country>/images.json. Commit that file: it's how
 * the server and the app find each image.
 *
 * Only images whose JPEG changed since the last upload are converted and sent,
 * so it's quick to re-run. Old files stay in R2 (old app versions may still
 * point at them). The web app keeps serving public/images; nothing is removed.
 *
 *   npm run images:upload                 Italy
 *   COUNTRY=es-mx npm run images:upload   Mexico
 *   … -- --only roma,bar-angolo           just these ids
 *   … -- --dry                            list what would upload
 *
 * Needs R2_ACCOUNT_ID, R2_BUCKET, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY and
 * R2_PUBLIC_URL (.env.local; Object Read & Write on the bucket only).
 * npm run images runs this at the end when those are set.
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import { AwsClient } from 'aws4fetch';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
// country: the country's card picture (country/<country>.jpg), for the app's country choice
const KINDS = ['cities', 'places', 'portraits', 'country'];
const WEBP_QUALITY = 80;
const CONCURRENCY = 8;

const sha = (buf, n) => crypto.createHash('sha256').update(buf).digest('hex').slice(0, n);

export async function uploadImages({ country = process.env.COUNTRY || 'it', only, dry = false } = {}) {
  const missingEnv = ['R2_ACCOUNT_ID', 'R2_BUCKET', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY', 'R2_PUBLIC_URL'].filter((k) => !process.env[k]);
  if (missingEnv.length && !dry) throw new Error(`Missing ${missingEnv.join(', ')} (see .env.local)`);

  // Same folder the generator writes to (content/<country>/generation.json)
  const configPath = path.join(ROOT, 'content', country, 'generation.json');
  const generation = fs.existsSync(configPath) ? JSON.parse(fs.readFileSync(configPath, 'utf8')) : {};
  const imageDir = path.join(ROOT, 'public', generation.images?.dir ?? 'images');

  const listPath = path.join(ROOT, 'content', country, 'images.json');
  const list = fs.existsSync(listPath)
    ? JSON.parse(fs.readFileSync(listPath, 'utf8'))
    : { about: 'Written by npm run images:upload. Image id → file in R2; the app loads base + key.', base: '', images: {} };
  list.base = process.env.R2_PUBLIC_URL ?? list.base;

  const todo = [];
  for (const kind of KINDS) {
    const dir = path.join(imageDir, kind);
    if (!fs.existsSync(dir)) continue;
    for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.jpg')).sort()) {
      const id = file.slice(0, -4);
      if (only && !only.has(id)) continue;
      const jpg = fs.readFileSync(path.join(dir, file));
      const src = sha(jpg, 16);
      if (list.images[`${kind}/${id}`]?.src === src) continue;
      todo.push({ kind, id, jpg, src });
    }
  }

  console.log(`${country}: ${todo.length} image(s) to upload${dry ? ' (dry run)' : ''}`);
  if (dry || todo.length === 0) {
    for (const t of todo.slice(0, 20)) console.log(`  ${t.kind}/${t.id}`);
    return { uploaded: 0, failed: 0 };
  }

  const r2 = new AwsClient({
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    service: 's3',
    region: 'auto',
  });
  const endpoint = `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${process.env.R2_BUCKET}`;

  let uploaded = 0;
  let inBytes = 0;
  let outBytes = 0;
  const failed = [];
  const save = () => {
    const sorted = Object.fromEntries(Object.entries(list.images).sort(([a], [b]) => a.localeCompare(b)));
    fs.writeFileSync(listPath, JSON.stringify({ ...list, images: sorted }, null, 2) + '\n');
  };

  async function one(t) {
    const webp = await sharp(t.jpg).webp({ quality: WEBP_QUALITY }).toBuffer();
    const key = `${country}/${t.kind}/${t.id}.${sha(webp, 10)}.webp`;
    const res = await r2.fetch(`${endpoint}/${key}`, {
      method: 'PUT',
      body: webp,
      headers: { 'content-type': 'image/webp', 'cache-control': 'public, max-age=31536000, immutable' },
    });
    if (!res.ok) throw new Error(`PUT ${key} → ${res.status} ${(await res.text()).slice(0, 200)}`);
    list.images[`${t.kind}/${t.id}`] = { key, src: t.src, bytes: webp.length };
    uploaded++;
    inBytes += t.jpg.length;
    outBytes += webp.length;
    if (uploaded % 50 === 0) {
      save();
      console.log(`  ${uploaded}/${todo.length}`);
    }
  }

  const queue = [...todo];
  await Promise.all(
    Array.from({ length: CONCURRENCY }, async () => {
      for (let t = queue.shift(); t; t = queue.shift()) {
        try {
          await one(t);
        } catch (err) {
          failed.push(`${t.kind}/${t.id}: ${err.message}`);
        }
      }
    })
  );
  save();

  const mb = (n) => (n / 1e6).toFixed(1);
  console.log(`Uploaded ${uploaded}: ${mb(inBytes)} MB of JPEG → ${mb(outBytes)} MB of WebP. List: ${path.relative(ROOT, listPath)}`);
  if (failed.length) {
    console.error(`FAILED ${failed.length} (re-run to retry):\n  ${failed.join('\n  ')}`);
    process.exitCode = 1;
  }
  return { uploaded, failed: failed.length };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const onlyArg = args.indexOf('--only');
  await uploadImages({
    only: onlyArg >= 0 ? new Set(args[onlyArg + 1].split(',')) : undefined,
    dry: args.includes('--dry'),
  });
}
