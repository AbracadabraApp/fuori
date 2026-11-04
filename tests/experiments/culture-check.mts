// Plays every item in both cultural sets through the real code (storyBrief with
// runTurn / runBeginnerTurn), Intermediate and Beginner, against a simulated
// learner, and judges recasts, takeaway endings and alcohol (2026-11-04c).
//   COUNTRY=it npx tsx --env-file-if-exists=.env.local tests/experiments/culture-check.mts
import { cities } from '@/content';
import { characterForPlace } from '@/lib/characters/for-place';
import { cultureSet, storyBrief, STORY_TURNS } from '@/lib/culture';
import { runTurn } from '@/lib/turn';
import { runBeginnerTurn } from '@/lib/beginner';
import type { Turn } from '@/lib/types';
import { ask, pool } from './common.mjs';
const LEARNER = (b: boolean) => b ? 'You play a Beginner learner, an American adult who just moved here. Answer in one short sentence of English, sometimes trying a word you just heard. Just the sentence.' : 'You play an Intermediate learner (about A2), an American adult who just moved here. Answer in one or two short simple sentences in the language, with a real small grammar mistake in most replies. Just the sentence.';
const JUDGE = 'You check a language-learning conversation. For each LEARNER line that has a real grammar or word mistake (not speech-to-text noise), say whether the character\'s next line uses the correct form somewhere as it reacts (a recast), and whether it points the mistake out or explains it. Also: does the character end the lesson by handing over a word to remember, or mention alcohol?';
const js = { type: 'object', additionalProperties: false, required: ['mistakes', 'takeaway', 'alcohol'], properties: { mistakes: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['said', 'recast', 'pointedOut'], properties: { said: { type: 'string' }, recast: { type: 'boolean' }, pointedOut: { type: 'boolean' } } } }, takeaway: { type: 'boolean' }, alcohol: { type: 'boolean' } } };
const words = (s: string) => s.split(/\s+/).filter(Boolean).length;
const jobs = cultureSet().flatMap((it) => [false, true].map((b) => async () => {
  const city = cities.find((c) => c.id === it.cityId)!;
  const character = characterForPlace(city, city.places.find((p) => p.id === it.placeId)!)!;
  const t: Turn[] = []; let said: string | undefined; let en = 0, lang = 0; const lines: string[] = [];
  for (let n = 0; n <= STORY_TURNS; n++) {
    const { brief } = storyBrief(it, n, b);
    if (said) { t.push({ who: 'learner', transcript: said }); lines.push(`Learner: ${said}`); }
    if (b) {
      const r = await runBeginnerTurn({ character, transcript: t.slice(0, said ? -1 : undefined), learnerSaid: said, stageText: brief } as any);
      for (const p of r.parts) { if (p.kind === 'answer') continue; if (p.kind === 'english') en += words(p.text); else lang += words(p.text); }
      lines.push(`${character.name}: ${r.parts.map((p) => p.kind === 'english' ? p.text : p.kind === 'answer' ? `[say back: ${p.text}]` : `«${p.text}»`).join(' ')}`);
      t.push({ who: 'npc', transcript: r.line, translation: r.en });
    } else {
      const r = await runTurn({ character, transcript: t.slice(0, said ? -1 : undefined), learnerSaid: said, brief });
      lines.push(`${character.name}: ${r.line}`); lang += words(r.line);
      t.push({ who: 'npc', transcript: r.line, translation: r.en });
    }
    if (n < STORY_TURNS) said = await ask(t.map((x) => `${x.who}: ${x.transcript}`).join('\n') + '\n\nYour reply:', { system: LEARNER(b), max: 1500 });
  }
  const j = JSON.parse(await ask(lines.join('\n\n'), { system: JUDGE, schema: js, max: 4000 }));
  return { title: `${it.chip} · ${character.name} · ${b ? 'Beginner' : 'Intermediate'}`, b, en, lang, j, text: lines.join('\n\n') };
}));
const rs = await pool(jobs, 6);
const beg = rs.filter((r) => r.b), mid = rs.filter((r) => !r.b);
const m = mid.flatMap((r) => r.j.mistakes);
console.log(`Beginner: language share ${Math.round(100 * beg.reduce((a, r) => a + r.lang, 0) / beg.reduce((a, r) => a + r.lang + r.en, 0))}% of words (answers to say back not counted)`);
console.log(`Intermediate mistakes: ${m.length}, recast ${m.filter((x: any) => x.recast).length}, pointed out ${m.filter((x: any) => x.pointedOut).length}`);
console.log(`Takeaway endings: ${rs.filter((r) => r.j.takeaway).length}/${rs.length}; alcohol: ${rs.filter((r) => r.j.alcohol).length}`);
console.log('\n' + rs.map((r) => `### ${r.title}\n\n${r.text}\n`).join('\n'));
