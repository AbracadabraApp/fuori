/**
 * Dropped audio (docs/06-roadmap.md → prompt goals and scorecard): every line
 * /v1/speak is asked for gets one log line saying how it went, so dropped
 * voices can be counted from the live logs (`npm run voice:failures`). The
 * replay test is text only and can't see them. A dropped voice isn't silence
 * for the learner: the phone's own voice takes over, but it doesn't sound like
 * the character.
 */

export type VoiceOutcome = 'ok' | 'quota' | 'rate-limit' | 'busy' | 'unavailable' | 'no-audio' | 'not-configured';

export function logVoiceOutcome(outcome: VoiceOutcome, characterId: string, chars: number, ms: number, requestId?: string | null): void {
  console.log(JSON.stringify({ level: outcome === 'ok' ? 'info' : 'warn', event: 'voice', outcome, characterId, chars, ms, id: requestId ?? undefined }));
}

export interface VoiceSummary {
  lines: number;
  dropped: number;
  /** Dropped lines by why */
  reasons: Record<string, number>;
}

/** Adds up the voice lines in a log (one JSON object per line; anything else is skipped) */
export function summarizeVoiceLog(log: string): VoiceSummary {
  const summary: VoiceSummary = { lines: 0, dropped: 0, reasons: {} };
  for (const raw of log.split('\n')) {
    const start = raw.indexOf('{"');
    if (start < 0) continue;
    let entry: { event?: string; outcome?: string; message?: string };
    try {
      entry = JSON.parse(raw.slice(start));
    } catch {
      continue;
    }
    // railway logs --json wraps each line: the app's own JSON is in `message`
    if (entry.message && !entry.event) {
      try {
        entry = JSON.parse(entry.message);
      } catch {
        continue;
      }
    }
    if (entry.event !== 'voice' || !entry.outcome) continue;
    summary.lines++;
    if (entry.outcome !== 'ok') {
      summary.dropped++;
      summary.reasons[entry.outcome] = (summary.reasons[entry.outcome] ?? 0) + 1;
    }
  }
  return summary;
}
