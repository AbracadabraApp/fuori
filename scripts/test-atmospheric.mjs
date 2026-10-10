import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const cities = [
  {
    name: 'Firenze',
    hint: 'Warm terracotta light, Renaissance stone, Tuscan hills'
  },
  {
    name: 'Napoli',
    hint: 'Coastal brightness, dramatic bay, vibrant colors'
  },
  {
    name: 'Bologna',
    hint: 'Red porticos, medieval warmth, brick towers'
  },
];

async function generateCity(city) {
  const prompt = `Watercolor and ink sketch on white paper, travel sketchbook style. Loose transparent washes, fine ink lines, lots of blank white paper showing. Square composition. ${city.name}, Italy. ${city.hint}. Sketch-like, artistic, not photorealistic.`;

  console.log(`Generating ${city.name}...`);

  const response = await fetch('http://localhost:3000/api/generate-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });

  const data = await response.json();
  const imageUrl = data.data[0].url;

  // Download image
  const imageResponse = await fetch(imageUrl);
  const buffer = await imageResponse.arrayBuffer();

  const filename = city.name.toLowerCase() + '-atmospheric.jpg';
  const filepath = path.join(__dirname, '..', 'public', 'images', 'cities', filename);

  fs.writeFileSync(filepath, Buffer.from(buffer));
  console.log(`✓ ${filename} saved`);
  console.log(`  View at: http://localhost:3000/images/cities/${filename}\n`);

  // Wait between requests
  await new Promise(resolve => setTimeout(resolve, 2000));
}

// Generate all cities
for (const city of cities) {
  await generateCity(city);
}

console.log('\nAll atmospheric city images generated!');
console.log('Compare with originals:');
console.log('- Firenze: /images/cities/firenze.jpg vs firenze-atmospheric.jpg');
console.log('- Napoli: /images/cities/napoli.jpg vs napoli-atmospheric.jpg');
console.log('- Bologna: /images/cities/bologna.jpg vs bologna-atmospheric.jpg');
