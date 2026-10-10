import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const cities = [
  { name: 'Firenze', description: 'Duomo dome, Ponte Vecchio, Tuscan hills' },
  { name: 'Napoli', description: 'Mount Vesuvius, bay view, colorful buildings' },
  { name: 'Bologna', description: 'Two Towers, red rooftops, porticos' },
];

async function generateCity(city) {
  const prompt = `Watercolor and ink sketch on white paper, travel sketchbook style. Loose transparent washes, fine ink lines, lots of blank white paper showing. Square composition. Iconic view of ${city.name}, Italy: ${city.description}. Sketch-like, artistic, not photorealistic.`;

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

  const filename = city.name.toLowerCase() + '.jpg';
  const filepath = path.join(__dirname, '..', 'public', 'images', 'cities', filename);

  fs.writeFileSync(filepath, Buffer.from(buffer));
  console.log(`✓ ${city.name} downloaded`);

  // Wait a bit between requests
  await new Promise(resolve => setTimeout(resolve, 2000));
}

// Generate all cities
for (const city of cities) {
  await generateCity(city);
}

console.log('\nAll city images generated!');
