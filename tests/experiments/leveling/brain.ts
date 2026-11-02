// Every model call the leveling prototype makes, in one place: live through
// lib/claude.ts (the app's client and model IDs), or, with --dry, a stub that
// returns canned replies of the same shape so the whole loop (prompts built,
// replies parsed, records, ladder moves, scoring, report) runs without a key.
// The stub's numbers mean nothing about Claude; they only exercise the code.
import { anthropic, CLAUDE_MODEL, TURN_MODEL, replyText } from '@/lib/claude';
import { language } from '@/content';
import { seeded } from './learners';

export type CallKind = 'character' | 'retry' | 'check' | 'learner' | 'speaking' | 'level' | 'quality';

export interface CallRequest {
  kind: CallKind;
  system?: string;
  messages: { role: 'user' | 'assistant'; content: string }[];
  schema: object;
  /** What the stub needs to answer like the real thing (never sent to Claude) */
  meta?: Record<string, unknown>;
}

export interface Meter {
  calls: number;
  ms: number;
  inTokens: number;
  outTokens: number;
}
export type Meters = Record<CallKind, Meter>;
export const emptyMeters = (): Meters =>
  Object.fromEntries((['character', 'retry', 'check', 'learner', 'speaking', 'level', 'quality'] as CallKind[]).map((k) => [k, { calls: 0, ms: 0, inTokens: 0, outTokens: 0 }])) as Meters;

export interface Brain {
  dry: boolean;
  call(req: CallRequest, meters: Meters): Promise<{ text: string; ms: number }>;
  models: Record<string, string>;
}

/** Design C's fast check can run on a smaller model: CHECK_MODEL=<id> (IDs stay out of the code; lib/claude.ts) */
const CHECK_MODEL = process.env.CHECK_MODEL || TURN_MODEL;

/** Per kind: model, token limit, and whether thinking is off (the character call's setting, lib/turn.ts) */
const SETTINGS: Record<CallKind, { model: string; max: number; thinkingOff: boolean; temperature?: number }> = {
  character: { model: TURN_MODEL, max: 1500, thinkingOff: true, temperature: 1 },
  retry: { model: TURN_MODEL, max: 1500, thinkingOff: true, temperature: 1 },
  check: { model: CHECK_MODEL, max: 400, thinkingOff: !process.env.CHECK_MODEL },
  learner: { model: TURN_MODEL, max: 600, thinkingOff: true, temperature: 1 },
  speaking: { model: CLAUDE_MODEL, max: 3000, thinkingOff: false },
  level: { model: CLAUDE_MODEL, max: 4000, thinkingOff: false }, // as lib/level.ts
  quality: { model: CLAUDE_MODEL, max: 4000, thinkingOff: false }, // as lib/quality.ts
};

const estimate = (s: string) => Math.ceil(s.length / 4);

function meter(meters: Meters, kind: CallKind, ms: number, inTokens: number, outTokens: number) {
  const m = meters[kind];
  m.calls++;
  m.ms += ms;
  m.inTokens += inTokens;
  m.outTokens += outTokens;
}

export const liveBrain: Brain = {
  dry: false,
  models: { character: TURN_MODEL, check: CHECK_MODEL, judges: CLAUDE_MODEL },
  async call(req, meters) {
    const s = SETTINGS[req.kind];
    for (let attempt = 0; ; attempt++) {
      const started = performance.now();
      try {
        const r = (await anthropic.messages.create({
          model: s.model,
          max_tokens: s.max,
          ...(s.temperature !== undefined ? { temperature: s.temperature } : {}),
          ...(s.thinkingOff ? { thinking: { type: 'between_tools' } } : {}),
          ...(req.system ? { system: req.system } : {}),
          messages: req.messages,
          output_config: { format: { type: 'json_schema', schema: req.schema } },
        } as Parameters<typeof anthropic.messages.create>[0])) as Awaited<ReturnType<typeof anthropic.messages.create>> & {
          stop_reason: string;
          usage: { input_tokens: number; output_tokens: number };
        };
        if (r.stop_reason === 'max_tokens') throw new Error(`${req.kind} call hit max_tokens`);
        const ms = performance.now() - started;
        meter(meters, req.kind, ms, r.usage.input_tokens, r.usage.output_tokens);
        return { text: replyText(r as Parameters<typeof replyText>[0]), ms };
      } catch (e) {
        const status = (e as { status?: number }).status ?? 0;
        if (attempt >= 3 || (status && status !== 429 && status < 500)) throw e;
        await new Promise((res) => setTimeout(res, 3000 * (attempt + 1)));
      }
    }
  },
};

