// Releases main to the live game: Railway deploys the `live` branch, not
// `main` (Josh, 2026-11-06: yes to "a single release step"; in two days each
// service built 59 times, one build per push, each followed by a session
// waiting and running smoke:live, and a few builds were cut short by another
// session's push). Sessions push to main freely; this moves live to main,
// then, if anything Railway builds changed, waits for both services and runs
// the live test in both countries, once.
//   npm run release        from a folder linked to Railway (~/fuori)
// Run it when a piece of server work is finished and checked, or when Josh
// says "release"; never in the middle of a task.
import { execFileSync, spawn } from 'node:child_process';

const git = (...a) => execFileSync('git', a).toString().trim();
// Railway's watch patterns (Fuori and Afuera): everything except these
const skipped = [/^ios\//, /^docs\//, /^design\//, /^sketches\//, /^style-test\//, /^tests\//, /^\.github\//, /^[^/]+\.md$/];

git('fetch', '-q', 'origin');
const main = git('rev-parse', 'origin/main');
const live = git('rev-parse', 'origin/live');
if (main === live) { console.log(`Nothing to release: live is already ${main.slice(0, 7)}`); process.exit(0); }
try { execFileSync('git', ['merge-base', '--is-ancestor', live, main], { stdio: 'ignore' }); } catch {
  console.error('live has commits main lacks: merge them into main first'); process.exit(1);
}
const changed = git('diff', '--name-only', live, main).split('\n').filter(Boolean);
const built = changed.filter((f) => !skipped.some((r) => r.test(f)));
const commits = git('rev-list', '--count', `${live}..${main}`);

execFileSync('git', ['push', '-q', 'origin', `${main}:refs/heads/live`], { stdio: 'inherit' });
console.log(`live → ${main.slice(0, 7)} (${commits} commit(s), ${built.length} file(s) Railway builds)`);
if (!built.length) { console.log('Released: nothing Railway builds changed, so nothing deploys'); process.exit(0); }

const run = (cmd, args, env = {}) => new Promise((resolve) => {
  const p = spawn(cmd, args, { env: { ...process.env, ...env }, stdio: ['ignore', 'pipe', 'pipe'] });
  let out = '';
  p.stdout.on('data', (d) => { out += d; });
  p.stderr.on('data', (d) => { out += d; });
  p.on('close', (code) => resolve({ code, last: out.trim().split('\n').pop() ?? '' }));
});

const wait = await run('node', ['scripts/deploy-wait.mjs', main]);
if (wait.code) { console.error(`Deploy: ${wait.last}`); process.exit(1); }
const [it, mx] = await Promise.all([run('npm', ['run', '-s', 'smoke:live']), run('npm', ['run', '-s', 'smoke:live'], { COUNTRY: 'es-mx' })]);
const ok = !it.code && !mx.code;
console.log(`${ok ? 'Released' : 'Released, but the live test FAILED'}: ${main.slice(0, 7)} live on both; smoke Italy ${it.code ? `failed (${it.last})` : 'OK'}, Mexico ${mx.code ? `failed (${mx.last})` : 'OK'}`);
process.exit(ok ? 0 : 1);
