// The reply table's ranks in the record (lib/conversation-record.ts, docs/beginner-2.md →
// Measuring): what she asked in, read from her parts; each reply ranked 1 to 3; the
// counts stored with the record.
import { readFileSync } from 'fs';
import { replyRank, askedInOf, countsOf, type LabelledLine } from '@/lib/conversation-record';

const problems: string[] = [];
const check = (ok: boolean, msg: string) => { if (!ok) problems.push(msg); };
const line = (x: Partial<LabelledLine>): LabelledLine => ({ said: 'Sì', lang: 'language', help: 'none', offered: [], askedIn: 'language', ...x });

check(askedInOf({ who: 'npc', text: '', parts: [{ kind: 'question', text: 'Vuole un caffè?' }] }) === 'language', 'a question part: asked in the language');
check(askedInOf({ who: 'npc', text: '', parts: [{ kind: 'word', text: 'Ciao!' }, { kind: 'english', text: 'What do you think of Siena?' }] }) === 'english', 'only an English question: asked in English');
check(askedInOf({ who: 'npc', text: '', parts: [{ kind: 'word', text: 'Ecco il caffè.' }] }) === null, 'no question: asked nothing');
check(askedInOf({ who: 'npc', text: 'Le piace Roma?' }) === 'language', 'a line without parts (Intermediate) with a question: the language');

check(replyRank(line({ said: 'Un caffè, per favore.', offered: ['Un caffè, per favore.'] })) === 1, 'an offered answer said back: 1');
check(replyRank(line({ said: 'I like it a lot', lang: 'english', askedIn: 'english' })) === 1, 'English to an English question: 1');
check(replyRank(line({ said: 'I like it a lot', lang: 'english', askedIn: 'language' })) === 2, 'English to her question in the language: 2');
check(replyRank(line({ said: 'How do you say spleen?', lang: 'english', help: 'word' })) === 2, 'asking for help: 2');
check(replyRank(line({ said: 'Mi piace molto il pecorino', offered: ['Sì, mi piace.'] })) === 3, 'own words in the language: 3');

const c = countsOf([line({ said: 'Un caffè.', offered: ['Un caffè.'] }), line({ said: 'Yes', lang: 'english' }), line({ said: 'Abito a Roma da un mese' })]);
check(c.ranks[1] === 1 && c.ranks[2] === 1 && c.ranks[3] === 1, `counts by rank (got ${JSON.stringify(c.ranks)})`);

const rec = readFileSync('lib/conversation-record.ts', 'utf8');
check(/ADD COLUMN IF NOT EXISTS reply_ranks jsonb/.test(rec) && /JSON\.stringify\(counts\.ranks\)\]/.test(rec) && /reply_ranks = EXCLUDED\.reply_ranks/.test(rec), 'the ranks are stored with the record, and rewritten with it');
check(/Replies by version/.test(rec), 'format=records shows the ranks by version');

if (problems.length) {
  console.error(`check-reply-ranks: ${problems.length} problem(s)\n- ${problems.join('\n- ')}`);
  process.exit(1);
}
console.log('check-reply-ranks: ok');
