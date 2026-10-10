// Replies can start with a non-text block. Assuming content[0] was text made
// half the conversations in the first test report fail ("Unexpected response type").
import { replyText } from '@/lib/claude';

const cases: Array<[string, () => boolean]> = [
  ['text first', () => replyText({ content: [{ type: 'text', text: '{"it":"Ciao"}' }] }) === '{"it":"Ciao"}'],
  ['thinking first', () => replyText({ content: [{ type: 'thinking' }, { type: 'text', text: 'Ciao' }] }) === 'Ciao'],
  ['no text throws with details', () => {
    try { replyText({ content: [{ type: 'thinking' }], stop_reason: 'max_tokens' }); return false; }
    catch (e) { return String(e).includes('thinking') && String(e).includes('max_tokens'); }
  }],
];

const failed = cases.filter(([, fn]) => !fn()).map(([name]) => name);
if (failed.length) { console.error('replyText failed: ' + failed.join(', ')); process.exit(1); }
console.log('OK: replyText handles non-text blocks');
