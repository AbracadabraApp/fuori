/**
 * Runs once when the server starts (Next.js instrumentation hook). Starts the
 * idle-conversation sweep (lib/conversation/sweep.ts), so conversations the
 * app never ended are still saved. Failures are logged, never thrown, so a
 * database hiccup can't take the server down.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs' || !process.env.DATABASE_URL) return;
  const { sweepIdleConversations } = await import('./lib/conversation/sweep');
  const run = () =>
    sweepIdleConversations().catch((err) =>
      console.error(JSON.stringify({ level: 'error', where: 'idle sweep', message: err instanceof Error ? err.message : String(err) }))
    );
  setTimeout(run, 60_000);
  setInterval(run, 5 * 60_000);
}
