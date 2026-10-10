import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const prompt = 'Soft pastel sketch on white paper, travel journal style. Colored chalk pastels with visible texture, warm inviting colors, loose but defined strokes, natural sketchy quality. Square composition. Small Roman coffee bar interior in Trastevere. Counter with espresso machine, morning sunlight streaming through doorway, a few wooden stools, simple shelves with bottles, potted plants, cozy neighborhood café atmosphere. Warm earth tones, soft yellows and oranges from morning light, artistic and welcoming.';

console.log('Generating Giulia\'s bar with pastel style...\n');

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

// Save as pastel version
const filename = 'bar-trastevere-giulia-pastel.jpg';
const filepath = path.join(__dirname, '..', 'public', 'images', 'places', filename);

// Ensure directory exists
const placesDir = path.join(__dirname, '..', 'public', 'images', 'places');
if (!fs.existsSync(placesDir)) {
  fs.mkdirSync(placesDir, { recursive: true });
}

fs.writeFileSync(filepath, Buffer.from(buffer));
console.log(`✓ Pastel version saved`);
console.log(`  View at: http://localhost:3000/images/places/${filename}`);
