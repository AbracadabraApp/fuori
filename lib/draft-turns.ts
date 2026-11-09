/**
 * Replies written during the learner's silence (docs/12-native-app.md item 5).
 *
 * After a short silence the app asks /v1/turn for the reply as a draft. If
 * they speak on, nobody ever asks for it and it must leave no trace: no turn
 * stored, no memory, no Learn page. If the silence holds, the app sends the
 * same turn as usual and gets the draft: this store hands it over, with the
 * first sentence it already sent (the voice for it is already being made).
 *
 * In memory, one server process per country (Railway), like lib/in-flight.ts.
 * A draft nobody claims within `ttlMs` is dropped and reported, so what
 * wasted drafts cost can be measured.
 */

export interface DraftEntry<R> {
  /** The reply as it settles; never rejects (errors are values) */
  done: Promise<R>;
  /** When it was asked for, and when it settled (undefined while it's still being written) */
  startedAt: number;
  settledAt?: number;
  /** What the first sentence event(s) were, in order, for a late reader */
  events: unknown[];
}

export class DraftStore<R> {
  private entries = new Map<string, { entry: DraftEntry<R>; timer: ReturnType<typeof setTimeout>; listeners: Set<(e: unknown) => void> }>();

  constructor(private ttlMs: number, private onWasted: (key: string, entry: DraftEntry<R>) => void) {}

  has(key: string): boolean {
    return this.entries.has(key);
  }

  /** Start a draft: `run` gets `emit` for the events (first sentence) it would send a client. A second draft of the same key is ignored. */
  start(key: string, run: (emit: (e: unknown) => void) => Promise<R>): boolean {
    if (this.entries.has(key)) return false;
    const listeners = new Set<(e: unknown) => void>();
    const events: unknown[] = [];
    const startedAt = Date.now();
    const entry: DraftEntry<R> = { done: undefined as unknown as Promise<R>, startedAt, events };
    entry.done = run((e) => {
      events.push(e);
      listeners.forEach((l) => l(e));
    }).finally(() => {
      entry.settledAt = Date.now();
    });
    entry.done.catch(() => {}); // callers read errors from `done`; an unclaimed one is reported by onWasted
    const timer = setTimeout(() => {
      this.entries.delete(key);
      this.onWasted(key, entry);
    }, this.ttlMs);
    timer.unref?.();
    this.entries.set(key, { entry, timer, listeners });
    return true;
  }

  /**
   * Claim a draft (once): events so far go to `onEvent` at once, later ones as
   * they come. Undefined when there is none (never asked, expired, or claimed).
   */
  claim(key: string, onEvent?: (e: unknown) => void): DraftEntry<R> | undefined {
    const held = this.entries.get(key);
    if (!held) return undefined;
    this.entries.delete(key);
    clearTimeout(held.timer);
    if (onEvent) {
      held.entry.events.forEach(onEvent);
      held.listeners.add(onEvent);
    }
    return held.entry;
  }

  /** Drop every draft (tests) */
  clear(): void {
    for (const { timer } of this.entries.values()) clearTimeout(timer);
    this.entries.clear();
  }
}
