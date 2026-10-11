#!/usr/bin/env node
/**
 * Generate specific character portraits
 */

import fs from 'fs';
import path from 'path';

const XAI_API_KEY = process.env.XAI_API_KEY;

if (!XAI_API_KEY) {
  console.error('Error: XAI_API_KEY not found in environment');
  process.exit(1);
}

async function generatePortrait(characterId, prompt) {
  const outputPath = `public/images/portraits/${characterId}.jpg`;

  console.log(`Generating portrait for ${characterId}...`);

  const response = await fetch('https://api.x.ai/v1/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${XAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'grok-imagine-image-2.0',
      prompt,
      n: 1,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`xAI API error (${response.status}): ${error}`);
  }

  const data = await response.json();
  const imageUrl = data.data[0].url;

  // Download image from URL
  const imgResponse = await fetch(imageUrl);
  if (!imgResponse.ok) {
    throw new Error(`Failed to download image: ${imgResponse.status}`);
  }

  const buffer = Buffer.from(await imgResponse.arrayBuffer());

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, buffer);

  console.log(`✓ ${characterId} portrait saved to ${outputPath}`);
}

const portraits = [
  {
    id: 'rita',
    prompt: 'Watercolour and ink sketch on white paper, travel-sketchbook style. Loose transparent washes, fine ink lines, lots of blank white paper. Square, head and shoulders, looking at the viewer. Italian woman in her late 50s, salt-and-pepper hair in a practical bob, warm brown eyes, laugh lines, simple gold necklace, comfortable clothes, hands mid-gesture. Soft natural light from apartment windows.',
  },
  {
    id: 'giulia',
    prompt: 'Watercolour and ink sketch on white paper, travel-sketchbook style. Loose transparent washes, fine ink lines, lots of blank white paper. Square, head and shoulders, looking at the viewer. Italian woman in her early 30s, dark curly hair tied up messily, small silver hoop earrings, black barista apron over a striped shirt, quick lively eyes, expressive hands. Behind the counter of a small Roman coffee bar, morning light.',
  },
];

for (const portrait of portraits) {
  try {
    await generatePortrait(portrait.id, portrait.prompt);
  } catch (error) {
    console.error(`Failed to generate ${portrait.id}:`, error.message);
  }
}

console.log('\nPortrait generation complete');
