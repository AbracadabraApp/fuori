// The per-conversation speaking record (05-designs.md → Shared pieces; 04 §3):
// counts only, no extra Claude call. In the app these come from Whisper's
// detected language (English share), the help taps (say it in English, Learn),
// recording length (silence), and comparing what was heard with the answers
// the character offered (own words vs saying back). The simulator reports
// language and help the way those signals would; the say-back comparison is
// done here, on the text, exactly as the app could.
import { RULES } from './ladder';

export interface LearnerTurn {
  /** What speech-to-text heard; empty when silent */
  said: string;
  /** Whisper's detected language, as the simulator reports it */
  lang: 'target' | 'english' | 'none';
  /** They asked for help (a help tap, or asking to repeat or for English) */
  help: boolean;
  /** What the help was for: one word (what's *panna*?, how do I say…) or the whole line (repeat, slower, didn't understand). In the app: a tap on a bubble vs "say it in English" */
  helpKind?: 'word' | 'whole';
  /** The answers to say back shown on this turn (from the character's last reply) */
  offered: string[];
}

export interface ConversationRecord {
  learnerTurns: number;
  ownWords: number;
  saidBack: number;
  english: number;
  /** English turns ÷ turns with speech */
  englishShare: number;
  helpAsks: number;
  /** Help asks about one word: normal learning, not struggle */
  wordHelps: number;
  /** Turns where they were lost: English instead of an answer, asking for the whole line again, or silence */
  lost: number;
  silent: number;
  /** Words spoken, any language (Josh, 2026-11-02: the main engagement signal) */
  words: number;
  /** Of those, in the language */
  wordsTarget: number;
  /** Of those, in their own words (not said back) */
  wordsOwn: number;
  /** Words per own-words turn */
  ownWordsLength: number;
  /** 3+ own-words turns: counts toward moving up */
  counted: boolean;
  /** Per turn, in order */
  kinds: ('own' | 'said back' | 'english' | 'help' | 'silent')[];
}

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '').replace(/[^\p{L}\p{N}\s…]/gu, ' ').replace(/\s+/g, ' ').trim();

/** Edit distance between two word lists */
function wordDistance(a: string[], b: string[]): number {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...new Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
}

/**
 * Did they say back one of the offered answers? Word overlap with what the app
 * itself showed, in any language: no phrase list. An answer with a blank (…)
 * matches on the words around the blank, whatever they filled in.
 */
export function isSaidBack(said: string, offered: string[]): boolean {
  const heard = norm(said).split(' ').filter(Boolean);
  if (!heard.length) return false;
  return offered.some((answer) => {
    const parts = norm(answer).split('…').map((p) => p.trim().split(' ').filter(Boolean));
    const fixed = parts.flat();
    if (!fixed.length) return false;
    if (parts.length > 1) {
      // A frame: its fixed words appear in order, and they added at most a few words of their own
      let at = 0;
      for (const w of fixed) {
        const i = heard.indexOf(w, at);
        if (i < 0) return false;
        at = i + 1;
      }
      return heard.length - fixed.length <= 4;
    }
    return wordDistance(heard, fixed) / Math.max(heard.length, fixed.length) <= 0.25;
  });
}

export function recordOf(turns: LearnerTurn[]): ConversationRecord {
  const kinds = turns.map((t): ConversationRecord['kinds'][number] => {
    if (t.lang === 'none' || !t.said.trim()) return 'silent';
    if (t.help) return 'help';
    if (t.lang === 'english') return 'english';
    return isSaidBack(t.said, t.offered) ? 'said back' : 'own';
  });
  const spoke = turns.filter((t) => t.lang !== 'none' && t.said.trim());
  const own = turns.filter((_, i) => kinds[i] === 'own');
  const ownWords = own.length;
  const count = (t: LearnerTurn) => t.said.split(/\s+/).filter(Boolean).length;
  const sum = (ts: LearnerTurn[]) => ts.reduce((n, t) => n + count(t), 0);
  // An old run's help turns have no kind: counted as whole-line asks
  const whole = turns.filter((t) => t.help && t.helpKind !== 'word').length;
  return {
    learnerTurns: turns.length,
    ownWords,
    saidBack: kinds.filter((k) => k === 'said back').length,
    english: spoke.filter((t) => t.lang === 'english').length,
    englishShare: spoke.length ? spoke.filter((t) => t.lang === 'english').length / spoke.length : 0,
    helpAsks: turns.filter((t) => t.help).length,
    wordHelps: turns.filter((t) => t.help && t.helpKind === 'word').length,
    lost: kinds.filter((k) => k === 'silent' || k === 'english').length + whole,
    words: sum(spoke),
    wordsTarget: sum(spoke.filter((t) => t.lang === 'target')),
    wordsOwn: sum(own),
    silent: kinds.filter((k) => k === 'silent').length,
    ownWordsLength: ownWords ? own.reduce((n, t) => n + t.said.split(/\s+/).filter(Boolean).length, 0) / ownWords : 0,
    counted: ownWords >= RULES.countedOwnWords,
    kinds,
  };
}

/**
 * Easy, hard or neither, by the counts alone (design A's whole signal), and
 * which signal decided it. Hard means lost (English instead of an answer, the
 * whole line again, silence); a help ask about one word is learning, not
 * struggle (cloud session's notes, 2026-11-02).
 */
export function feltLike(r: ConversationRecord): { felt: 'easy' | 'hard' | 'neither'; why: string } {
  const n = r.learnerTurns || 1;
  const lostShare = r.lost / n;
  const ownShare = r.ownWords / n;
  const h = RULES.hard;
  const lostWhy = `lost ${r.lost}/${n} (English ${r.english}, whole-line help ${r.helpAsks - r.wordHelps}, silent ${r.silent})`;
  if (lostShare >= h.minLostShare) return { felt: 'hard', why: lostWhy };
  const e = RULES.easy;
  const misses = [
    !r.counted && `own ${r.ownWords} < ${RULES.countedOwnWords} (not counted)`,
    r.lost > e.maxLost && lostWhy,
    r.wordHelps > e.maxWordHelps && `word help ${r.wordHelps} > ${e.maxWordHelps}`,
    ownShare < e.minOwnShare && `own ${r.ownWords}/${n} < ${Math.round(e.minOwnShare * 100)}%`,
  ].filter(Boolean);
  if (!misses.length) return { felt: 'easy', why: `own ${r.ownWords}/${n}, lost ${r.lost}, word help ${r.wordHelps}` };
  return { felt: 'neither', why: misses.join('; ') };
}
