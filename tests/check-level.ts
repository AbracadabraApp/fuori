// The level judge (lib/level.ts, content/<country>/prompts/level.md) and its
// scorecard row. Without an API key: version, placeholders, only character
// lines judged, and the "Lines a beginner can follow" arithmetic. With one:
// a plain line and a hard one, judged for real. Run per country (COUNTRY=es-mx).
import { readFileSync } from 'fs';
import { pack, language } from '@/content';
import { buildLevelPrompt, levelOfConversation, levelPromptVersion, beginnerKnows } from '@/lib/level';
import { scorecard } from '@/lib/scorecard';
import type { ConversationScore } from '@/lib/quality';

const failures: string[] = [];
const check = (ok: boolean, what: string) => { if (!ok) failures.push(what); };

const md = readFileSync(`content/${pack.id}/prompts/level.md`, 'utf8');
const newest = (md.split('## Changelog')[1] ?? '').match(/^### ([^\s:]+)/m)?.[1];
check(newest === levelPromptVersion(), `level.md: version ${levelPromptVersion()} but newest changelog entry ${newest}`);
const p = buildLevelPrompt('LINE');
check(!/\{\w+\}/.test(p), `level.md: unfilled placeholder in ${p.match(/\{\w+\}/)?.[0]}`);
check(p.includes(language.name) && p.trim().endsWith('LINE'), 'level.md: should name the language and end with the line');

(async () => {
  const seen: string[] = [];
  const level = await levelOfConversation(
    [{ who: 'npc', text: 'a' }, { who: 'learner', text: 'x' }, { who: 'npc', text: 'b' }],
    async (l) => { seen.push(l); return l === 'a' ? 1 : 0.5; }
  );
  check(seen.join() === 'a,b', `only character lines are judged, in order (got ${seen.join()})`);
  check(level.beginnerKnows.join() === '1,0.5', 'beginnerKnows keeps each line\'s share');

  const base = { judgeVersion: 'x', learnerLines: 1, stats: { openerWords: 1, wordsMedian: 1, wordsAvg: 1, wordsMax: 1, longShare: 0, questionsAvg: 0, multiQuestionShare: 0 }, lost: [], judge: { pronunciationCorrections: 0, correctionsAsked: 0, correctionsUnprompted: 0, garbled: 0, garbledMissed: 0, lost: [], englishUnasked: 0, note: '' } } as unknown as ConversationScore;
  const row = (scores: ConversationScore[]) => scorecard(scores).rows.find((r) => r.key === 'beginnerFollows')!;
  const r = row([{ ...base, level: { judgeVersion: 'x', beginnerKnows: [1, 0.9, 0.89, 0.5] } }]);
  check(r.value === 0.5 && r.ok === false, `2 of 4 lines at 90%+ should be 50%, below target (got ${r.value})`);
  check(row([base]).value === null, 'scores without a level (real play, older replays) are not compared');

  if (process.env.ANTHROPIC_API_KEY) {
    const plain = pack.id === 'es-mx' ? '¡Hola! ¿Un café?' : 'Ciao! Un caffè?';
    const hard = pack.id === 'es-mx'
      ? 'Pues mira, si no te hubieras tardado tanto, a lo mejor todavía alcanzábamos a ver el desfile antes de que se armara el despapaye.'
      : 'Be\', se non ti fossi attardato così tanto, magari avremmo fatto in tempo a vedere il corteo prima che scoppiasse il putiferio.';
    const [a, b] = await Promise.all([beginnerKnows(plain), beginnerKnows(hard)]);
    console.log(`  plain ${Math.round(a * 100)}% · hard ${Math.round(b * 100)}%`);
    check(a >= 0.9, `a beginner should know nearly all of "${plain}" (got ${a})`);
    check(b < 0.9, `a beginner should not know 90% of "${hard}" (got ${b})`);
  }
  if (failures.length) { console.error(failures.join('\n')); process.exit(1); }
  console.log(`OK: level judge ${levelPromptVersion()} and its scorecard row (${pack.id})${process.env.ANTHROPIC_API_KEY ? ', judged for real' : ''}`);
})();
