// Writes the third arm for the here-line test: each character's here line rewritten by one rule
// (tests/conversations/variants/here-rule.md) from their sheet, their place and their current line, not by hand
// (Josh, 2026-11-08: "you are selectively changing 3 inputs"). Mexico's ten characters from C9; no test runs here, it
// only writes the variant file for the card to use.
//   COUNTRY=es-mx npx tsx --env-file=.env.local tests/experiments/here-rewrite.mts
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { cities } from '@/content';
import { characterForPlace } from '@/lib/characters/for-place';
import { ask } from './common.mjs';

const NAMES = ['Don Chucho Mendoza', 'Vale Ortiz', 'Doña Ofelia Santiago', 'Emiliano Matus', 'Memo Orozco', 'Ximena Godínez', 'Doña Rosa Ledesma', 'Beto Rangel', 'Sofía Quintero', 'Padre Tomás Herrera'];
const rule = readFileSync(join(process.cwd(), 'tests/conversations/variants/here-rule.md'), 'utf8');
const out: Record<string, string> = {};
const log: string[] = [];
for (const name of NAMES) {
  const hit = cities.flatMap((c) => c.places.map((p) => ({ c, p }))).find(({ c, p }) => characterForPlace(c, p)?.name === name);
  if (!hit) throw new Error(`no character ${name}`);
  const ch = characterForPlace(hit.c, hit.p)!;
  const sheet = { name: ch.name, age: ch.age, role: ch.role, personality: ch.personality };
  const current = hit.c.characters?.find((x) => x.name === name)?.here ?? '';
  if (!current) throw new Error(`no current here line for ${name}`);
  const prompt = `${rule}\nCharacter sheet: ${JSON.stringify(sheet)}\nPlace: ${hit.p.name} (${hit.p.kind}), ${hit.p.neighbourhood}, ${hit.c.name}\nCurrent line: ${current}\n\nThe new line:`;
  const line = (await ask(prompt)).replace(/^["“]|["”]$/g, '').trim();
  out[name] = line;
  log.push(`${name}\n  A: ${current}\n  rule: ${line}`);
  console.log(log[log.length - 1]);
}
writeFileSync(join(process.cwd(), 'tests/conversations/variants/rule-here-mx.json'), JSON.stringify({ name: 'here lines rewritten by one rule (here-rule.md)', here: out }, null, 1) + '\n');
console.log(`wrote tests/conversations/variants/rule-here-mx.json (${Object.keys(out).length} lines)`);
