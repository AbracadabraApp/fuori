// Rewrites the portrait prompts of everyone at a shown place, in the shape that
// made Mexico's portraits work: the person at their own place, named down to the
// street and neighbourhood, the place drawn behind them, confident colour. The
// medium is the city's place style (or, in a city without one, the medium of the
// person's place picture), and the colours are taken from that place picture.
// Josh, 2026-11-14, after three Italian samples: "Lets redo all the visible (not
// hidden) portraits in Italy - in the city's style, and characters setting -
// borrow colors for portrait from place card"; and "none of the new ones look at
// the user", so they look up at the viewer.
//   npx tsx --env-file=.env.local scripts/portrait-prompts.mts [city,city]   → writes /tmp/portrait-prompts.<country>.json
//   npx tsx scripts/portrait-prompts.mts --write                           → puts them in the city files
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { anthropic, CLAUDE_MODEL, replyText } from '@/lib/claude';
import { cities, country, pack, tutor } from '@/content';

const out = `/tmp/portrait-prompts.${country}.json`;
const generation = JSON.parse(readFileSync(`content/${country}/generation.json`, 'utf8'));
const placeStyles: Record<string, string> = generation.placeStyles ?? {};

if (process.argv.includes('--write')) {
  const prompts = JSON.parse(readFileSync(out, 'utf8')) as { city: string; id: string; prompt: string }[];
  let written = 0;
  for (const [city, list] of Object.entries(Object.groupBy(prompts, (p) => p.city))) {
    const file = `content/${country}/cities/${city}.ts`;
    let text = readFileSync(file, 'utf8');
    for (const p of list ?? []) {
      // The person's block starts at its id; replace the first portraitPrompt string after it
      const start = text.search(new RegExp(`id:\\s*['"]${p.id}['"]`));
      if (start < 0) throw new Error(`${city}/${p.id} not found`);
      const re = /portraitPrompt:\s*(?:'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*")/y;
      const at = text.indexOf('portraitPrompt:', start);
      re.lastIndex = at;
      const m = re.exec(text);
      if (!m) throw new Error(`${city}/${p.id}: no portraitPrompt`);
      text = text.slice(0, at) + `portraitPrompt: ${JSON.stringify(p.prompt)}` + text.slice(at + m[0].length);
      written++;
    }
    writeFileSync(file, text);
  }
  console.log(`Wrote ${written} portrait prompts into content/${country}/cities`);
  process.exit(0);
}

/** The place picture's main colours, as hex with their share, paper white left out */
function palette(placeId: string): string {
  const file = `public${pack.images}/places/${placeId}.jpg`;
  if (!existsSync(file)) return '';
  const txt = execFileSync('magick', [file, '-resize', '120x120', '-colors', '8', '-format', '%c', 'histogram:info:-'], { encoding: 'utf8' });
  const colours = [...txt.matchAll(/^\s*(\d+):.*?(#[0-9A-F]{6})/gim)].map((m) => ({ n: Number(m[1]), hex: m[2] }));
  const total = colours.reduce((s, c) => s + c.n, 0);
  return colours
    .filter((c) => !/^#(F[0-9A-F]){3}$/i.test(c.hex)) // near-white paper
    .sort((a, b) => b.n - a.n)
    .map((c) => `${c.hex} ${Math.round((100 * c.n) / total)}%`)
    .join(', ');
}

const instruction = `You write prompts for an image model: portraits of the people a language learner meets in ${generation.country}'s cities. Each portrait shows one person at their own place, so the learner sees who they are and where.

For each person, write one prompt of 90 to 130 words, in this order:
1. The medium, taken from the style given (for example "Pencil and watercolour portrait on textured paper, loose hand-drawn line, sunlit"). Use the style's way of making a picture and its light; leave out its rules about streets, crowds, scooters or signs.
2. The person: age, a few true details of face, hair and clothes, and their expression. Keep what the old prompt says about how they look when it fits; drop vague words like "cultured" or "artisan pride".
3. What they are doing with their hands at work, and that they look up from it straight at the viewer, as if someone they know has just come in.
4. "who [their role] at [place name], [neighbourhood], [city]".
5. "Include" their place behind them, as it is in the place's own description: its counter, shelves, tools, room or view.
6. "Colour from their place:" three or four colours named the way a painter would (terracotta, sage green, Naples yellow), chosen from the place picture's colours given as hex. Ignore greys and near-whites unless they are most of the picture.
7. "Full of character. Tall portrait format."

Nothing else: no words, signs or lettering requested, no posing, no rules (they are added after).`;

const schema = {
  type: 'object',
  properties: { prompts: { type: 'array', items: { type: 'object', properties: { id: { type: 'string' }, prompt: { type: 'string' } }, required: ['id', 'prompt'], additionalProperties: false } } },
  required: ['prompts'],
  additionalProperties: false,
};

const wanted = new Set((process.argv[2] ?? '').split(',').filter(Boolean));
const results: { city: string; id: string; prompt: string }[] = existsSync(out) ? JSON.parse(readFileSync(out, 'utf8')) : [];
const done = new Set(results.map((r) => `${r.city}/${r.id}`));

for (const city of cities.filter((c) => !c.hidden && (!wanted.size || wanted.has(c.id)))) {
  const people = city.places
    .filter((p) => !p.hidden && p.characterId && p.characterId !== tutor.id)
    .map((place) => ({ place, person: (city.characters ?? []).find((ch) => ch.id === place.characterId) }))
    .filter((x) => x.person && !done.has(`${city.id}/${x.person.id}`));
  if (!people.length) continue;
  const items = people.map(({ place, person }) => ({
    id: person!.id,
    gender: person!.gender,
    age: person!.age,
    role: person!.role,
    personality: person!.personality,
    oldPrompt: person!.portraitPrompt,
    place: { name: place.name, kind: place.kind, neighbourhood: place.neighbourhood, description: place.imagePrompt },
    style: placeStyles[city.id] ?? '(no city style: use the medium of the place description)',
    placePictureColours: palette(place.id),
  }));
  const r = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 16000,
    system: instruction,
    messages: [{ role: 'user', content: `City: ${city.name}\n${JSON.stringify(items, null, 1)}` }],
    output_config: { format: { type: 'json_schema', schema } },
  } as Parameters<typeof anthropic.messages.create>[0]);
  const { prompts } = JSON.parse(replyText(r as Parameters<typeof replyText>[0])) as { prompts: { id: string; prompt: string }[] };
  for (const p of prompts) if (items.some((i) => i.id === p.id)) results.push({ city: city.id, id: p.id, prompt: p.prompt });
  writeFileSync(out, JSON.stringify(results, null, 1));
  console.log(`${city.id}: ${prompts.length} of ${items.length}`);
}
console.log(`${results.length} prompts in ${out}`);
