import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const prompts = {
  specific: 'Watercolor and ink sketch on white paper, travel sketchbook style. Loose transparent washes, fine ink lines, lots of blank white paper showing. Square composition. Iconic view of Rome: Colosseum, terracotta rooftops, cypress trees, warm golden light. Sketch-like, artistic, not photorealistic.',

  generic: 'Watercolor and ink sketch on white paper, travel sketchbook style. Loose transparent washes, fine ink lines, lots of blank white paper showing. Square composition. Rome, Italy cityscape. Sketch-like, artistic, not photorealistic.'
};

async function generateImage(prompt, filename) {
  console.log(`Generating ${filename}...`);

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

  const filepath = path.join(__dirname, '..', 'public', 'images', 'cities', filename);
  fs.writeFileSync(filepath, Buffer.from(buffer));

  console.log(`✓ ${filename} saved`);
  console.log(`  URL: ${imageUrl}\n`);
}

// Generate both versions
await generateImage(prompts.specific, 'roma-specific.jpg');
await new Promise(resolve => setTimeout(resolve, 2000));
await generateImage(prompts.generic, 'roma-generic.jpg');

console.log('\nComparison images generated!');
console.log('View them at:');
console.log('- http://localhost:3000/images/cities/roma-specific.jpg');
console.log('- http://localhost:3000/images/cities/roma-generic.jpg');
