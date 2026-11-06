// Waits until Railway has deployed a commit on both services (Fuori, Afuera):
// done when each service's newest successful deploy includes it (another
// session's later push carries it too). Prints where it is every 30 s and
// gives up after 15 minutes, so a wait never hangs silently (2026-11-05: two
// hand-written waits missed a finished deploy for 9 minutes).
//   npm run deploy:wait            the commit at HEAD
//   npm run deploy:wait -- <sha>
import { execFileSync } from 'node:child_process';

const commit = process.argv[2] ?? execFileSync('git', ['rev-parse', 'HEAD']).toString().trim();
const services = ['Fuori', 'Afuera'];
const includes = (deployed) => {
  try { execFileSync('git', ['merge-base', '--is-ancestor', commit, deployed], { stdio: 'ignore' }); return true; } catch { return false; }
};
const started = Date.now();
execFileSync('git', ['fetch', '-q']);
for (;;) {
  const state = services.map((service) => {
    const list = JSON.parse(execFileSync('railway', ['deployment', 'list', '--service', service, '--json']).toString());
    const newest = list[0];
    const ok = list.find((d) => d.status === 'SUCCESS');
    const hash = ok?.meta?.commitHash;
    if (hash && !includes(hash)) execFileSync('git', ['fetch', '-q']);
    return { service, done: !!hash && includes(hash), newest: `${newest?.status} ${newest?.meta?.commitHash?.slice(0, 7) ?? ''}`, failed: newest?.status === 'FAILED' || newest?.status === 'CRASHED' };
  });
  const mins = ((Date.now() - started) / 60000).toFixed(1);
  console.log(`${mins} min: ${state.map((s) => `${s.service} ${s.done ? 'live' : s.newest}`).join(', ')}`);
  if (state.every((s) => s.done)) { console.log(`Live on both: ${commit.slice(0, 7)}`); process.exit(0); }
  if (state.some((s) => s.failed && !s.done)) { console.error('A deploy failed: read railway logs --build'); process.exit(1); }
  if (Date.now() - started > 15 * 60000) { console.error('Gave up after 15 minutes'); process.exit(1); }
  await new Promise((r) => setTimeout(r, 30000));
}
