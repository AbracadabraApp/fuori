#!/bin/zsh
# A local server for simulator checks, ready when this returns (2026-11-05:
# hand-started servers cost minutes a check: cold starts, waits that missed).
# Starts `next dev` on port 3100 against the test database, waits until
# /v1/content answers (the first request warms the database pool), and
# restores next-env.d.ts, which next dev rewrites. One per folder: in a
# worktree, set PORT to something else.
#   npm run dev:sim -- it            (or es-mx)
#   npm run dev:sim -- it beginner   also moves the newest local learner past
#                                    onboarding at that level (scripts/sim-learner.mts)
# Then launch the app with -FuoriServer http://localhost:3100 (-FuoriMute YES
# skips the voice for screenshots; -FuoriOpen <city>/<place> opens a place).
country=${1:-it}; level=$2; port=${PORT:-3100}
log=${TMPDIR:-/tmp}/fuori-dev-$port.log
pkill -f "next dev -p $port" 2>/dev/null; sleep 1
DATABASE_URL=postgresql://localhost/fuori_test COUNTRY=$country nohup npx next dev -p $port > $log 2>&1 &
for i in $(seq 1 60); do
  sleep 2
  if [ "$(curl -s -o /dev/null -w '%{http_code}' --max-time 20 http://localhost:$port/v1/content)" = 200 ]; then
    git restore next-env.d.ts 2>/dev/null
    if [ -n "$level" ]; then DATABASE_URL=postgresql://localhost/fuori_test npx tsx scripts/sim-learner.mts $level; fi
    echo "Ready: http://localhost:$port ($country), log $log"; exit 0
  fi
done
echo "Not ready after 2 minutes; log $log:"; tail -20 $log; exit 1
