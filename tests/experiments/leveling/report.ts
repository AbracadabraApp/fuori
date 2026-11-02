// The markdown report from main.mts's JSON (one file per country). Reads JSON
// only, never @/content, so one report can cover both countries.
import type { Meters, CallKind } from './brain';
import type { ConversationScore } from './score';
import type { LearnerRun } from './simulate';

export interface CountryResult {
  country: string;
  language: string;
  dry: boolean;
  at: string;
  models: Record<string, string>;
  versions: Record<string, string>;
  conversations: number;
  turns: number;
  runs: (LearnerRun & { scores: ConversationScore[]; scoringMeters: Meters })[];
}

/** Assumed prices per million tokens (set PRICE_IN and PRICE_OUT for the model you run; check current pricing) */
const PRICE_IN = Number(process.env.PRICE_IN ?? 3);
const PRICE_OUT = Number(process.env.PRICE_OUT ?? 15);

const pct = (x: number | null) => (x === null || Number.isNaN(x) ? '–' : `${Math.round(100 * x)}%`);
const share = (xs: (boolean | null)[]) => { const ys = xs.filter((x): x is boolean => x !== null); return ys.length ? ys.filter(Boolean).length / ys.length : null; };
const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : NaN);
const f1 = (x: number) => (Number.isNaN(x) ? '–' : x.toFixed(1));
const KINDS: CallKind[] = ['character', 'retry', 'check', 'speaking', 'learner', 'level', 'quality'];
const IMPROVERS = ['improving-first', 'improving-mid', 'early-b1'];

function add(into: Meters, m: Meters) {
  for (const k of KINDS) for (const f of ['calls', 'ms', 'inTokens', 'outTokens'] as const) into[k][f] += m[k][f];
}
const zero = (): Meters => Object.fromEntries(KINDS.map((k) => [k, { calls: 0, ms: 0, inTokens: 0, outTokens: 0 }])) as Meters;
const cost = (m: Meters) => KINDS.reduce((a, k) => a + (m[k].inTokens * PRICE_IN + m[k].outTokens * PRICE_OUT) / 1e6, 0);

type Run = CountryResult['runs'][number];

function summary(runs: Run[]) {
  const lines = runs.flatMap((r) => r.scores.flatMap((s) => s.lines));
  const convs = runs.flatMap((r) => r.conversations);
  const npc = convs.flatMap((c) => c.turns.flatMap((t) => (t.who === 'npc' ? [t.npc] : [])));
  const m = zero();
  for (const r of runs) add(m, r.meters);
  const improvers = runs.filter((r) => IMPROVERS.includes(r.persona));
  const flat = runs.filter((r) => r.persona === 'flat');
  const endStep = (r: Run) => r.conversations[r.conversations.length - 1]?.decision.stepAfter ?? r.startStep;
  return {
    followable: share(lines.map((l) => l.followable)),
    known: mean(runs.flatMap((r) => r.scores.map((s) => s.known).filter((k): k is number => typeof k === 'number'))),
    knownBare: mean(runs.flatMap((r) => r.scores.map((s) => s.knownBare).filter((k): k is number => typeof k === 'number'))),
    convFollowable: share(runs.flatMap((r) => r.scores.map((s) => (typeof s.known === 'number' ? s.known >= 0.9 : null)))),
    withHelp: share(lines.map((l) => l.withHelp)),
    climbs: `${improvers.filter((r) => endStep(r) > r.startStep).length}/${improvers.length}`,
    flatStays: `${flat.filter((r) => endStep(r) === r.startStep).length}/${flat.length}`,
    alive: mean(runs.flatMap((r) => r.scores.map((s) => s.alive).filter((a): a is number => a !== null))),
    charS: npc.length ? mean(npc.map((n) => n.ms)) / 1000 : NaN,
    addedS: npc.length ? mean(npc.map((n) => n.addedMs)) / 1000 : NaN,
    judgeS: convs.filter((c) => c.verdict).length ? mean(convs.filter((c) => c.verdict).map((c) => c.verdict!.ms)) / 1000 : NaN,
    callsPerLine: npc.length ? (m.character.calls + m.retry.calls + m.check.calls) / npc.length : NaN,
    retried: npc.length ? npc.filter((n) => n.retried).length / npc.length : null,
    errors: convs.filter((c) => c.error).length,
  };
}

