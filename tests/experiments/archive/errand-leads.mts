// Does culture or weather take over an ordinary visit? (Josh, 2026-11-03:
// "The weather and the culture shouldn't dominate getting a slice of pizza";
// docs/culture.md.) Ordinary visits in Rome, each with an errand, played with
// the real turn code (lib/turn.ts) and the conversation test's simulated
// learners, in four versions of the character's setting: today's, plus a pride
// line, plus a weather line, plus both. A judge tags every character line as
// errand, culture, weather or other, and says whether the errand got done.
// Intermediate path only (runTurn); Beginner dialogue (lib/beginner.ts) not
// covered. Nothing is written to content.
//   npx tsx --env-file-if-exists=.env.local tests/experiments/archive/errand-leads.mts
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { cities } from '@/content';
import { characterForPlace } from '@/lib/characters/for-place';
import { runTurn } from '@/lib/turn';
import type { CharacterSheet, Turn } from '@/lib/types';
import { learners } from '../../conversations/learners';
import { ask, OUT, pool } from '../common.mjs';

const TURNS = 5;
const WEATHER = 'Today in Rome: heavy rain since this morning, 12°C, a cold wind.';
// Pride lines from the culture-lesson trial (Claude's picks, fact judge passed), shortened
const VISITS = [
  { place: 'forno-trastevere', errand: 'buy a slice of pizza for lunch', pride: 'What you care about: pizza bianca is Rome\'s own, cut with scissors and sold by weight; Romans split it and fill it with mortadella, "pizza e mortazza".' },
  { place: 'bar-monti-corner', errand: 'have a coffee at the bar', pride: 'What you care about: Rome is split between romanisti and laziali; Lazio (1900) wears the Greek flag\'s sky blue and white, Roma (1927) the city\'s yellow and red; the Monday after a derby the counter gets loud. You\'re a romanista.' },
  { place: 'volpetti-testaccio', errand: 'buy some guanciale to make carbonara', pride: 'What you care about: the quinto quarto, the offal the workers of Testaccio\'s slaughterhouse took home, which became coda alla vaccinara, trippa and pajata, the real taste of the quarter.' },
  { place: 'trattoria-garbatella', errand: 'order lunch', pride: 'What you care about: Roman trattorie keep a weekly rhyme, giovedì gnocchi, venerdì pesce, sabato trippa; a trattoria with no gnocchi on Thursday gets questioned.' },
  { place: 'grattachecca-lungotevere', errand: 'buy a grattachecca', pride: 'What you care about: the Festa de\' Noantri every July in Trastevere, when the Madonna del Carmine is carried through the streets; "noantri" is Roman for noi altri, we others.' },
  { place: 'tabaccheria-pigneto', errand: 'buy a bus ticket', pride: 'What you care about: Pasolini filmed Accattone in Pigneto\'s streets in 1961; the neighbourhood still remembers it.' },
];
const VERSIONS = ['today', 'pride', 'weather', 'both'] as const;
const LEARNERS = learners.filter((l) => ['english-beginner', 'improving'].includes(l.id));

const city = cities.find((c) => c.id === 'roma-nuova')!;

function withSetting(c: CharacterSheet, extra: string[]): CharacterSheet {
  return extra.length ? { ...c, appearance: { ...c.appearance!, setting: [c.appearance?.setting ?? '', ...extra].join(' ') } } : c;
}

const show = (t: Turn[], name: string) => t.map((x) => `${x.who === 'npc' ? name : 'Learner'}: ${x.transcript}`).join('\n');