// ---------- The stub (--dry) ----------

/** Pretend latencies, so the timing columns are exercised (labelled as stub in the report) */
const STUB_MS: Record<CallKind, number> = { character: 2100, retry: 2100, check: 600, learner: 900, speaking: 2500, level: 1500, quality: 4000 };

const words = (n: number, tag: string) => Array.from({ length: Math.max(1, n) }, (_, i) => `${tag}${i + 1}`).join(' ');

function stubReply(req: CallRequest): object {
  const m = req.meta ?? {};
  const rnd = seeded(req.kind, JSON.stringify(m), req.messages.length, req.messages[req.messages.length - 1]?.content.length ?? 0);
  const L = language.name.toLowerCase();
  const demand = Number(m.demand ?? 0);
  switch (req.kind) {
    case 'character':
    case 'retry': {
      // Lines get longer as the talk gets harder; a retry comes back shorter
      const n = Math.round((3 + demand * 12 + rnd() * 6) * (req.kind === 'retry' ? 0.5 : 1));
      if (m.path === 'character') return { line: `${words(n, L)}?`, en: words(n, 'en') };
      const t = Number(m.turn ?? 0);
      return {
        parts: [
          { kind: 'english', text: 'Welcome, take your time.', en: '', gloss: '' },
          { kind: 'word', text: words(Math.ceil(n / 2), `${L}-phrase${t}-`), en: 'a phrase', gloss: 'a phrase' },
          { kind: 'question', text: `${words(Math.floor(n / 2), `${L}-q${t}-`)}?`, en: 'a question?', gloss: 'a question?' },
          { kind: 'answer', text: `${L} answer ${t} one`, en: 'answer one', gloss: '' },
          { kind: 'answer', text: `${L} answer ${t} two …`, en: 'answer two …', gloss: '' },
        ],
      };
    }
    case 'learner': {
      const ability = Number(m.ability ?? 0);
      if (m.intent === 'english') return { said: 'Sorry, how do I say that?', lang: 'english', help: false, helpKind: 'none' };
      if (m.intent === 'help') return { said: `${L} please again slowly`, lang: 'target', help: true, helpKind: rnd() < 0.5 ? 'word' : 'whole' };
      // An honest learner who didn't follow asks for help instead
      if (demand - ability > 0.25 && rnd() < 0.5) return { said: `${L} sorry I don't follow`, lang: 'target', help: true, helpKind: 'whole' };
      return { said: words(2 + Math.round(ability * 8 + rnd() * 2), `${L}-own-`), lang: 'target', help: false, helpKind: 'none' };
    }
    case 'check': {
      const n = String(m.line ?? '').split(/\s+/).length;
      const limit = [0, 9, 13, 22][Number(m.listener ?? 1)];
      return { verdict: n > limit ? 'clear miss' : rnd() < 0.15 ? 'unsure' : 'fits', reason: 'stub' };
    }
    case 'speaking': {
      if (Number(m.ownWords ?? 0) < Number(m.minOwn ?? 3)) return { level: 'not enough to tell', reason: 'stub: too few own words' };
      const a = Number(m.ability ?? 0) + (rnd() - 0.5) * 0.25;
      return { level: a < 0.15 ? 'pre-A1' : a < 0.4 ? 'A1' : a < 0.8 ? 'A2' : 'B1', reason: 'stub' };
    }
    case 'level': {
      const ws = String(m.line ?? '').split(/\s+/).filter(Boolean);
      // Later words in a long line are more often harder
      return { words: ws.map((w, i) => ({ w, n: rnd() < 0.97 - i * 0.012 ? 1 : rnd() < 0.6 ? 2 : 3 })) };
    }
    case 'quality':
      return { alive: 4 + Math.round(rnd() * 3), note: 'stub' };
  }
}

export const dryBrain: Brain = {
  dry: true,
  models: { character: 'stub', check: 'stub', judges: 'stub' },
  async call(req, meters) {
    const text = JSON.stringify(stubReply(req));
    const ms = STUB_MS[req.kind];
    meter(meters, req.kind, ms, estimate((req.system ?? '') + req.messages.map((x) => x.content).join('\n')), estimate(text));
    return { text, ms };
  },
};
