// Every Claude call logs what it used (2026-11-22, the cost question: only the character turn logged tokens,
// and caching was invisible). A call site without logUsage is a call whose cost nobody can see.
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { logUsage } from '@/lib/claude';

const problems: string[] = [];
const check = (ok: boolean, msg: string) => { if (!ok) problems.push(msg); };

// The line: tokens, cache tokens (0 when the API leaves them out), the call's name, the model
const lines: string[] = [];
const realLog = console.log;
console.log = (s: string) => { lines.push(s); };
logUsage('x-call', { model: 'm', stop_reason: 'end_turn', usage: { input_tokens: 7, output_tokens: 3, cache_read_input_tokens: 5, cache_creation_input_tokens: null } });
logUsage('y-call', { model: 'm', usage: { input_tokens: 1, output_tokens: 2 } });
console.log = realLog;
const [a, b] = lines.map((l) => JSON.parse(l));
check(a?.event === 'claude-usage' && a.call === 'x-call' && a.model === 'm', 'logUsage line: event, call or model wrong');
check(a?.inputTokens === 7 && a.outputTokens === 3 && a.cacheReadTokens === 5 && a.cacheWriteTokens === 0 && a.stop === 'end_turn', 'logUsage line: token fields wrong');
check(b?.cacheReadTokens === 0 && b.cacheWriteTokens === 0 && b.stop === null, 'logUsage line: a missing cache count should read 0 and a missing stop null');

// Every file that calls Claude logs each call
const walk = (d: string): string[] => readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(join(d, e.name)) : [join(d, e.name)]));
for (const dir of ['lib', 'app']) {
  for (const f of walk(dir)) {
    if (!/\.tsx?$/.test(f) || f === join('lib', 'claude.ts')) continue;
    const src = readFileSync(f, 'utf8');
    const calls = (src.match(/anthropic\.messages\.(create|stream)\(/g) ?? []).length;
    if (!calls) continue;
    const logged = (src.match(/\blogUsage\(/g) ?? []).length;
    check(logged >= calls, `${f}: ${calls} Claude calls, ${logged} logUsage calls`);
  }
}

if (problems.length) { console.error('FAIL:\n  ' + problems.join('\n  ')); process.exit(1); }
console.log('OK: every Claude call logs its tokens (claude-usage), with cache reads and writes');
