import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const cities = [
  // Big cities
  { name: 'Roma', region: 'Lazio' },
  { name: 'Firenze', region: 'Toscana' },
  { name: 'Venezia', region: 'Veneto' },
  { name: 'Milano', region: 'Lombardia' },
  { name: 'Napoli', region: 'Campania' },
  { name: 'Bologna', region: 'Emilia-Romagna' },
  { name: 'Torino', region: 'Piemonte' },
  { name: 'Palermo', region: 'Sicilia' },
  { name: 'Genova', region: 'Liguria' },

  // Smaller cities and towns
  { name: 'Siena', region: 'Toscana' },
  { name: 'Lucca', region: 'Toscana' },
  { name: 'Verona', region: 'Veneto' },
  { name: 'Bergamo', region: 'Lombardia' },
  { name: 'Mantova', region: 'Lombardia' },
  { name: 'Matera', region: 'Basilicata' },
  { name: 'Lecce', region: 'Puglia' },
  { name: 'Orvieto', region: 'Umbria' },
  { name: 'Assisi', region: 'Umbria' },
  { name: 'Siracusa', region: 'Sicilia' },
  { name: 'Taormina', region: 'Sicilia' },
];

async function generateCity(city) {
  const filename = city.name.toLowerCase() + '.jpg';
  const filepath = path.join(__dirname, '..', 'public', 'images', 'cities', filename);

  // Skip if image already exists
  if (fs.existsSync(filepath)) {
    console.log(`⊘ ${city.name} already exists, skipping...`);
    return;
  }

  const prompt = `Watercolor and ink sketch on white paper, travel sketchbook style. Loose transparent washes, fine ink lines, lots of blank white paper showing. Square composition. ${city.name}, Italy. Sketch-like, artistic, not photorealistic.`;

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

  fs.writeFileSync(filepath, Buffer.from(buffer));
  console.log(`✓ ${city.name} saved (${city.region})`);

  // Wait between requests to avoid rate limits
  await new Promise(resolve => setTimeout(resolve, 3000));
}

console.log('Generating 20 city images...\n');

// Generate all cities
for (const city of cities) {
  await generateCity(city);
}

console.log('\n✓ All 20 city images generated!');
console.log('\nNext step: Update app/page.tsx with the full cities array.');