async function visit(v: typeof VISITS[number], version: typeof VERSIONS[number], learner: typeof LEARNERS[number]) {
  const place = city.places.find((p) => p.id === v.place)!;
  const base = characterForPlace(city, place)!;
  const extra = [...(version === 'pride' || version === 'both' ? [v.pride] : []), ...(version === 'weather' || version === 'both' ? [WEATHER] : [])];
  const character = withSetting(base, extra);
  const transcript: Turn[] = [];
  const open = await runTurn({ character, transcript: [] });
  transcript.push({ who: 'npc', transcript: open.line, translation: open.en });
  for (let i = 0; i < TURNS; i++) {
    const said = await ask(`Conversation so far:\n${show(transcript, character.name)}\n\nWhat do you say next?`, {
      system: `You are role-playing an Italian learner in a test. ${learner.description}
You are at ${place.name} in Rome, talking to ${character.name} (${character.role}). You came here to ${v.errand}; do it the way a real customer would, and chat if they chat.
Be honest about comprehension: understand only what someone at your level really would; if the last line was too much, say so. Write ONLY what you say next, as speech-to-text would capture it. One or two short sentences. When the errand is done and the talk has ended, say goodbye.`,
      max: 2000,
    });
    transcript.push({ who: 'learner', transcript: said });
    const r = await runTurn({ character, transcript: transcript.slice(0, -1), learnerSaid: said });
    transcript.push({ who: 'npc', transcript: r.line, translation: r.en });
  }
  return { v, version, learner: learner.id, name: character.name, transcript };
}

const JUDGE = `You read a conversation in a language-learning game set in Rome: a learner came to a place for an errand. Tag each of the CHARACTER's lines (numbered) with what it is mainly about: "errand" (the business the learner came for: ordering, choosing, paying, the product itself), "culture" (the city's food history, traditions, art, football or neighbourhood pride beyond the errand), "weather", or "other" (greetings, small talk about the learner, goodbyes). Then say whether the errand got done.`;
const judgeSchema = {
  type: 'object', additionalProperties: false, required: ['tags', 'errand_done'],
  properties: { tags: { type: 'array', items: { type: 'string', enum: ['errand', 'culture', 'weather', 'other'] } }, errand_done: { type: 'boolean' } },
};

const jobs = VISITS.flatMap((v) => VERSIONS.flatMap((version) => LEARNERS.map((l) => () => visit(v, version, l))));
const runs = await pool(jobs, 6);
const judged = await pool(runs.map((r) => async () => {
  const npc = r.transcript.filter((t) => t.who === 'npc');
  const j = JSON.parse(await ask(`Errand: ${r.v.errand}\n\n${show(r.transcript, r.name)}\n\nThe character's lines, numbered:\n${npc.map((t, i) => `${i + 1}. ${t.transcript}`).join('\n')}`, { system: JUDGE, schema: judgeSchema, max: 1500 }));
  return { ...r, tags: j.tags as string[], done: j.errand_done as boolean };
}), 6);

let md = `# Does culture or weather take over an ordinary visit? Rome, ${new Date().toISOString().slice(0, 10)}\n\n${VISITS.length} visits × ${VERSIONS.length} versions × ${LEARNERS.length} learners, ${TURNS} learner turns each. Share of character lines by what they're about; opener = the first line.\n\n| Version | errand | culture | weather | other | opener not errand/greeting | errand done |\n|---|---|---|---|---|---|---|\n`;
for (const version of VERSIONS) {
  const rs = judged.filter((r) => r.version === version);
  const tags = rs.flatMap((r) => r.tags);
  const pct = (k: string) => `${Math.round(100 * tags.filter((t) => t === k).length / tags.length)}%`;
  const openers = rs.filter((r) => ['culture', 'weather'].includes(r.tags[0])).length;
  md += `| ${version} | ${pct('errand')} | ${pct('culture')} | ${pct('weather')} | ${pct('other')} | ${openers}/${rs.length} | ${rs.filter((r) => r.done).length}/${rs.length} |\n`;
}
md += `\n## Conversations\n\n`;
for (const r of judged) {
  md += `### ${r.name} · ${r.version} · ${r.learner} · errand: ${r.v.errand} · done: ${r.done}\n\n\`\`\`\n${r.transcript.map((t) => `${t.who === 'npc' ? r.name : 'Learner'}: ${t.transcript}`).join('\n')}\n\`\`\`\nTags: ${r.tags.join(', ')}\n\n`;
}
const file = join(OUT, `errand-leads-${Date.now()}.md`);
writeFileSync(file, md);
console.log(file);
