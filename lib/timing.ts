/**
 * Where a request's time goes, step by step (the speed work in
 * docs/06-roadmap.md → 2). Each lap is the time since the previous one.
 * Sent back as a standard Server-Timing header, so a caller can tell server
 * time from network time, and logged as one line per request.
 */
export class Laps {
  private readonly start = performance.now();
  private last = this.start;
  readonly laps: Record<string, number> = {};
  /** Extra facts for the log line (tokens, bytes, model) */
  readonly facts: Record<string, string | number> = {};

  /** Ends the current step and names it */
  lap(name: string) {
    const now = performance.now();
    this.laps[name] = Math.round(now - this.last);
    this.last = now;
  }

  /** A time measured inside a step (such as Claude's first token), not a lap */
  mark(name: string, ms: number) {
    this.laps[name] = Math.round(ms);
  }

  total() {
    return Math.round(performance.now() - this.start);
  }

  /** Server-Timing: `auth;dur=12, claude;dur=3400, total;dur=3500` */
  header() {
    return [...Object.entries(this.laps), ['total', this.total()]].map(([k, v]) => `${k};dur=${v}`).join(', ');
  }

  /** One JSON log line: { event, id, ms: { …laps, total }, …facts } */
  log(event: string, id: string | null) {
    console.log(JSON.stringify({ level: 'info', event, id: id ?? undefined, ms: { ...this.laps, total: this.total() }, ...this.facts }));
  }
}
