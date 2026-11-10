// Automated replies (docs/automated-replies.md, build steps 1 and 1b): whole Beginner 2 visits played
// through the game's own Beginner 2 turn (lib/beginner-2.ts, as lib/conversation/take-turn.ts composes
// it), with the learner's side picked by code at a persona's rates. Said-back lines and edits are made
// in code; own words, a question and English are one small call each, of that kind only. Every turn is
// saved; the counts are about the character's side. A tool, not a test of a change (docs/prompt-testing.md).
// No database: one visit at a time, no memory between visits (that's build step 2).
//   COUNTRY=es-mx npx tsx --env-file=.env.local tests/experiments/automated-replies.mts [--cluster=1] [--visits=2] [--turns=12] [--persona=josh] [--characters=4] [--label=name]
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { cities, language } from '@/content';
import { characterForVisit } from '@/lib/characters/for-visit';
import { runBeginnerTurn, lineFromParts, SCAFFOLDING_FILE, type Part } from '@/lib/beginner';
import { TURN_MODEL } from '@/lib/claude';
import { CLUSTERS, levelText, setupLine, shownParts, pickSetup } from '@/lib/beginner-2';
import { ask, pool, OUT } from './common.mjs';

const arg = (n: string, d: string) => process.argv.find((a) => a.startsWith(`--${n}=`))?.split('=')[1] ?? d;
const clusterNo = Number(arg('cluster', '1'));
const cluster = CLUSTERS[clusterNo - 1];
const visits = Number(arg('visits', '2'));
const maxTurns = Number(arg('turns', '12'));
const persona = arg('persona', 'josh');
const howMany = Number(arg('characters', '4'));
const label = arg('label', `c${clusterNo}-${persona}`);

/** The learner's reply kinds and their rates (docs/automated-replies.md → persona mixes, from real play) */
type Kind = 'back' | 'edit' | 'own' | 'question' | 'english';
const PERSONAS: Record<string, Record<Kind, number>> = {
  josh: { back: 0.5, edit: 0.1, own: 0.25, question: 0.05, english: 0.1 },
  jennifer: { back: 0.8, edit: 0.05, own: 0, question: 0, english: 0.15 },
};
const rates = PERSONAS[persona] ?? PERSONAS.josh;

/** A seeded random, so a run replays */
function rng(seed: string) {
  let h = 2166136261;
  for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return () => ((h = Math.imul(h ^ (h >>> 15), 2246822507) ^ Math.imul(h ^ (h >>> 13), 3266489909)) >>> 0) / 2 ** 32;
}
function pickKind(r: () => number, hasAnswers: boolean): Kind {
  const allowed = (Object.keys(rates) as Kind[]).filter((k) => hasAnswers || (k !== 'back' && k !== 'edit'));
  const total = allowed.reduce((n, k) => n + rates[k], 0);
  let x = r() * total;
  for (const k of allowed) if ((x -= rates[k]) <= 0) return k;
  return allowed[allowed.length - 1];
}

/** Edits to an offered answer, made in code, so what was done is known: a vowel-final word's ending flipped, or garbled like speech-to-text, or the last word dropped */
function edit(answer: string, r: () => number): { said: string; how: string } {
  const words = answer.split(' ');
  const which = r();
  if (which < 0.4) {
    const i = words.findIndex((w, k) => k > 0 && /[aeiou][.,!?]?$/i.test(w) && w.length > 3);
    if (i > 0) { words[i] = words[i].replace(/([aeiou])([.,!?]?)$/i, (_, v, p) => ({ a: 'o', o: 'a', e: 'a', i: 'e', u: 'o' } as Record<string, string>)[v.toLowerCase()] + p); return { said: words.join(' '), how: 'ending flipped' }; }
  }
  if (which < 0.75) return { said: answer.toLowerCase().replace(/[¿¡.,!?]/g, '').replace(/(\w)(\w)\s(\w)/, '$1$2$3'), how: 'garbled' };
  return { said: words.slice(0, Math.max(1, words.length - 1)).join(' '), how: 'last word dropped' };
}

/** One small call for the kinds that need writing, of that kind only, answering the character's last line */
async function write(kind: 'own' | 'question' | 'english', lastLine: string): Promise<string> {
  const task = {
    own: `a short reply in very simple ${language.name} (at most 6 words), the way a beginner would say it, maybe with one small mistake`,
    question: `a short question in simple ${language.name} (at most 6 words) a beginner might ask about what was just said`,
    english: `a short reply in English (at most 10 words), answering what was just said`,
  }[kind];
  return (await ask(`You are a beginner learner of ${language.name}, talking with someone in ${language.card.country}. They just said:\n"${lastLine}"\n\nWrite only ${task}. Don't bring up a topic of your own. Reply with the line only, no quotes.`, { max: 100 })).replace(/^"|"$/g, '');
}

// The characters: the first places with a person, spread across cities
const people = cities.flatMap((c) => c.places.filter((p) => p.characterId).map((p) => ({ city: c, place: p })));
const step = Math.max(1, Math.floor(people.length / howMany));
const chosen = Array.from({ length: howMany }, (_, i) => people[i * step]).filter(Boolean);

interface TurnRow { character: string; visit: number; turn: number; setup: string; kind?: Kind | 'goodbye'; how?: string; said?: string; ms: number; ok: boolean; error?: string; parts?: Part[]; line?: string; answers?: string[]; done?: boolean }
const rows: TurnRow[] = [];

