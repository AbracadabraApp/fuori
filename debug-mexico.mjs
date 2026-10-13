/**
 * Debug why Mexico conversations hit infinite thinking
 */

import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const CLAUDE_MODEL = 'claude-sonnet-5-5';

// Simple test: minimal Italian character
const italianPrompt = {
  system: `You are Maria, a 30-year-old barista in Roma. Bar in Trastevere, Trastevere
You are warm, quick, friendly.

You are having a normal conversation with another person. It is very rude to dominate the conversation or correct pronunciation. Take turns. No more words after a question mark.

You haven't met them before.

Respond with JSON:
{ "line": "what you say, in Italian", "en": "English translation" }`,
  messages: [
    { role: 'user', content: 'Someone has just walked up to you.' }
  ]
};

// Simple test: minimal Mexican character
const mexicanPrompt = {
  system: `You are Lupe, a 30-year-old quesadillera in Ciudad de México. Quesadillas Doña Lupe, Coyoacán
You are warm, quick, friendly.

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
    line: { type: 'string', description: "What the character says" },
    en: { type: 'string', description: 'English translation' },
  },
  required: ['line', 'en'],
};

async function test(name, prompt, useSchema = true) {
  console.log(`\n=== Testing ${name} ${useSchema ? 'WITH' : 'WITHOUT'} schema ===`);

  const config = {
    model: CLAUDE_MODEL,
    max_tokens: 2048,
    temperature: 1.0,
    system: prompt.system,
    messages: prompt.messages,
  };

  if (useSchema) {
    config.output_config = {
      format: { type: 'json_schema', schema }
    };
  }

  try {
    const response = await anthropic.messages.create(config);

    console.log('Stop reason:', response.stop_reason);
    console.log('Usage:', response.usage);
    console.log('Content blocks:', response.content.map(b => b.type).join(', '));

    const textBlocks = response.content.filter(b => b.type === 'text');
    if (textBlocks.length > 0) {
      console.log('Response:', textBlocks[0].text.slice(0, 200));
      console.log('✓ SUCCESS');
    } else {
      console.log('✗ FAILED: No text blocks');
    }
  } catch (err) {
    console.log('✗ ERROR:', err.message);
  }
}

// Test all combinations
await test('Italian', italianPrompt, true);
await test('Mexican', mexicanPrompt, true);
await test('Mexican (no schema)', mexicanPrompt, false);

console.log('\n=== Testing with longer max_tokens ===');

async function testLong(name, prompt) {
  console.log(`\nTesting ${name} with 16K tokens...`);

  try {
    const response = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 16384,
      temperature: 1.0,
      system: prompt.system,
      messages: prompt.messages,
      output_config: {
        format: { type: 'json_schema', schema }
      },
    });

    console.log('Stop reason:', response.stop_reason);
    console.log('Usage:', response.usage);
    console.log('Thinking tokens:', response.usage.output_tokens);

    if (response.stop_reason === 'max_tokens') {
      console.log('✗ Hit max_tokens - infinite thinking!');
    } else {
      console.log('✓ Completed normally');
    }
  } catch (err) {
    console.log('✗ ERROR:', err.message);
  }
}

await testLong('Mexican', mexicanPrompt);
