// Country packs (content/index.ts): each deployment serves one pack chosen by
// COUNTRY. Every pack must have what the shared code reads, and ids must be
// unique across packs because images share public/images/.
import { execSync } from 'child_process';
import { packs, country } from '@/content';

const problems: string[] = [];
const check = (ok: boolean, msg: string) => { if (!ok) problems.push(msg); };

check(country === (process.env.COUNTRY || 'it'), `active pack is ${country}, expected ${process.env.COUNTRY || 'it'}`);

// id → pack that first used it. Within a pack, repeated ids are a known open
// issue (2026-10-12: e.g. "farmacia-centrale" in 8 Italian cities shares one
// image, "padre-giovanni" in two cities shares memory); counted, not failed.
const seen = new Map<string, string>();
let repeatsWithinPack = 0;
for (const [id, p] of Object.entries(packs)) {
  check(p.id === id, `${id}: pack.id is ${p.id}`);
  const l = p.language;
  check(!!(l.code && l.name && l.speechLang && l.appName), `${id}: language.ts needs code, name, speechLang and appName`);
  check(!!(l.formality?.formal && l.formality?.informal), `${id}: language.ts needs formality words`);
  check(p.cities.length > 0, `${id}: no cities`);
  for (const c of p.cities) {
    check(!!c.region, `${id}/${c.id}: no region`);
    for (const x of [c.id, ...c.places.map((pl) => pl.id), ...(c.characters ?? []).map((ch) => ch.id)]) {
      const other = seen.get(x);
      if (other && other !== id) problems.push(`id "${x}" is used in packs ${other} and ${id} (images share public/images/)`);
      else if (other) repeatsWithinPack++;
      seen.set(x, id);
    }
  }
}

// An unknown COUNTRY stops the app at start instead of serving the wrong pack
let refused = false;
try {
  execSync('npx tsx -e "import(\'@/content\')"', { env: { ...process.env, COUNTRY: 'xx', NEXT_PUBLIC_COUNTRY: '' }, stdio: 'pipe' });
} catch (e) {
  refused = String((e as { stderr?: Buffer }).stderr ?? '').includes('has no content pack');
}
check(refused, 'COUNTRY=xx should fail with "has no content pack"');

if (problems.length) {
  console.error(problems.slice(0, 20).join('\n'));
  process.exit(1);
}
console.log(`OK: ${Object.keys(packs).length} country pack(s) complete, ids unique across packs, active pack ${country}${repeatsWithinPack ? ` (${repeatsWithinPack} ids repeat within a pack: known issue)` : ''}`);
