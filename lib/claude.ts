import Anthropic from '@anthropic-ai/sdk';

/**
 * Single entry point for Claude calls (see CLAUDE.md).
 * Model IDs get retired; keep the ID here, overridable with CLAUDE_MODEL.
 */
export const CLAUDE_MODEL = process.env.CLAUDE_MODEL || 'claude-sonnet-5-5';

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * The text of a Claude reply. Replies can start with a non-text block
 * (such as thinking), so never assume content[0] is the text.
 */
export function replyText(response: {
  content: Array<{ type: string; text?: string }>;
  stop_reason?: string | null;
}): string {
  const text = response.content
    .filter((b) => b.type === 'text' && typeof b.text === 'string')
    .map((b) => b.text)
    .join('');
  if (!text) {
    const types = response.content.map((b) => b.type).join(', ') || 'none';
    throw new Error(`Claude returned no text (blocks: ${types}; stop: ${response.stop_reason ?? 'unknown'})`);
  }
  return text;
}
