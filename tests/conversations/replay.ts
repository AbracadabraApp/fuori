/**
 * Replay test: the gate for prompt changes (docs/10-testing.md → "Dialogue quality").
 *
 * Josh's real learner lines are replayed against the current prompt, with the
 * characters he talked to plus a sample he hasn't met, and every conversation is
 * scored with the same scorer as real play (lib/quality.ts). Two runs on the
 * same lines give a fair before-and-after; the gate (lib/scorecard.ts) passes a
 * change only if its target measure improves and nothing else gets worse.
 *
 *   npm run test:replay -- --refresh              # rebuild the replay set from recorded conversations
 *   npm run test:replay                           # score the current prompt
 *   npm run test:replay -- --compare=<report.json> --target=replyWords   # gate against an earlier run
 *   npm run test:replay -- --others=6 --seed=7 --turns=6 --dry
 *   npm run test:replay -- --level="Beginner: shape"   # experimental level block (content/<country>/prompts/levels.md)
 *
 * --refresh reads /api/admin/conversations (FUORI_URL, default production) with
 * ADMIN_KEY, both from .env.local. The replay set (tests/conversations/replay-set.json)
 * holds Josh's own lines, so it stays on the laptop and isn't committed.
 *
 * The learner's lines answered the original replies, not the new ones, so a
 * replayed conversation is a little less coherent than a real one. That's the
 * same for both sides of a comparison, so differences still show.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { CLAUDE_MODEL } from '@/lib/claude';
import { runTurn } from '@/lib/turn';
import { promptVersion } from '@/lib/prompts/build-turn-prompt';
import { characterForPlace } from '@/lib/characters/for-place';
import { cities } from '@/content';
import { scoreConversation, qualityPromptVersion, type ConversationScore, type ScoredTurn } from '@/lib/quality';
import { scorecard, gate, scorecardAsText, MEASURES, type Scorecard } from '@/lib/scorecard';
import type { CharacterSheet, Turn } from '@/lib/types';

const flag = (name: string) => process.argv.find((a) => a.startsWith(`--${name}=`))?.split('=').slice(1).join('=');
const has = (name: string) => process.argv.includes(`--${name}`);
const TURNS = Number(flag('turns') ?? 6);
const OTHERS = Number(flag('others') ?? 4);
const SEED = Number(flag('seed') ?? 7);
const DRY = has('dry');
const COMPARE = flag('compare');
const TARGET = flag('target') ?? 'replyWords';
const LABEL = flag('label');
const LEVEL = flag('level');

const DIR = join(process.cwd(), 'tests', 'conversations');
const SET_FILE = join(DIR, 'replay-set.json');
const REPORTS = join(DIR, 'reports');

interface Script {
  /** The conversation the lines came from */
  from: string;
  characterId: string;
  lines: string[];
}

// ---------- Characters ----------

const everyone = cities.flatMap((city) =>
  city.places.flatMap((place) => {
    const c = characterForPlace(city, place);
    return c ? [{ character: c, cityName: city.name, cityId: city.id }] : [];
  })
);
const byId = new Map(everyone.map((x) => [x.character.id, x]));

function seeded(seed: number) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

/** Characters Josh hasn't talked to: one per city, the same ones for the same seed. */
function others(exclude: Set<string>, n: number): CharacterSheet[] {
  const random = seeded(SEED);
  const pool = everyone.filter((x) => !exclude.has(x.character.id));
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const seen = new Set<string>();
  return pool.filter((x) => (seen.has(x.cityId) ? false : (seen.add(x.cityId), true))).slice(0, n).map((x) => x.character);
}

// ---------- Replay set ----------

async function refresh() {
  const base = process.env.FUORI_URL ?? 'https://fuori-production.up.railway.app';
  const key = process.env.ADMIN_KEY;
  if (!key) throw new Error('ADMIN_KEY is not set (put it in .env.local)');
  const res = await fetch(`${base}/api/admin/conversations?limit=200`, { headers: { 'x-admin-key': key } });
  if (!res.ok) throw new Error(`admin endpoint: HTTP ${res.status}`);
  const conversations = (await res.json()) as { id: string; character_id: string; turns: { who: string; text: string }[] }[];
  const scripts: Script[] = conversations
    .map((c) => ({ from: c.id, characterId: c.character_id, lines: c.turns.filter((t) => t.who === 'learner').map((t) => t.text.trim()).filter(Boolean) }))
    .filter((s) => s.lines.length >= 2 && byId.has(s.characterId));
  mkdirSync(DIR, { recursive: true });
  writeFileSync(SET_FILE, JSON.stringify({ at: new Date().toISOString(), source: base, scripts }, null, 2));
  console.log(`Replay set: ${scripts.length} conversations with 2+ learner lines (of ${conversations.length}) → ${SET_FILE.replace(process.cwd() + '/', '')}`);
}

function loadSet(): Script[] {
  if (!existsSync(SET_FILE)) throw new Error('No replay set yet. Run: npm run test:replay -- --refresh');
  return (JSON.parse(readFileSync(SET_FILE, 'utf8')) as { scripts: Script[] }).scripts;
}

interface Case {
  character: CharacterSheet;
  script: Script;
  /** Josh talked to this character (true) or a sample character got his lines (false) */
  own: boolean;
}

function cases(scripts: Script[]): Case[] {
  const own = scripts.map((s) => ({ character: byId.get(s.characterId)!.character, script: s, own: true }));
  const extra = others(new Set(scripts.map((s) => s.characterId)), OTHERS).map((character, i) => ({
    character,
    script: scripts[i % scripts.length],
    own: false,
  }));
  return [...own, ...extra];
}

// ---------- Run ----------

