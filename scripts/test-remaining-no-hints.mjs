import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const cities = ['Firenze', 'Napoli', 'Bologna'];

async function generateCity(cityName) {
  const prompt = `Watercolor and ink sketch on white paper, travel sketchbook style. Loose transparent washes, fine ink lines, lots of blank white paper showing. Square composition. ${cityName}, Italy. Sketch-like, artistic, not photorealistic.`;

  console.log(`Generating ${cityName} with no hints...`);

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

  const filename = cityName.toLowerCase() + '-no-hints.jpg';
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

console.log('\nAll no-hints city images generated!');