function byStage(runs: Run[]): string {
  const rows = new Map<string, { f: (boolean | null)[]; h: (boolean | null)[] }>();
  for (const r of runs) r.conversations.forEach((c, i) => {
    const key = `${c.stage}${c.supportBack ? ' (support back)' : ''}`;
    const row = rows.get(key) ?? { f: [], h: [] };
    for (const l of r.scores[i]?.lines ?? []) { row.f.push(l.followable); row.h.push(l.withHelp); }
    rows.set(key, row);
  });
  return [...rows].sort().map(([k, v]) => `${k}: ${pct(share(v.f))} / ${pct(share(v.h))} (${v.f.filter((x) => x !== null).length} lines)`).join(' · ');
}

/** Words spoken per conversation, and the shares in the language and in their own words, first half vs second half of the run (Josh, 2026-11-02: the main engagement and progress signals) */
function wordsTrend(r: Run): string {
  const half = (cs: Run['conversations']) => {
    const w = cs.reduce((n, c) => n + (c.record.words ?? 0), 0);
    const t = cs.reduce((n, c) => n + (c.record.wordsTarget ?? 0), 0);
    const o = cs.reduce((n, c) => n + (c.record.wordsOwn ?? 0), 0);
    return `${f1(cs.length ? w / cs.length : NaN)} words, ${pct(w ? t / w : null)} in the language, ${pct(w ? o / w : null)} own`;
  };
  const k = Math.ceil(r.conversations.length / 2);
  return `${half(r.conversations.slice(0, k))} → ${half(r.conversations.slice(k))}`;
}

function trace(r: Run): string[] {
  return [
    `| # | Step | Stage | Supports | Person | Words (language / own) | Own / back / English / help / silent | Felt | Why | Easy (window) | Judge | Followable lines | Conversation known | Move |`,
    `|---|---|---|---|---|---|---|---|---|---|---|---|---|---|`,
    ...r.conversations.map((c, i) => {
      const s = r.scores[i];
      const sup = `echo ${c.supports.echo}, answers ${c.supports.answers}${c.supportBack ? ', **back**' : ''}`;
      const rec = c.record;
      const move = c.error ? `error: ${c.error}` : c.decision.moved ? `**up → ${c.decision.stepAfter}**` : c.decision.heldBy ? `held: ${c.decision.heldBy}` : c.decision.supportBackChanged ? `supports ${c.decision.supportBackChanged}` : '';
      return `| ${i + 1} | ${c.step} | ${c.stage} | ${sup} | ${c.character.name} | ${rec.words ?? '–'} (${rec.wordsTarget ?? '–'} / ${rec.wordsOwn ?? '–'}) | ${rec.ownWords} / ${rec.saidBack} / ${rec.english} / ${rec.helpAsks} / ${rec.silent} | ${c.decision.felt} | ${c.decision.feltWhy ?? ''} | ${c.decision.easyInWindow} | ${c.verdict?.level ?? ''} | ${s ? `${pct(share(s.lines.map((l) => l.followable)))} / ${pct(share(s.lines.map((l) => l.withHelp)))}` : ''} | ${s ? pct(s.known ?? null) : ''} | ${move} |`;
    }),
  ];
}