const t0 = Date.now();
await pool(chosen.flatMap(({ city, place }) => Array.from({ length: visits }, (_, v) => async () => {
  const character = characterForVisit(city.id, place.id);
  if (!character) return;
  const r = rng(`${label}|${character.id}|${v}`);
  const conversationId = `auto-${label}-${character.id}-${v}`;
  const transcript: { who: 'npc' | 'learner'; transcript: string; offered?: string[] }[] = [];
  let said: string | undefined;
  let kind: TurnRow['kind'];
  let how: string | undefined;
  for (let turn = 0; turn < maxTurns; turn++) {
    const setup = pickSetup({ conversationId: turn === 0 ? null : conversationId, turn, learnerId: `auto-${v}`, characterId: character.id }, cluster);
    const started = performance.now();
    try {
      const reply = await runBeginnerTurn({ character, transcript: transcript as never, learnerSaid: said, promptFile: SCAFFOLDING_FILE, stageText: levelText(cluster), turnNote: setupLine(setup), maxAnswers: setup.maxAnswers, withDone: true });
      const parts = shownParts(reply.parts, setup, cluster);
      const { line } = lineFromParts(parts);
      const answers = parts.filter((p) => p.kind === 'answer').map((p) => p.text);
      rows.push({ character: character.name, visit: v, turn: turn + 1, setup: setup.id, kind, how, said, ms: Math.round(performance.now() - started), ok: true, parts, line, answers, done: reply.done });
      if (said) transcript.push({ who: 'learner', transcript: said });
      transcript.push({ who: 'npc', transcript: line, offered: answers });
      if (reply.done) break;
      // The learner's next line
      if (setup.id === 'goodbye' && answers.length) { kind = 'goodbye'; how = undefined; said = answers[0]; continue; }
      const k = pickKind(r, answers.length > 0);
      kind = k; how = undefined;
      if (k === 'back') said = answers[Math.floor(r() * answers.length)];
      else if (k === 'edit') { const e = edit(answers[Math.floor(r() * answers.length)], r); said = e.said; how = e.how; }
      else said = await write(k, line);
    } catch (e) {
      rows.push({ character: character.name, visit: v, turn: turn + 1, setup: setup.id, kind, said, ms: Math.round(performance.now() - started), ok: false, error: String(e).slice(0, 160) });
      break;
    }
  }
})), 6);
const secs = Math.round((Date.now() - t0) / 1000);

mkdirSync(OUT, { recursive: true });
const file = join(OUT, `automated-${label}-${new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-')}.json`);
writeFileSync(file, JSON.stringify({ label, cluster: clusterNo, persona, model: TURN_MODEL, secs, rows }, null, 1));

// The counts (the character's side; facts from the parts and the spoken line)
const ok = rows.filter((x) => x.ok);
const words = (s: string) => s.split(/\s+/).filter(Boolean).length;
const en = (x: TurnRow) => (x.parts ?? []).filter((p) => p.kind === 'english').reduce((n, p) => n + words(p.text), 0);
const sp = (x: TurnRow) => (x.parts ?? []).filter((p) => p.kind === 'word' || p.kind === 'question').reduce((n, p) => n + words(p.text), 0);
const followed = (x: TurnRow) => {
  const a = x.answers?.length ?? 0;
  if (x.setup === 'two-en' || x.setup === 'goodbye') return a >= 2;
  if (x.setup === 'ask-en') return a >= 2 && (x.answers ?? []).some((s) => /\?/.test(s));
  return a === 0;
};
const qEnglish = (x: TurnRow) => { const ps = x.parts ?? []; const i = ps.findIndex((p) => p.kind === 'question'); return i < 0 || ps[i + 1]?.kind === 'english' || !!ps[i].gloss || ps[i - 1]?.kind === 'english'; };
const inviteElsewhere = ok.filter((x) => x.setup !== 'invite-en' && /in English or|answer (me )?in English/i.test(x.line ?? '')).length;
const announce = ok.filter((x) => /here are two|you could ask me|you can say one of|let me ask/i.test(x.line ?? '')).length;
const visitsDone = new Set(ok.filter((x) => x.done).map((x) => `${x.character}|${x.visit}`)).size;
const visitCount = new Set(rows.map((x) => `${x.character}|${x.visit}`)).size;
const ms = ok.map((x) => x.ms).sort((a, b) => a - b);
console.log(`automated replies · ${label} · cluster ${clusterNo} · ${persona} · ${TURN_MODEL} · ${visitCount} visits, ${rows.length} turns in ${secs}s`);
console.log(`  broken ${rows.length - ok.length} · setup followed ${ok.filter(followed).length}/${ok.length} · English beside every question ${ok.filter(qEnglish).length}/${ok.length}`);
console.log(`  per turn: English ${(ok.reduce((n, x) => n + en(x), 0) / ok.length).toFixed(1)} words, ${language.name} ${(ok.reduce((n, x) => n + sp(x), 0) / ok.length).toFixed(1)} words · reply median ${ms[Math.floor(ms.length / 2)]} ms`);
console.log(`  the English invitation on other turns ${inviteElsewhere} · announcing ${announce} · visits ended on a goodbye ${visitsDone}/${visitCount}`);
console.log(`  learner kinds: ${Object.entries(rows.reduce((m, x) => ({ ...m, [x.kind ?? 'opening']: (m[x.kind ?? 'opening'] ?? 0) + 1 }), {} as Record<string, number>)).map(([k, n]) => `${k} ${n}`).join(', ')}`);
console.log(`  saved ${file}`);
