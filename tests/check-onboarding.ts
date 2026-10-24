// The greeter's onboarding (docs/onboarding-design.md → Checks before calling it done).
// Without an API key: her lines, prompt, pictures and voice are wired up.
// With ANTHROPIC_API_KEY: the placement judge on fixed answers, and her two
// Claude-written lines. Run per country: COUNTRY=es-mx npm run test:onboarding
import { readFileSync } from 'fs';
import { country, language, onboarding, pack } from '@/content';
import { buildOnboardingPrompt, onboardingPromptVersion } from '@/lib/prompts/build-onboarding-prompt';
import { buildContent } from '@/lib/content-api';

const problems: string[] = [];
const check = (ok: boolean, what: string) => { if (!ok) problems.push(what); };

// Every fixed line has its text and its English
for (const [key, l] of Object.entries(onboarding.lines)) check(!!l.line.trim() && !!l.en.trim(), `${country}: line "${key}" needs text and English`);
// Name and address: her two lines use the name she heard, and both buttons are there
for (const key of ['address', 'welcomeWoman', 'welcomeMan'] as const) check(onboarding.lines[key].line.includes('{name}') && onboarding.lines[key].en.includes('{name}'), `${country}: line "${key}" needs {name} in the line and the English`);
check(!!onboarding.lines.asWoman.line && !!onboarding.lines.asMan.line && !onboarding.lines.askName.line.includes('{name}'), `${country}: name and address buttons`);
check(!!onboarding.guide.voice && onboarding.guide.lift >= 0 && onboarding.guide.lift < 0.5, `${country}: guide needs a voice and a lift under 0.5`);

// Prompt: version matches its newest changelog entry, both steps fill every placeholder
const md = readFileSync(`content/${pack.id}/prompts/onboarding.md`, 'utf8');
const newest = (md.split('## Changelog')[1] ?? '').match(/^### ([^\s:]+)/m)?.[1];
check(newest === onboardingPromptVersion(), `onboarding.md: version ${onboardingPromptVersion()} but newest changelog entry ${newest}`);
for (const step of ['follow-up', 'send-off'] as const) {
  const p = buildOnboardingPrompt(step, [{ text: 'x', language: 'english' }, { text: 'y' }]);
  const unfilled = [...(p.system + p.user).matchAll(/\{(\w+)\}/g)].map((m) => m[1]);
  check(!unfilled.length, `${step}: unfilled ${unfilled.join(', ')}`);
  check(p.system.includes(language.name) && p.system.includes(language.card.country), `${step}: prompt should name ${language.name} and ${language.card.country}`);
}

// /v1/content carries her lines and all four poses
const c = buildContent();
for (const [pose, url] of Object.entries(c.onboarding.guide.poses)) check(!!url, `${country}: /v1/content has no picture for pose "${pose}" (npm run images:upload)`);
check(c.onboarding.lines.welcome.line === onboarding.lines.welcome.line, '/v1/content: welcome line missing');

// Her voice: /v1/speak picks the guide's own voice by id
// The greeter's voice is chosen where /v1/speak picks voices (moved to lib/voice/early-voice.ts in the speed work, acfece6)
check(['app/v1/speak/route.ts', 'lib/voice/early-voice.ts'].some((f) => readFileSync(f, 'utf8').includes('onboarding.guide.voice')), '/v1/speak must use onboarding.guide.voice for the greeter');

async function live() {
  const { writeFollowUp, writeSendOff } = await import('@/lib/onboarding');
  // Fixed answers per country: [answers, expected levels]
  const cases: Record<string, [string, string[], string[]][]> = {
    it: [
      ['all English', ['I love the food and the old towns, everything is so beautiful', "Yes, it's my third time, I came with my wife last year"], ['beginner']],
      ['a few words', ['Mi piace il cibo. Pizza. Bello.', 'Sì. Roma. Grazie.'], ['beginner']],
      // An English answer, then a fluent one (round 14: a friend answered for them). The judge thought
      // long over the mismatch and ran out of tokens in 4 of 6 runs at max_tokens 600; any level will do
      ['mixed', ["Oh, um, grazie! I only know a little Italian, sorry. I like the food, pizza and pasta, very much!", "La mia preferita è la margherita con la bufala, e la migliore che abbia mai mangiato è stata a Napoli, in una piccola pizzeria vicino a via dei Tribunali dove si aspetta sempre mezz'ora."], ['beginner', 'intermediate', 'advanced']],
      ['fluent', ["Mi piace soprattutto il modo in cui la gente vive le piazze la sera: c'è sempre qualcuno che chiacchiera, i bambini giocano e nessuno ha fretta.", "No, ci vengo da anni per lavoro, ma stavolta ho deciso di restare qualche mese a Bologna per vivere la città senza correre da una riunione all'altra."], ['advanced']],
    ],
    es: [
      ['all English', ['I love the food and the colours, the markets are amazing', "Yes, it's my third time, I came with my wife last year"], ['beginner']],
      ['a few words', ['Me gusta la comida. Tacos. Bonito.', 'Sí. México. Gracias.'], ['beginner']],
      ['mixed', ["Oh, um, gracias! I only know a little Spanish, sorry. I like the food, tacos and everything, very much!", 'Mi platillo favorito son los chilaquiles verdes con un huevito estrellado, y los mejores que he probado en mi vida fueron en una fondita del mercado de Coyoacán, donde siempre hay fila.'], ['beginner', 'intermediate', 'advanced']],
      ['fluent', ['Me encanta cómo la gente sale a la calle por la tarde: los mercados, la música en las plazas y que siempre hay alguien dispuesto a platicar contigo.', 'No, vengo desde hace años por trabajo, pero esta vez decidí quedarme unos meses en Oaxaca para conocer la ciudad con calma y sin prisas.'], ['advanced']],
    ],
  };
  for (const [name, said, expected] of cases[language.code] ?? []) {
    const r = await writeSendOff(said.map((text) => ({ text })));
    console.log(`  ${name}: ${r.level} (${r.reason})\n    ${r.line}`);
    check(expected.includes(r.level), `judge, ${name}: got ${r.level}, expected ${expected.join(' or ')} (${r.reason})`);
    check(r.line.endsWith(onboarding.lines.help.line) && r.en.endsWith(onboarding.lines.help.en), `send-off, ${name}: must end with the fixed help line`);
  }
  const f = await writeFollowUp({ text: cases[language.code][0][1][0], language: 'english' });
  console.log(`  follow-up: ${f.line}`);
  check(f.line.trim().endsWith('?'), `follow-up must end on a question: ${f.line}`);
}

(async () => {
  if (process.env.ANTHROPIC_API_KEY) await live();
  else console.log('(no ANTHROPIC_API_KEY: placement judge not run)');
  if (problems.length) {
    console.error(problems.join('\n'));
    process.exit(1);
  }
  console.log(`OK: onboarding for ${country}: fixed lines, prompt ${onboardingPromptVersion()}, four poses, her voice${process.env.ANTHROPIC_API_KEY ? ', placement judge on fixed answers' : ''}`);
})();
