// A dated snapshot of every saved conversation, with its score and each earlier
// score, written outside the repo (Josh, 2026-11-10: "we shouldn't delete";
// the database keeps everything, this is a second copy any session can read
// without production access). Real transcripts hold learners' own lines, so
// the file is private (mode 600) and never goes in git or a public bucket.
//
//   node scripts/archive-conversations.mjs            # all history, to ~/fuori-archive/conversations-<date>.json
//   node scripts/archive-conversations.mjs --since=2026-11-08
//
// Reads the admin route of each service (the key is read from Railway and
// never printed) in pages of 200, newest first, walking back with until=.
// Both services share one database, so a conversation is listed once. Run it from ~/fuori (the folder
// linked to Railway). The route's until= bound comes with the next release; until then a run gets the
// newest 200 only, and says so.
import { execFileSync } from 'child_process';
import { mkdirSync, writeFileSync, chmodSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

const since = process.argv.find((a) => a.startsWith('--since='))?.slice(8);
const services = [['Fuori', 'fuori-production']]; // one database: either service lists every conversation
const seen = new Map();
for (const [service, host] of services) {
  const vars = execFileSync('railway', ['variables', '--service', service, '--kv'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
  const key = vars.split('\n').find((l) => l.startsWith('ADMIN_KEY='))?.slice(10);
  if (!key) throw new Error(`no ADMIN_KEY for ${service}`);
  let until = '';
  for (;;) {
    const url = `https://${host}.up.railway.app/api/admin/conversations?limit=200${since ? `&since=${since}T00:00:00Z` : ''}${until ? `&until=${until}` : ''}`;
    const res = await fetch(url, { headers: { 'x-admin-key': key } });
    if (!res.ok) throw new Error(`${service}: ${res.status}`);
    const page = await res.json();
    for (const c of page) seen.set(c.id, c);
    if (page.length < 200) break;
    const oldest = page[page.length - 1].started_at;
    if (until === oldest) break; // no progress
    until = oldest;
  }
}
const rows = [...seen.values()].sort((a, b) => a.started_at.localeCompare(b.started_at));
const dir = join(homedir(), 'fuori-archive');
mkdirSync(dir, { recursive: true });
const file = join(dir, `conversations-${new Date().toISOString().slice(0, 10)}.json`);
writeFileSync(file, JSON.stringify(rows));
chmodSync(file, 0o600);
if (rows.length === 200 && !since) console.log('Exactly 200: the live route has no until= yet, so older conversations are not in this file. Run again after the release.');
console.log(`${rows.length} conversations, ${rows.filter((r) => r.quality).length} scored → ${file}`);
