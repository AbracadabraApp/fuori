// Study export, version 1 (docs/study-export-demo.md): the Markdown file for
// Gemini Notebook. Checks the file built from a made-up conversation; the
// database query is used for real by the admin route.
import { language } from '@/content';
import { studyExportMarkdown } from '@/lib/study-export';

const problems: string[] = [];
const check = (ok: boolean, msg: string) => { if (!ok) problems.push(msg); };

const md = studyExportMarkdown({
  learnerId: 'test',
  from: new Date('2026-10-07T00:00Z'),
  to: new Date('2026-10-14T00:00Z'),
  level: 'A2',
  conversations: [
    {
      who: 'Franco', role: 'greengrocer', place: 'Mercato', neighbourhood: 'Trastevere', city: 'Roma',
      startedAt: new Date('2026-10-10T09:00Z'),
      turns: [
        { who: 'npc', text: 'LINE-ONE', en: 'EN-ONE', at: '' },
        { who: 'learner', text: 'LEARNER-LINE', at: '' },
      ],
    },
  ],
});

check(md.includes("The learner's lines are speech-to-text and may contain transcription errors; ignore spelling."), "the note for Gemini lacks Josh's speech-to-text line, word for word");
check(md.includes(language.name) && md.includes('A2'), 'the note does not name the language and level');
check(md.includes('Conversations: 1') && md.includes('Cities: Roma'), 'header lacks the number of conversations or the cities');
check(md.includes('## Franco, greengrocer') && md.includes('Mercato, Trastevere, Roma · 2026-10-10'), 'a conversation lacks who, where or when');
check(md.indexOf('LINE-ONE') < md.indexOf('EN-ONE') && md.indexOf('EN-ONE') < md.indexOf('LEARNER-LINE'), 'transcript lines or their English are missing or out of order');
check(!/undefined|null/.test(md), 'the file prints "undefined" or "null"');
check(!studyExportMarkdown({ learnerId: 't', from: new Date(), to: new Date(), conversations: [] }).includes('at about'), 'with no level, the note still says "at about"');

if (problems.length) {
  console.error(`FAILED:\n- ${problems.join('\n- ')}`);
  process.exit(1);
}
console.log('PASSED: the study export has the note, header, and each conversation with who, where, when and its transcript');
