// A look, not a test: the "notice" setup's old wording against a new one, on a first reply at a few sights.
// Usage: COUNTRY=es-mx npx tsx --env-file=<env> tests/experiments/notice-look.mts city/place city/place …
import { characterForVisit } from '@/lib/characters/for-visit';
import { runTurn } from '@/lib/turn';
import { CLUSTERS, frameBrief } from '@/lib/beginner-2';
import { englishOf } from '@/lib/dialogue/pieces';

const OLD = 'This turn, point them at something they can see right now that you haven\'t shown them yet, and ask them something about it: what they make of it, which they like, what they think it\'s for. Give them two short answers they could say back.';
const NEW = process.env.NOTICE_NEW ?? '';
const places = process.argv.slice(2);
const hello = process.env.HELLO ?? 'Hola.';
const out: string[] = [];
await Promise.all(places.flatMap((p) => [['old', OLD], ['new', NEW]].flatMap(([name, note]) => [1, 2].map(async (run) => {
  const [city, place] = p.split('/');
  const character = characterForVisit(city, place)!;
  const raw = await runTurn({ character, transcript: [], learnerSaid: hello, brief: frameBrief(CLUSTERS[1]), note, answers: true, withDone: true });
  out.push(`[${p} ${name} ${run}] ${englishOf(raw.line)}\n     ${raw.line}\n     answers: ${(raw.answers ?? []).map((a: any) => a.text ?? a).join(' | ')}`);
}))));
console.log(out.sort().join('\n'));
