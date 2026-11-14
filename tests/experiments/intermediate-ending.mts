// Does an Intermediate visit end when the learner is leaving, and stay open otherwise (dialogue.md 13a; bugs.md B3)?
// Replays saved Intermediate turns through the call take-turn makes and prints done. A check, not a card.
//   npx tsx --env-file=.env.local tests/experiments/intermediate-ending.mts <snapshot.json> <id-prefix:turn>... [--takes=2] [--close] [--intermediate]
import { readFileSync } from 'node:fs';
import { characterForVisit } from '@/lib/characters/for-visit';
import { runTurn } from '@/lib/turn';
import { closeNote } from '@/lib/dialogue/rules';
import type { Turn } from '@/lib/types';

const args = process.argv.slice(2);
const takes = Number(args.find((a) => a.startsWith('--takes='))?.slice(8) ?? '2');
const close = args.includes('--close');
const learning = args.includes('--intermediate'); // character.md's {learning} line (2026-11-13, B13)
const [file, ...targets] = args.filter((a) => !a.startsWith('--'));
const all = JSON.parse(readFileSync(file, 'utf8')) as { id: string; city_id: string; place_id: string; turns: { who: 'npc' | 'learner'; text: string; en?: string }[] }[];
for (const t of targets) {
  const [id, at] = t.split(':');
  const c = all.find((x) => x.id.startsWith(id))!;
  const character = characterForVisit(c.city_id, c.place_id)!;
  const i = Number(at);
  const transcript: Turn[] = c.turns.slice(0, i - 1).map((x) => ({ who: x.who, transcript: x.text, ...(x.en ? { translation: x.en } : {}) }));
  const learnerSaid = c.turns[i - 1].text;
  console.log(`\n=== ${id} turn ${i}${close ? ' (close note)' : ''} · learner: "${learnerSaid}"`);
  for (let k = 0; k < takes; k++) {
    const r = await runTurn({ character, transcript, learnerSaid, withDone: true, ...(close ? { note: closeNote() } : {}), ...(learning ? { learnerLevel: 'intermediate' } : {}) });
    console.log(`  done ${r.done} · ${r.line}`);
  }
}
