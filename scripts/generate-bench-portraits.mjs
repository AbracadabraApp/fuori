#!/usr/bin/env node
/**
 * Generate bench character portraits for Mexican cities
 */

import fs from 'fs';
import path from 'path';

const XAI_API_KEY = process.env.XAI_API_KEY;

if (!XAI_API_KEY) {
  console.error('Error: XAI_API_KEY not found in environment');
  process.exit(1);
}

async function generatePortrait(characterId, prompt) {
  const outputPath = `public/images/es-mx/portraits/${characterId}.jpg`;

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
    id: 'carmen-jubilada',
    prompt: 'Gouache portrait of a woman of 77 with white hair in a neat bun, pearl earrings, a floral blouse and a cardigan, sitting on a park bench with a bag of birdseed in her lap and a gentle, knowing smile, who is a retired teacher who spends her afternoons at the Alameda Central, Centro Histórico, Ciudad de México. Include the park with ash trees and a bench. Bold, saturated colour: ash tree green, fountain blue and warm ochre. Flat, simple shapes, full of character. Tall portrait format, 1200 × 1800 pixels (2:3).',
  },
  {
    id: 'arturo-jubilado',
    prompt: 'Gouache portrait of a man of 73 with white hair, round wire glasses, a guayabera and a calm, thoughtful expression, holding a folded newspaper, who is a retired schoolteacher who spends his mornings at the Zócalo de Oaxaca, Centro, Oaxaca. Include the plaza with laurel trees and stone benches. Bold, saturated colour: laurel green, stone grey and marigold. Flat, simple shapes, full of character. Tall portrait format, 1200 × 1800 pixels (2:3).',
  },
  {
    id: 'beatriz-abuela',
    prompt: 'Gouache portrait of a woman of 79 with soft white curls, reading glasses on a chain, a lilac shawl over a flowered dress and knitting needles in her hands, with a warm, grandmotherly smile, who is a neighbourhood grandmother who sits at the Jardín del Carmen, Barrio de Analco, Puebla. Include the plaza with jacaranda trees and iron benches. Bold, saturated colour: jacaranda purple, fountain blue and warm terracotta. Flat, simple shapes, full of character. Tall portrait format, 1200 × 1800 pixels (2:3).',
  },
  {
    id: 'rosa-estudiante',
    prompt: 'Gouache portrait of a woman of 22 with long dark hair in a ponytail, a university hoodie, round earrings and a warm, friendly smile, sitting with textbooks and a laptop open beside her, who is a university student studying at the Jardín de San Francisco, Centro, Guadalajara. Include the plaza with trees and stone benches. Bold, saturated colour: ash tree green, stone pink and notebook blue. Flat, simple shapes, full of character. Tall portrait format, 1200 × 1800 pixels (2:3).',
  },
  {
    id: 'victor-jubilado',
    prompt: 'Gouache portrait of a man of 75 with a white moustache, a straw panama hat, a linen shirt and a serene, contemplative expression, holding a small bag of birdseed, who is a retired architect who spends his mornings at Parque Juárez, San Antonio, San Miguel de Allende. Include the park with tall trees and iron benches. Bold, saturated colour: eucalyptus green, stone grey and warm afternoon gold. Flat, simple shapes, full of character. Tall portrait format, 1200 × 1800 pixels (2:3).',
  },
];

for (const portrait of portraits) {
  try {
    await generatePortrait(portrait.id, portrait.prompt);
  } catch (error) {
    console.error(`Failed to generate ${portrait.id}:`, error.message);
  }
}

console.log('\nBench character portrait generation complete');
