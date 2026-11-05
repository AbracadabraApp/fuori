// A simulator learner past onboarding, so screens can be checked in the
// simulator without tapping through the welcome (Josh, 2026-11-04: "Go", after
// a Learn page change could only be checked as a mockup). Local database only.
//
// 1. Start a local server on the test database:
//      DATABASE_URL=postgresql://localhost/fuori_test npx next dev -p 3100
// 2. Launch the app once against it, so it signs in and its learner exists:
//      -FuoriServer http://localhost:3100
// 3. Move that learner (the newest in the database) past onboarding:
//      DATABASE_URL=postgresql://localhost/fuori_test npx tsx scripts/sim-learner.mts [beginner|intermediate|advanced]
// 4. Relaunch with -FuoriServer http://localhost:3100 (and -FuoriOpenLearn YES for Learn).
import { query } from '@/lib/db';
import { finishOnboarding } from '@/lib/onboarding';
import type { Level } from '@/lib/onboarding';

const url = process.env.DATABASE_URL ?? '';
if (!/^postgres(ql)?:\/\/(localhost|127\.0\.0\.1)[:/]/.test(url)) {
  console.error('Local databases only: set DATABASE_URL=postgresql://localhost/fuori_test');
  process.exit(1);
}

const level = (process.argv[2] ?? 'intermediate') as Level;
if (!['beginner', 'intermediate', 'advanced'].includes(level)) {
  console.error('Level: beginner, intermediate or advanced');
  process.exit(1);
}

const r = await query<{ id: string }>('SELECT id FROM learners ORDER BY created_at DESC LIMIT 1');
const id = r.rows[0]?.id;
if (!id) {
  console.error('No learner yet: launch the app once with -FuoriServer http://localhost:3100');
  process.exit(1);
}
await finishOnboarding(id, level, { welcomed: true });
console.log(`learner ${id}: welcomed, onboarded, ${level}`);
process.exit(0);
