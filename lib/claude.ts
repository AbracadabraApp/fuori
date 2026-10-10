import Anthropic from '@anthropic-ai/sdk';

/**
 * Single entry point for Claude calls (see CLAUDE.md).
 * Model IDs get retired; keep the ID here, overridable with CLAUDE_MODEL.
 */
export const CLAUDE_MODEL = process.env.CLAUDE_MODEL || 'claude-sonnet-5-5';

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});
