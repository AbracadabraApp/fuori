import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const prompt = 'Watercolor and ink sketch on white paper, travel sketchbook style. Loose transparent washes, fine ink lines, lots of blank white paper showing. Square composition. Rome, Italy. Sketch-like, artistic, not photorealistic.';

console.log('Generating Roma with no hints...');

const response = await fetch('http://localhost:3000/api/generate-image', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ prompt }),
});

const data = await response.json();
const imageUrl = data.data[0].url;

const imageResponse = await fetch(imageUrl);
const buffer = await imageResponse.arrayBuffer();

const filepath = path.join(__dirname, '..', 'public', 'images', 'cities', 'roma-no-hints.jpg');
fs.writeFileSync(filepath, Buffer.from(buffer));

console.log('✓ roma-no-hints.jpg saved');
console.log('  View at: http://localhost:3000/images/cities/roma-no-hints.jpg');
