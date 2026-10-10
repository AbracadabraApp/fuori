import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const images = [
  {
    name: 'giulia-bar',
    filename: 'bar-trastevere-giulia.jpg',
    prompt: 'Pencil sketch on white paper, travel journal style. Detailed graphite lines with light shading, loose gestural marks, lots of white paper showing. Square composition. Small Roman coffee bar interior in Trastevere. Counter with espresso machine, morning light through doorway, a few stools, simple shelves with bottles, intimate neighborhood café atmosphere. Sketch-like, architectural but warm, not photorealistic.'
  },
  {
    name: 'giulia-portrait',
    filename: 'giulia.jpg',
    prompt: 'Pen and ink portrait on white paper, travel journal style. Fine black ink lines with minimal watercolor wash for warmth, detailed linework, expressive. Square composition, head and shoulders portrait. Italian woman in her early 30s, dark curly hair tied up messily, small silver hoop earrings, black barista apron over a striped shirt, quick lively eyes, warm smile, expressive face. Clean white background with subtle café elements. Portrait-like, personal, hand-drawn but refined.'
  }
];

async function generateImage(image) {
  console.log(`Generating ${image.name}...`);

  const response = await fetch('http://localhost:3000/api/generate-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: image.prompt }),
  });

  const data = await response.json();
  const imageUrl = data.data[0].url;

  // Download image
  const imageResponse = await fetch(imageUrl);
  const buffer = await imageResponse.arrayBuffer();

  // Save to appropriate directory
  let filepath;
  if (image.name.includes('bar')) {
    filepath = path.join(__dirname, '..', 'public', 'images', 'places', image.filename);
    // Ensure places directory exists
    const placesDir = path.join(__dirname, '..', 'public', 'images', 'places');
    if (!fs.existsSync(placesDir)) {
      fs.mkdirSync(placesDir, { recursive: true });
    }
  } else {
    filepath = path.join(__dirname, '..', 'public', 'images', 'portraits', image.filename);
    // Ensure portraits directory exists
    const portraitsDir = path.join(__dirname, '..', 'public', 'images', 'portraits');
    if (!fs.existsSync(portraitsDir)) {
      fs.mkdirSync(portraitsDir, { recursive: true });
    }
  }

  fs.writeFileSync(filepath, Buffer.from(buffer));
  console.log(`✓ ${image.name} saved`);
  console.log(`  View at: http://localhost:3000${filepath.replace(/.*public/, '')}\n`);

  // Wait between requests
  await new Promise(resolve => setTimeout(resolve, 3000));
}

console.log('Testing Giulia images with progressive art styles...\n');
console.log('Style progression:');
console.log('  Cities: Loose watercolor');
console.log('  Places: Pencil sketch');
console.log('  People: Pen and ink portrait\n');

// Generate both images
for (const image of images) {
  await generateImage(image);
}

console.log('✓ Both images generated!');
console.log('\nCompare the styles:');
console.log('  Bar (place): /images/places/bar-trastevere-giulia.jpg');
console.log('  Giulia (portrait): /images/portraits/giulia.jpg');
