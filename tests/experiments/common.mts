// Shared by the experiment scripts in this folder (README.md): one Claude call
// with retries, reading the conversations out of a test report, and where
// outputs go (out/, gitignored: several quote Josh's real lines).
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { anthropic, CLAUDE_MODEL, replyText } from '@/lib/claude';

export const OUT = join(process.cwd(), 'tests', 'experiments', 'out');
mkdirSync(OUT, { recursive: true });

/** One Claude call; JSON when a schema is given. Retries rate limits and overloads. */
export async function ask(content: string, opts: { system?: string; max?: number; schema?: object; model?: string } = {}): Promise<string> {
  for (let attempt = 0; ; attempt++) {
    try {
      const r = await anthropic.messages.create({
        model: opts.model ?? CLAUDE_MODEL,
        max_tokens: opts.max ?? 4000,
        ...(opts.system ? { system: opts.system } : {}),
        messages: [{ role: 'user', content }],
        ...(opts.schema ? { output_config: { format: { type: 'json_schema', schema: opts.schema } } } : {}),
      } as Parameters<typeof anthropic.messages.create>[0]) as Awaited<ReturnType<typeof anthropic.messages.create>> & { stop_reason: string };
      if (r.stop_reason === 'max_tokens') throw new Error('hit max_tokens');
      return replyText(r as Parameters<typeof replyText>[0]).trim();
    } catch (e) {
      const status = (e as { status?: number }).status ?? 0;
      if (attempt >= 3 || (status && status !== 429 && status < 500)) throw e;
      await new Promise((r) => setTimeout(r, 3000 * (attempt + 1)));
    }
  }
}

export interface ReportConversation {
  name: string;
  role: string;
  turns: { who: 'npc' | 'learner'; text: string }[];
}

/** The conversations in a test:conversations, replay or script report (### heading, then a ``` block of "Name: line") */
export function reportConversations(md: string): ReportConversation[] {
  return md.split(/^### /m).slice(1).map((block) => {
    const head = block.split('\n')[0];
    const name = head.match(/^([^,(·\n]+?)\s*[,(·]/)?.[1]?.trim() ?? '';
    const role = head.match(/[(—,·]\s*([^),·]+)/)?.[1]?.trim() ?? '';
    const body = block.split('```')[1] ?? '';
    const turns = [...body.matchAll(/^([^:\n]{1,40}): (.+)$/gm)].map((m) => ({ who: (m[1].trim() === name ? 'npc' : 'learner') as 'npc' | 'learner', text: m[2] }));
    return { name, role, turns };
  }).filter((c) => c.name && c.turns.length);
}

/** "label=path" arguments */
export const labelled = (args: string[]) => args.map((a) => { const [label, path] = a.split('='); return { label, path }; });

/** Run jobs a few at a time */
export async function pool<T>(jobs: (() => Promise<T>)[], n = 6): Promise<T[]> {
  const out: T[] = new Array(jobs.length);
  let next = 0;
  await Promise.all(Array.from({ length: n }, async () => { for (let i = next++; i < jobs.length; i = next++) out[i] = await jobs[i](); }));
  return out;
}

export const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / Math.max(1, xs.length);
export const pct = (x: number) => `${Math.round(100 * x)}%`;
