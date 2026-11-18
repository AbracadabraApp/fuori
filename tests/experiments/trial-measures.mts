// The measures for a trial run's JSON (rewrite-trial.mts writes it; read-trial.mts reads it). Standard: the rows Josh's
// direction runs have always carried (level, turn shape, endings, plumbing, culture). Custom: named measures kept in
// CUSTOM below, plus a one-off count by pattern. These read results; nothing here reaches the product, so counting
// words in a transcript is fine (the rule against phrase lists is for the game).
import { languageShare } from '@/lib/dialogue/share';

export type T = { setup?: string; line: string; en: string; raw?: string; answers: number; answerTexts?: string[]; done: boolean; error?: string };
// step 0 is Intermediate (no Beginner step: character.md and dialogue.md as every Intermediate visit reads them)
// arm: 'production' (the line as shipped) or 'header' (TRIAL_NO_HERE=1: no `here` line); person is the character's name
export type Visit = { step: number; city: string; place: string; kind: 'leave' | 'long'; turns: T[]; culture?: string[]; arm?: string; person?: string };

export const words = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;
export const english = (v: Visit) => v.turns.map((t) => t.en).join(' ');

export function summary(vs: Visit[]) {
  const words = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;
  const rows: Record<string, string> = {};
  const label = (step: number) => (step === 0 ? 'intermediate' : `step ${step}`);
  for (const step of [...new Set(vs.map((v) => v.step))]) {
    const at = vs.filter((v) => v.step === step);
    const shares = at.map((v) => languageShare(v.turns.filter((t) => t.line).map((t) => ({ line: t.line, en: t.en }))) ?? 0);
    const mean = shares.reduce((a, b) => a + b, 0) / shares.length;
    const sd = Math.sqrt(shares.reduce((a, b) => a + (b - mean) ** 2, 0) / shares.length);
    rows[`${label(step)} · language share, mean (spread)`] = `${Math.round(mean)}% (±${Math.round(sd)}, ${Math.min(...shares)}–${Math.max(...shares)})`;
    const ts = at.flatMap((v) => v.turns).filter((t) => t.line);
    rows[`${label(step)} · words a turn`] = String(Math.round(ts.reduce((n, t) => n + words(t.line), 0) / ts.length));
    rows[`${label(step)} · turns with 2+ questions (English)`] = `${ts.filter((t) => (t.en.match(/\?/g) ?? []).length > 1).length}/${ts.length}`;
    const asks = ts.filter((t) => !['comment', 'close', 'goodbye'].includes(t.setup ?? ''));
    rows[`${label(step)} · question last (turns meant to ask)`] = `${asks.filter((t) => /\?["'»”)]*\s*$/.test(t.en.trim())).length}/${asks.length}`;
    // Each answer a reply and then something that keeps the talk going: two sentences (Josh's bubble rule, 2026-11-16)
    const answers = ts.flatMap((t) => t.answerTexts ?? []);
    if (answers.length) rows[`${label(step)} · answers in two parts`] = `${answers.filter((a) => (a.match(/[.!?…]+(\s|$)/g) ?? []).length >= 2).length}/${answers.length}`;
  }
  const leave = vs.filter((v) => v.kind === 'leave');
  rows['endings · goodbye ends the visit at once'] = `${leave.filter((v) => v.turns.length === 5 && v.turns[4].done).length}/${leave.length}`;
  rows['endings · the goodbye back asks nothing'] = `${leave.filter((v) => v.turns[4] && !/\?/.test(v.turns[4].en)).length}/${leave.length}`;
  const long = vs.filter((v) => v.kind === 'long');
  // The close is the 9th character turn (the learner's 8th), as designed; counted off by one before 2026-11-16
  rows['endings · long visit closes by the learner\'s 8th turn'] = `${long.filter((v) => v.turns.some((t, i) => t.done && i <= 8)).length}/${long.length} (turns: ${long.map((v) => v.turns.length).join(' ')})`;
  const all = vs.flatMap((v) => v.turns);
  rows['plumbing · turns that failed'] = `${all.filter((t) => t.error).length}/${all.length}`;
  const written = all.filter((t) => t.raw);
  const outside = (raw: string) => raw.replace(/^[\s\S]*?"line"\s*:\s*"/, '').replace(/"\s*,\s*"en"[\s\S]*$/, '').replace(/\{[^{}]*\}/g, '').replace(/[\s.,!?…\\n]/g, '');
  rows['plumbing · format kept (all in braces)'] = `${written.filter((t) => /\{[^{}]*\|[^{}]*\}/.test(t.raw!) && !outside(t.raw!)).length}/${written.length}`;
  const wantAnswers = all.filter((t) => !t.error && !['close', 'free'].includes(t.setup ?? '') && !t.done);
  rows['plumbing · two answers where the turn offers them'] = `${wantAnswers.filter((t) => t.answers === 2).length}/${wantAnswers.length}`;
  const cult = long.filter((v) => v.culture);
  rows['culture · things taught a long visit (judge)'] = cult.length ? (cult.reduce((n, v) => n + v.culture!.length, 0) / cult.length).toFixed(1) : 'n/a';
  return rows;
}


// Custom measures: a visit in, a number out. Add one here and read-trial.mts shows it in every table.
export const CUSTOM: Record<string, (v: Visit, all: Visit[]) => number> = {
  'words a visit (English)': (v) => words(english(v)),
  'turns': (v) => v.turns.length,
  'culture things (judge)': (v) => v.culture?.length ?? NaN,
  // Capitalised names inside a sentence: places, people, dishes, institutions (a rough count of named things)
  'named things': (v) => new Set(english(v).match(/(?<=[a-z,;:] )[A-ZÁÉÍÓÚÑ][\wáéíóúñ]+(?: (?:de|del|la|di|da) )?(?:[A-ZÁÉÍÓÚÑ][\wáéíóúñ]+)?/g) ?? []).size,
  // Of the character's own sentences, how many were already said in another visit of the same person
  'sentences repeated from this person\'s other visits': (v, all) => {
    const mine = new Set(sentences(v));
    const others = new Set(all.filter((o) => o !== v && o.place === v.place && o.city === v.city && o.arm === v.arm).flatMap(sentences));
    return [...mine].filter((x) => others.has(x)).length;
  },
};
export const sentences = (v: Visit) => english(v).split(/(?<=[.!?])\s+/).map((x) => x.trim().toLowerCase()).filter((x) => x.length > 12);
