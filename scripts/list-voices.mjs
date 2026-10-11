/**
 * List ElevenLabs voices on this account that can speak Italian, by gender.
 * Use it to choose voices for content/it/voices.ts.
 *
 *   npm run voices
 */
const key = process.env.ELEVENLABS_API_KEY;
if (!key) {
  console.error('ELEVENLABS_API_KEY is not set (put it in .env.local).');
  process.exit(1);
}

const res = await fetch('https://api.elevenlabs.io/v1/voices', { headers: { 'xi-api-key': key } });
if (!res.ok) {
  console.error(`ElevenLabs ${res.status}: ${await res.text()}`);
  process.exit(1);
}
const { voices = [] } = await res.json();

const rows = voices.map((v) => {
  const langs = (v.verified_languages ?? []).map((l) => l.language ?? l.locale ?? '').filter(Boolean);
  const italian = langs.some((l) => l.toLowerCase().startsWith('it')) || /ital/i.test(JSON.stringify(v.labels ?? {}));
  return {
    id: v.voice_id,
    name: v.name,
    gender: v.labels?.gender ?? '?',
    accent: v.labels?.accent ?? '',
    italian,
    preview: v.preview_url ?? '',
  };
});

for (const g of ['female', 'male', '?']) {
  const list = rows.filter((r) => r.gender === g || (g === '?' && !['female', 'male'].includes(r.gender)));
  if (!list.length) continue;
  console.log(`\n${g.toUpperCase()}`);
  list
    .sort((a, b) => Number(b.italian) - Number(a.italian))
    .forEach((r) => console.log(`  ${r.italian ? 'IT ' : '   '}${r.id}  ${r.name}${r.accent ? ` (${r.accent})` : ''}  ${r.preview}`));
}
console.log('\nIT = verified for Italian. Open a preview link to listen.');
