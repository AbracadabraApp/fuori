/**
 * One piece of work per key at a time: a second call with the same key while
 * the first is running gets the first's promise instead of starting again.
 * Used by /v1/turn so a turn the app resends after a dropped connection isn't
 * answered and saved twice (whole-app scan, 2026-10-29). In memory: one
 * server process per country.
 */
export function sharedWhileRunning<T>(running: Map<string, Promise<T>>, key: string | null, start: () => Promise<T>): Promise<T> {
  if (!key) return start();
  const existing = running.get(key);
  if (existing) return existing;
  const p = start();
  running.set(key, p);
  const clear = () => {
    if (running.get(key) === p) running.delete(key);
  };
  p.then(clear, clear);
  return p;
}
