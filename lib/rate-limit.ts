/**
 * A fixed-window counter in memory, per key (an IP, a learner). Enough while
 * each service runs one Railway instance; moves to Postgres if that changes.
 * The per-learner daily budget (docs/12-native-app.md, N4) is separate.
 */

const windows = new Map<string, { start: number; count: number }>();

/** True when the call is allowed; false once `limit` calls were made in the current window. */
export function allow(key: string, limit: number, windowMs: number, now = Date.now()): boolean {
  const w = windows.get(key);
  if (!w || now - w.start >= windowMs) {
    windows.set(key, { start: now, count: 1 });
    if (windows.size > 10_000) {
      for (const [k, v] of windows) if (now - v.start >= windowMs) windows.delete(k);
    }
    return true;
  }
  w.count++;
  return w.count <= limit;
}

/** The caller's IP as Railway's proxy reports it. */
export function clientIp(request: Request): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0].trim() || request.headers.get('x-real-ip') || 'unknown';
}
