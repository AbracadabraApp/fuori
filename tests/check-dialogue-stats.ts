// The length numbers used to compare dialogue changes must count correctly,
// or before-and-after comparisons mislead. (2026-10-12)
import { wordCount, questionCount, turnStats, summarize, median, LONG_TURN_WORDS } from '@/lib/dialogue-stats';

const problems: string[] = [];
const eq = (label: string, got: unknown, want: unknown) => {
  if (JSON.stringify(got) !== JSON.stringify(want)) problems.push(`${label}: got ${JSON.stringify(got)}, want ${JSON.stringify(want)}`);
};

eq('words, Italian with apostrophes and punctuation', wordCount("Buongiorno! Un caffè? Dall'alto si vede l'Etna."), 7);
eq('words ignore lone punctuation', wordCount('Allora — perfetto … sì'), 3);
eq('words in empty text', wordCount('   '), 0);
eq('questions', questionCount('Caffè? O cappuccino?? Va bene.'), 2);
eq('median odd', median([5, 1, 3]), 3);
eq('median even', median([4, 1, 3, 2]), 2.5);

const salvatore = 'oggi ci vada, mi dia retta! ' + 'parola '.repeat(LONG_TURN_WORDS) + 'Lei è qui per quanti giorni? E da dove viene?';
const s = turnStats([salvatore, 'Prego!', 'Un caffè?']);
eq('opener words', s.openerWords, wordCount(salvatore));
eq('replies', s.replies, 3);
eq('long share', s.longShare, 0.33);
eq('multi-question share', s.multiQuestionShare, 0.33);
eq('max', s.wordsMax, wordCount(salvatore));

const sum = summarize([turnStats(['Ciao!', 'Sì']), turnStats([salvatore])]);
eq('summary replies pooled', sum.replies, 3);
eq('summary long share pooled', sum.longShare, 0.33);
eq('summary of nothing', summarize([]).replies, 0);

if (problems.length) {
  console.error(problems.join('\n'));
  process.exit(1);
}
console.log('OK: reply length and question counts are measured correctly');
