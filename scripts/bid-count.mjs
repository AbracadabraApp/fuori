// Phase 3 of docs/dialogue-plan.md: what the learner did after each kind of bid, from saved visits.
// Reads the private snapshot (argv[2], from scripts/archive-conversations.mjs); prints counts only, no learner lines.
//   node scripts/bid-count.mjs ~/fuori-archive/conversations-<date>.json
import fs from 'node:fs';

const all = JSON.parse(fs.readFileSync(process.argv[2]));
const TEST = new Set('4111bd 76781b 04f8b6 1a3182 f4c74d 363c14 844461 df5aa7 93b706 8a09e7 c07ed9 8d77bb 81ac20'.split(' '));
const ordinary = all.filter((c) => !TEST.has(c.learner_id.slice(0, 6)) && !/^(lesson|magda|onboarding)/.test(c.prompt_version) && c.character_id !== 'magda');

const levelOf = (v) => (/^beginner-2-/.test(v) ? 'B2' : v.startsWith('beginner') ? 'B1' : 'Int');
const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\p{L}\p{N}\s]/gu, ' ').split(/\s+/).filter(Boolean);
const close = (said, answer) => {
  const a = new Set(norm(said)), b = new Set(norm(answer.replace(/…/g, '')));
  if (!a.size || !b.size) return false;
  const inter = [...a].filter((w) => b.has(w)).length;
  return inter / Math.max(a.size, b.size) >= 0.6 || (inter >= 2 && inter / b.size >= 0.75);
};

function kindOf(t, i) {
  if (t.beats?.length || t.steps?.shape === 'intro') return 'intro';
  const setup = t.steps?.setup;
  if (setup) return { opener: 'opener', 'two-en': 'two answers', 'ask-en': 'questions to ask', goodbye: 'goodbye setup', free: 'no answers', 'one-en': 'one answer' }[setup] ?? setup;
  const answers = (t.parts ?? []).filter((p) => p.kind === 'answer');
  const question = (t.parts ?? []).some((p) => p.kind === 'question');
  if (t.parts) {
    if (answers.some((a) => /[?¿]/.test(a.text))) return 'questions to ask';
    if (answers.some((a) => a.text.includes('…'))) return 'fill in (…)';
    if (answers.length >= 2) return 'two answers';
    if (answers.length === 1) return 'one answer';
    return question ? 'question, no answers' : 'statement';
  }
  if (i === 0) return 'opening';
  return /[?¿]\s*$/.test(t.text.trim()) ? 'question' : /[?¿]/.test(t.text) ? 'asks and carries on' : 'statement';
}

const rows = {};
const add = (key, r) => {
  const o = (rows[key] ??= { n: 0, left: 0, silent: 0, saidBack: 0, own: 0, words: [], goesOn: 0 });
  o.n++;
  if (r.left) return o.left++;
  if (r.silent) o.silent++;
  if (r.saidBack) o.saidBack++;
  if (r.own) o.own++;
  o.words.push(r.words);
  if (r.goesOn) o.goesOn++;
};

for (const c of ordinary) {
  const lvl = levelOf(c.prompt_version);
  const era = lvl === 'Int' ? (c.prompt_version >= '2026-11-10' ? ' (11-10q on)' : ' (before 11-10)') : '';
  c.turns.forEach((t, i) => {
    if (t.who !== 'npc') return;
    const kind = kindOf(t, i);
    const next = c.turns[i + 1];
    const answers = (t.parts ?? []).filter((p) => p.kind === 'answer').map((p) => p.text);
    if (!next || next.who === 'npc') return add(`${lvl}${era} | ${kind}`, { left: true });
    const said = (next.text ?? '').trim();
    const words = norm(said).length;
    const saidBack = answers.some((a) => close(said, a));
    const goesOn = c.turns.slice(i + 2).filter((x) => x.who !== 'npc').length >= 1;
    add(`${lvl}${era} | ${kind}`, { silent: words === 0, saidBack, own: words > 0 && !saidBack, words, goesOn });
  });
}

const med = (xs) => (xs.length ? xs.slice().sort((a, b) => a - b)[Math.floor(xs.length / 2)] : '-');
const pct = (x, n) => (n ? `${Math.round((100 * x) / n)}%` : '-');
console.log(`ordinary visits: ${ordinary.length} of ${all.length}; learners ${new Set(ordinary.map((c) => c.learner_id)).size}`);
console.log('level | bid kind | bids | left after it | replied: said back | own words | median words | the visit went on after the reply');
for (const [k, o] of Object.entries(rows).sort()) {
  const replied = o.n - o.left;
  console.log(`${k} | ${o.n} | ${pct(o.left, o.n)} | ${pct(o.saidBack, replied)} | ${pct(o.own, replied)} | ${med(o.words)} | ${pct(o.goesOn, replied)}`);
}