function transcript(c: Run['conversations'][number]): string[] {
  return [
    `**${c.character.name}** (${c.character.role}, ${c.character.city}) · step ${c.step}, stage ${c.stage}`,
    '',
    '```',
    ...c.turns.map((t) => {
      if (t.who === 'learner') return `Learner [${t.intent}${t.learner.help ? ', help' : ''}]: ${t.learner.said || '(silent)'}`;
      const n = t.npc;
      return [
        `${c.character.name}: ${n.line}`,
        n.answers.length ? `   answers shown: ${n.answers.join(' | ')}` : '',
        n.retried ? `   (check: clear miss; first try was: ${n.firstTry})` : '',
      ].filter(Boolean).join('\n');
    }),
    '```',
    '',
  ];
}

export function buildReport(design: string, results: CountryResult[]): string {
  const first = results[0];
  const dry = results.some((r) => r.dry);
  const designs = [...new Set(results.flatMap((r) => r.runs.map((x) => x.design)))];
  const out: string[] = [
    `# Leveling prototype: design ${design}`,
    '',
    `${first.at.slice(0, 16).replace('T', ' ')} UTC · countries ${results.map((r) => r.country).join(', ')} · ${first.conversations} conversations × ${first.turns} learner turns per learner · models: character ${first.models.character}, check ${first.models.check}, judges ${first.models.judges}`,
    '',
    `Prompts: ${Object.entries(first.versions).map(([k, v]) => `${k} ${v}`).join(' · ')}. Spec: docs/research/leveling/05-designs.md.`,
    '',
    ...(dry ? ['> **Dry run: every model call was a stub with canned replies.** The numbers below exercise the code and count calls; they say nothing about Claude or the designs.', ''] : []),
    '## Comparison',
    '',
    '| Design | Country | Lines followable at the step (no help) | With help | Conversation: words known (with echo) | Without echo | Conversations 90%+ known | Improvers climb | Flat stays | Alive | Character s/line | Added s/line | Judge s/conversation (off the critical path) | Calls per line | Lines regenerated | Errors |',
    '|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|',
  ];
  for (const d of designs) for (const r of results) {
    const s = summary(r.runs.filter((x) => x.design === d));
    out.push(`| ${d} | ${r.country} | ${pct(s.followable)} | ${pct(s.withHelp)} | ${pct(s.known)} | ${pct(s.knownBare)} | ${pct(s.convFollowable)} | ${s.climbs} | ${s.flatStays} | ${f1(s.alive)} | ${f1(s.charS)} | ${f1(s.addedS)} | ${f1(s.judgeS)} | ${f1(s.callsPerLine)} | ${pct(s.retried)} | ${s.errors} |`);
  }
  out.push('', '_Followable: the level.md judge, 90%+ of the words in the language known by the stage\'s listener (stages 1–2: listener 1, stage 3: listener 2, B1: listener 3); a word said with its English echo counts as known. Conversation: the same over all of a conversation\'s words at once (one new word swings a short line). With help: also counts a line whose every phrase had its English echo, or one the learner asked help on whose next line was followable. Climb: ends above its start step. Calls per line: character + check + regenerate, per character line (the speaking judge is one more per conversation for B and C)._', '');

  out.push('## Ladder per learner', '', '| Design | Country | Learner | Steps by conversation | Moves at conversation | Supports back at |', '|---|---|---|---|---|---|');
  for (const d of designs) for (const r of results) for (const run of r.runs.filter((x) => x.design === d)) {
    const steps = run.conversations.map((c) => `${c.step}${c.supportBack ? '+' : ''}`).join(' ');
    const moves = run.conversations.flatMap((c, i) => (c.decision.moved ? [`${i + 1} (→${c.decision.stepAfter})`] : [])).join(', ') || '—';
    const back = run.conversations.flatMap((c, i) => (c.supportBack ? [i + 1] : [])).join(', ') || '—';
    out.push(`| ${d} | ${r.country} | ${run.persona} | ${steps} | ${moves} | ${back} |`);
  }
  out.push('', '_"+" marks a conversation with a support back on._', '');

  out.push('## Words spoken per conversation (first half → second half)', '');
  for (const d of designs) for (const r of results) for (const run of r.runs.filter((x) => x.design === d)) out.push(`- **${d}, ${r.country}, ${run.persona}:** ${wordsTrend(run)}`);
  out.push('');

  out.push('## Followable by stage (no help / with help)', '');
  for (const d of designs) for (const r of results) out.push(`- **${d}, ${r.country}:** ${byStage(r.runs.filter((x) => x.design === d))}`);
  out.push('');

  out.push('## Calls and cost', '', `Assumed $${PRICE_IN} / $${PRICE_OUT} per million input / output tokens (PRICE_IN, PRICE_OUT; check current pricing)${dry ? '; dry-run tokens are estimated from prompt length (4 characters a token), not measured' : ''}.`, '', '| Design | Country | ' + KINDS.join(' | ') + ' | Total calls | Tokens in / out | Cost |', '|---|---|' + KINDS.map(() => '---').join('|') + '|---|---|---|');
  for (const d of designs) for (const r of results) {
    const m = zero();
    for (const run of r.runs.filter((x) => x.design === d)) { add(m, run.meters); add(m, run.scoringMeters); }
    const total = KINDS.reduce((a, k) => a + m[k].calls, 0);
    const tin = KINDS.reduce((a, k) => a + m[k].inTokens, 0), tout = KINDS.reduce((a, k) => a + m[k].outTokens, 0);
    out.push(`| ${d} | ${r.country} | ${KINDS.map((k) => m[k].calls).join(' | ')} | ${total} | ${Math.round(tin / 1000)}k / ${Math.round(tout / 1000)}k | $${cost(m).toFixed(2)} |`);
  }
  out.push('', '_character, retry, check and speaking are what the design would cost in the app; learner is the simulator; level and quality are the scoring judges._', '');

  out.push('## Traces', '');
  for (const d of designs) for (const r of results) for (const run of r.runs.filter((x) => x.design === d)) {
    out.push(`### ${d} · ${r.country} · ${run.persona} (starts at step ${run.startStep})`, '', ...trace(run), '');
  }

  out.push('## Sample conversations', '', 'The first and last conversation of the learner who starts at the first Beginner stage, per design and country.', '');
  for (const d of designs) for (const r of results) {
    const run = r.runs.find((x) => x.design === d && x.persona === 'improving-first') ?? r.runs.find((x) => x.design === d);
    if (!run?.conversations.length) continue;
    out.push(`### ${d} · ${r.country} · ${run.persona}`, '', ...transcript(run.conversations[0]));
    if (run.conversations.length > 1) out.push(...transcript(run.conversations[run.conversations.length - 1]));
  }
  out.push('## How to read this', '', 'Simulated learners are too competent and too even (02): compare designs with each other, don\'t read the numbers as what real learners will do. Real play decides. The rules (thresholds, windows) are in tests/experiments/leveling/ladder.ts → RULES.');
  return out.join('\n');
}

export function consoleSummary(results: CountryResult[]): string {
  const designs = [...new Set(results.flatMap((r) => r.runs.map((x) => x.design)))];
  return designs.flatMap((d) => results.map((r) => {
    const s = summary(r.runs.filter((x) => x.design === d));
    const ladders = r.runs.filter((x) => x.design === d).map((run) => `${run.persona} ${run.startStep}→${run.conversations[run.conversations.length - 1]?.decision.stepAfter ?? run.startStep}`).join(', ');
    return `${d} ${r.country}: followable ${pct(s.followable)} (with help ${pct(s.withHelp)}; conversation ${pct(s.known)} known (${pct(s.knownBare)} without echo), ${pct(s.convFollowable)} of conversations 90%+) · climbs ${s.climbs} · flat stays ${s.flatStays} · alive ${f1(s.alive)} · added ${f1(s.addedS)} s/line · ${f1(s.callsPerLine)} calls/line · ${ladders}`;
  })).join('\n');
}