interface Result {
  case: Case;
  turns: ScoredTurn[];
  score?: ConversationScore;
  error?: string;
}

async function replay(c: Case): Promise<Result> {
  const transcript: Turn[] = [];
  // How long each reply takes (the "faster" goal); the opening isn't a reply
  const replyMs: number[] = [];
  try {
    const opening = await runTurn({ character: c.character, transcript: [], level: LEVEL });
    transcript.push({ who: 'npc', transcript: opening.line, translation: opening.en });
    for (const said of c.script.lines.slice(0, TURNS)) {
      const started = performance.now();
      const reply = await runTurn({ character: c.character, transcript, learnerSaid: said, level: LEVEL });
      replyMs.push(Math.round(performance.now() - started));
      transcript.push({ who: 'learner', transcript: said });
      transcript.push({ who: 'npc', transcript: reply.line, translation: reply.en });
    }
    const turns = transcript.map((t) => ({ who: t.who, text: t.transcript }));
    return { case: c, turns, score: { ...(await scoreConversation(c.character, turns)), replyMs } };
  } catch (e) {
    return { case: c, turns: transcript.map((t) => ({ who: t.who, text: t.transcript })), error: e instanceof Error ? e.message : String(e) };
  }
}

async function runAll(all: Case[]): Promise<Result[]> {
  const results: Result[] = [];
  const queue = [...all];
  const worker = async () => {
    for (let c = queue.shift(); c; c = queue.shift()) {
      const r = await replay(c);
      results.push(r);
      console.log(`  ${r.error ? '✗' : '✓'} ${c.character.name}${c.own ? '' : ' (sample)'}${r.score ? `: median ${r.score.stats.wordsMedian} words` : `: ${r.error}`}`);
    }
  };
  await Promise.all([worker(), worker(), worker()]);
  return results;
}

// ---------- Report ----------

function save(label: string, results: Result[], card: Scorecard, extra: string[] = []): string {
  mkdirSync(REPORTS, { recursive: true });
  const file = join(REPORTS, `replay-${new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-')}-${label}`);
  const head = `prompt ${promptVersion()}${LEVEL ? ` + level "${LEVEL}"` : ''} · model ${CLAUDE_MODEL} · judge ${qualityPromptVersion()} · ${TURNS} learner lines each`;
  const md = [
    `# Replay test: ${label}`,
    ``,
    `${new Date().toISOString().slice(0, 16).replace('T', ' ')} UTC · ${head}`,
    ``,
    '```',
    scorecardAsText('Scorecard', card),
    '```',
    ...extra,
    ``,
    `## Conversations`,
    ``,
    ...results.flatMap((r) => [
      `### ${r.case.character.name} (${r.case.character.role})${r.case.own ? '' : ' · sample character, Josh\'s lines'}${r.error ? ` · failed: ${r.error}` : ''}`,
      r.score?.judge.note && r.score.judge.note !== 'None' ? `\n_${r.score.judge.note}_\n` : '',
      '```',
      ...r.turns.map((t) => `${t.who === 'npc' ? r.case.character.name : 'Josh'}: ${t.text}`),
      '```',
      '',
    ]),
  ].join('\n');
  writeFileSync(`${file}.md`, md);
  writeFileSync(
    `${file}.json`,
    JSON.stringify({ at: new Date().toISOString(), promptVersion: promptVersion(), level: LEVEL ?? null, model: CLAUDE_MODEL, judgeVersion: qualityPromptVersion(), turns: TURNS, scorecard: card, scores: results.filter((r) => r.score).map((r) => ({ id: r.case.character.id, own: r.case.own, score: r.score })) }, null, 2)
  );
  return file.replace(process.cwd() + '/', '');
}

// Broken conversations count against the change (lib/scorecard.ts gate), not just dropped
const scored = (rs: Result[]) => scorecard(rs.flatMap((r) => (r.score ? [r.score] : [])), rs.filter((r) => r.error).length);

async function main() {
  if (has('refresh')) return refresh();
  if (!MEASURES.some((m) => m.key === TARGET)) throw new Error(`--target must be one of ${MEASURES.map((m) => m.key).join(', ')}`);

  const all = cases(loadSet());
  console.log(`Prompt ${promptVersion()}${LEVEL ? ` + level "${LEVEL}"` : ''} · ${all.length} conversations (${all.filter((c) => c.own).length} real, ${all.filter((c) => !c.own).length} sample characters, seed ${SEED}) · ${TURNS} lines each`);
  all.forEach((c) => console.log(`  ${c.character.name} (${c.character.role})${c.own ? '' : ' · sample'} ← ${c.script.lines.length} lines from ${c.script.from.slice(0, 8)}`));
  const calls = all.length * (Math.min(TURNS, 99) + 2);
  if (DRY) return console.log(`\nDry run: no API calls. About ${calls} calls in a real run.`);
  if (!process.env.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY is not set (put it in .env.local).');

  const results = await runAll(all);
  const card = scored(results);
  let extra: string[] = [];
  if (COMPARE) {
    const before = (JSON.parse(readFileSync(COMPARE, 'utf8')) as { scorecard: Scorecard }).scorecard;
    const g = gate(before, card, TARGET);
    extra = [``, `## Gate against ${COMPARE}: ${g.pass ? 'PASS' : 'FAIL'} (target ${TARGET})`, ``, ...g.lines.map((l) => `- ${l}`)];
    console.log(`\n${g.lines.join('\n')}\n\nGate: ${g.pass ? 'PASS' : 'FAIL'}`);
  }
  const file = save(LABEL ?? `prompt-${promptVersion()}`, results, card, extra);
  console.log(`\n${scorecardAsText('Scorecard', card)}\n\nReport: ${file}.md (+ .json)`);
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
