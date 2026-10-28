// Josh's two Italian turns that Whisper called English and translated
// (2026-10-27): does say it send them to the character as said? N runs each.
//   npx tsx --env-file=.env.local tests/experiments/say-it-two.mts [runs]
import { cities } from '@/content';
import { characterForPlace } from '@/lib/characters/for-place';
import { writeSayIt } from '@/lib/say-it';

const runs = Number(process.argv[2] ?? 5);
const at = (cityId: string, placeId: string) => { const c = cities.find((x) => x.id === cityId)!; return characterForPlace(c, c.places.find((p) => p.id === placeId)!)!; };
const cases = [
  { who: at('napoli', 'mercato-pignasecca'), transcript: [
      { who: 'npc' as const, transcript: 'Welcome to the Pignasecca, the oldest street market in Naples, where everybody shouts and nobody is angry. Buongiorno! Mi chiamo Salvatore. Guardi che belle arance! beautiful oranges Come si chiama Lei? your name?' },
      { who: 'learner' as const, transcript: 'Buongiorno Salvatore, mi chiamo Joshua' },
      { who: 'npc' as const, transcript: 'Piacere, Joshua! Le arance sono dolci oggi. sweet oranges Che cosa desidera, Joshua? what do you want?' },
      { who: 'learner' as const, transcript: "Mmm, I'm just looking around, thank you." },
      { who: 'npc' as const, transcript: "No problem at all, take your time, look at everything! Guardi pure, c'è tutto! look, we have everything These are lemons from the Amalfi coast, huge and fragrant. Le piacciono i limoni o preferisce le mele? lemons or apples?" }],
    english: "I like the lemons, but it doesn't have a reason for use. Excuse me, I don't speak Italian well.",
    learned: 'Mi piace i limoni ma non ha un ragione adesso per usa. Scusa, mi non parla italiano bene.' },
  { who: at('roma-nuova', 'sapienza-scalinata'), transcript: [
      { who: 'npc' as const, transcript: 'Welcome to Pizzeria Da Gigi, a little pizza place in the student neighbourhood of San Lorenzo in Rome. I\'m Giorgia. Ciao, benvenuto! Io sono Giorgia. Come si chiama? your name?' },
      { who: 'learner' as const, transcript: 'Mi chiamo Joshua.' },
      { who: 'npc' as const, transcript: 'Ecco l\'acqua frizzante, e la pizza arriva presto. pizza coming soon Vuole pagare adesso o dopo? pay now or later' },
      { who: 'learner' as const, transcript: 'Odesso, por favore.' },
      { who: 'npc' as const, transcript: 'Sono dodici euro in tutto. Paga con la carta o in contanti? card or cash' }],
    english: "I'm going to go to the next one.", learned: 'Pagokonlacar, tajarazzi.' },
];
for (const c of cases) {
  let asSaid = 0; const lines: string[] = [];
  for (let i = 0; i < runs; i++) {
    const r = await writeSayIt(c.who, c.transcript as any, c.english, (process.env.LEVEL === 'none' ? null : process.env.LEVEL ?? 'beginner') as any, c.learned);
    if (r.sendAsSaid) asSaid++; else lines.push(r.line ?? '');
  }
  console.log(`"${c.learned}": to the character as said ${asSaid}/${runs}${lines.length ? `; lines: ${[...new Set(lines)].join(' | ')}` : ''}`);
}
