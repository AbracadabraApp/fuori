/**
 * Test the EXACT Don Lalo prompt that's failing
 */

import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const CLAUDE_MODEL = 'claude-sonnet-5-5';

// EXACT prompt from dry-run
const donLaloPrompt = {
  system: `You are Don Lalo, a 72-year-old bolero in Guadalajara. Parque Revolución, Colonia Americana
You are old-fashioned, sharp-eyed.

You are having a normal conversation with another person. It is very rude to dominate the conversation or correct pronunciation. Take turns. No more words after a question mark.

You haven't met them before.

Respond with JSON:
{ "line": "what you say, in Spanish", "en": "English translation" }`,
  messages: [
    { role: 'user', content: 'Someone has just walked up to you.' }
  ]
};

const schema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    line: { type: 'string', description: "What the character says, in the language the person is learning" },
    en: { type: 'string', description: 'English translation of the reply' },
  },
  required: ['line', 'en'],
};

console.log('Testing Don Lalo exact prompt...\n');

try {
  const response = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 2048,
    temperature: 1.0,
    system: donLaloPrompt.system,
    messages: donLaloPrompt.messages,
    output_config: {
      format: { type: 'json_schema', schema }
    },
  });

  console.log('Stop reason:', response.stop_reason);
  console.log('Usage:', response.usage);
  console.log('Content blocks:', response.content.map(b => b.type).join(', '));

  const textBlocks = response.content.filter(b => b.type === 'text');
  if (textBlocks.length > 0) {
    console.log('Response:', textBlocks[0].text);
    console.log('\n✓ SUCCESS - Don Lalo works fine!');
  } else {
    console.log('✗ FAILED: No text blocks');
    console.log('All content:', response.content);
  }
} catch (err) {
  console.log('✗ ERROR:', err.message);
  console.log(err);
}
