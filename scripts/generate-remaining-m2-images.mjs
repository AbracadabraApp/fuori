#!/usr/bin/env node
/**
 * Generate remaining M2 content images:
 * - 5 Mexico bench place images
 * - 2 Scuola place images (Italian + Mexican)
 * - 2 Magda portraits (Italian + Mexican)
 */

import fs from 'fs';
import path from 'path';

const XAI_API_KEY = process.env.XAI_API_KEY;

if (!XAI_API_KEY) {
  console.error('Error: XAI_API_KEY not found in environment');
  process.exit(1);
}

async function generateImage(outputPath, prompt, description) {
  console.log(`Generating ${description}...`);

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

  console.log(`✓ ${description} saved to ${outputPath}`);
}

const images = [
  // Mexico bench place images
  {
    path: 'public/images/es-mx/places/alameda-central.jpg',
    description: 'Alameda Central (CDMX)',
    prompt: 'Linocut print with bold carved black lines and wood-grain texture, in bright colour, of the Alameda Central, Centro Histórico, Ciudad de México, today. Wide tree-lined paths with iron benches, a fountain in the background, and an elderly woman feeding pigeons while office workers and students pass by. Bold colour: ash tree green, fountain blue, warm ochre. Square format, 1200 × 1200 pixels.',
  },
  {
    path: 'public/images/es-mx/places/zocalo-oaxaca.jpg',
    description: 'Zócalo de Oaxaca',
    prompt: 'Linocut print with bold carved black lines and wood-grain texture, in bright colour, of the Zócalo de Oaxaca, Centro, Oaxaca, today. A shady plaza with laurel trees, stone benches, a bandstand and the cathedral on one side. An elderly man sits on a bench reading a newspaper while children play and balloon sellers pass by. Bold colour: laurel green, stone grey, marigold. Square format, 1200 × 1200 pixels.',
  },
  {
    path: 'public/images/es-mx/places/jardin-del-carmen.jpg',
    description: 'Jardín del Carmen (Puebla)',
    prompt: 'Linocut print with bold carved black lines and wood-grain texture, in bright colour, of the Jardín del Carmen, Barrio de Analco, Puebla, today. A small neighbourhood plaza with jacaranda trees, iron benches and a fountain, the baroque church of El Carmen in the background. An elderly woman sits knitting on a bench while children play nearby. Bold colour: jacaranda purple, fountain blue, warm terracotta. Square format, 1200 × 1200 pixels.',
  },
  {
    path: 'public/images/es-mx/places/jardin-de-san-francisco.jpg',
    description: 'Jardín de San Francisco (Guadalajara)',
    prompt: 'Linocut print with bold carved black lines and wood-grain texture, in bright colour, of the Jardín de San Francisco, Centro, Guadalajara, today. A peaceful plaza with tall trees and stone benches beside the Templo Expiatorio, with a young woman sitting on a bench with textbooks and a laptop while pigeons wander and people pass through. Bold colour: ash tree green, stone pink, notebook blue. Square format, 1200 × 1200 pixels.',
  },
  {
    path: 'public/images/es-mx/places/parque-juarez.jpg',
    description: 'Parque Juárez (San Miguel)',
    prompt: 'Linocut print with bold carved black lines and wood-grain texture, in bright colour, of Parque Juárez, San Antonio, San Miguel de Allende, today. Curving paths under tall ash and eucalyptus trees, iron benches and a small fountain, with an elderly man sitting peacefully on a bench feeding pigeons while joggers and dog-walkers pass by. Bold colour: eucalyptus green, stone grey, warm afternoon gold. Square format, 1200 × 1200 pixels.',
  },

  // School buildings
  {
    path: 'public/images/places/scuola.jpg',
    description: 'Scuola (Italian school)',
    prompt: 'Watercolor and pen-and-ink illustration of a classic Italian school building (scuola) in a small city, with warm Mediterranean light and a few students with backpacks outside. The building has traditional Italian architecture with shuttered windows and warm ochre and terracotta walls. Soft, approachable style with gentle pastels and loose brushwork. Square format, 1200 × 1200 pixels.',
  },
  {
    path: 'public/images/es-mx/places/escuela.jpg',
    description: 'Escuela (Mexican school)',
    prompt: 'Linocut print with bold carved black lines and wood-grain texture, in bright colour, of a Mexican school building (escuela) with a bright courtyard and colorful walls. Students with backpacks gather outside near the entrance. The building has characteristic Mexican architecture with vibrant painted walls in bold colors. Bold, saturated colour: bright blue, warm yellow, terracotta red. Square format, 1200 × 1200 pixels.',
  },

  // Magda portraits
  {
    path: 'public/images/portraits/magda-italian.jpg',
    description: 'Magda (Italian teacher)',
    prompt: 'Watercolor and gouache portrait of a warm, professional woman in her 40s who is an Italian language teacher. She has a friendly, encouraging expression and is shown in a classroom setting with a chalkboard and books visible behind her. Soft watercolor style with gentle pastels and warm tones. The atmosphere is welcoming and educational. Tall portrait format, 1200 × 1800 pixels (2:3).',
  },
  {
    path: 'public/images/es-mx/portraits/magda-mexican.jpg',
    description: 'Magda (Mexican teacher)',
    prompt: 'Gouache portrait of a warm, professional woman in her 40s who is a Spanish language teacher. She has a friendly, encouraging expression and is shown in a classroom setting with a colorful, vibrant Mexican classroom visible behind her with bright walls and decorative elements. Bold, saturated gouache style with rich colors: terracotta, deep blue, warm yellow. The atmosphere is welcoming and educational. Tall portrait format, 1200 × 1800 pixels (2:3).',
  },
];

for (const image of images) {
  try {
    await generateImage(image.path, image.prompt, image.description);
  } catch (error) {
    console.error(`Failed to generate ${image.description}:`, error.message);
  }
}

console.log('\nM2 content image generation complete');
