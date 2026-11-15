// D20 (bugs.md B10): with the learner set to "a man", does a character still address them as a woman on a clean
// visit (no feminine words already in the history)? Ofelia (Oaxaca), Carmen and Don Chucho (CDMX): the opener and a
// second turn after an ordinary reply, N takes each, at Beginner step 1; a judge marks feminine and masculine address.
//   COUNTRY=es-mx npx tsx --env-file=.env.local tests/experiments/address-clean.mts <takes>
import { cities } from '@/content';
import { characterForPlace } from '@/lib/characters/for-place';
import { runTurn } from '@/lib/turn';
import { CLUSTER_1, OPENER, RUNGS, frameBrief, setupLine } from '@/lib/beginner-2';
import { assemblePieces } from '@/lib/dialogue/pieces';
import type { Turn } from '@/lib/types';
import { ask, pool } from './common.mjs';

const takes = Number(process.argv[2] ?? '4');
const picks = [['oaxaca', 'ofelia-tlayudas'], ['ciudad-de-mexico', 'carmen-jubilada'], ['ciudad-de-mexico', 'chucho-lustrabotas']];
const schema = { type: 'object', additionalProperties: false, required: ['feminine', 'masculine'], properties: { feminine: { type: 'boolean' }, masculine: { type: 'boolean' } } };
const jobs: (() => Promise<{ who: string; turn: string; feminine: boolean; masculine: boolean; line: string }>)[] = [];
for (const [cityId, charId] of picks) {
  const city = cities.find((c) => c.id === cityId)!;
  const place = city.places.find((p) => p.characterId === charId)!;
  const character = characterForPlace(city, place)!;
  for (let k = 0; k < takes; k++) jobs.push(async () => {
    const o = await runTurn({ character, transcript: [], addressedAs: 'm', brief: frameBrief(CLUSTER_1), note: setupLine(OPENER), answers: true, withDone: true });
    const opener = assemblePieces(o.line);
    const t: Turn[] = [{ who: 'npc', transcript: opener, translation: o.en }];
    const r = await runTurn({ character, transcript: t, learnerSaid: 'Sí, por favor. Gracias.', addressedAs: 'm', brief: frameBrief(CLUSTER_1), note: setupLine(RUNGS[0]), answers: true, withDone: true });
    const both = `${opener}\n${assemblePieces(r.line)}`;
    const j = JSON.parse(await ask(`Two lines of Spanish said to one customer:\n${both}\n\nfeminine: anything addresses or describes that customer as a woman (a feminine ending on a word about them, "señora", "güerita", "mi reina", "verla", "bienvenida"…). masculine: as a man. Reply with JSON.`, { schema, max: 2000 }));
    return { who: character.name, turn: 'opener+1', line: both.replace(/\n/g, ' / ').slice(0, 220), ...j };
  });
}
const rows = await pool(jobs, 6);
for (const name of [...new Set(rows.map((r) => r.who))]) {
  const rs = rows.filter((r) => r.who === name);
  console.log(`${name}: feminine ${rs.filter((r) => r.feminine).length}/${rs.length} · masculine ${rs.filter((r) => r.masculine).length}/${rs.length}`);
  for (const r of rs.filter((x) => x.feminine)) console.log(`   - ${r.line}`);
}
