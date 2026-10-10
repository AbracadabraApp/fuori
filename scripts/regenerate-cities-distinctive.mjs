import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const cities = [
  // Big cities with distinctive scenes
  {
    name: 'Roma',
    region: 'Lazio',
    prompt: 'Watercolor and ink sketch on white paper, travel sketchbook style. Loose transparent washes, fine ink lines, lots of blank white paper showing. Square composition. Outdoor café in Trastevere, Rome. People dining at small tables, waiter carrying espresso, cobblestone street, warm evening light, ivy-covered buildings. Sketch-like, artistic, not photorealistic.'
  },
  {
    name: 'Firenze',
    region: 'Toscana',
    prompt: 'Watercolor and ink sketch on white paper, travel sketchbook style. Loose transparent washes, fine ink lines, lots of blank white paper showing. Square composition. View from Ponte Vecchio, Florence. People walking across bridge, Arno river below, gelato vendor, tourists with cameras, golden Tuscan light. Sketch-like, artistic, not photorealistic.'
  },
  {
    name: 'Venezia',
    region: 'Veneto',
    prompt: 'Watercolor and ink sketch on white paper, travel sketchbook style. Loose transparent washes, fine ink lines, lots of blank white paper showing. Square composition. Small canal in Venice. Gondolier rowing tourists, laundry hanging between buildings, blue-green water reflections, narrow bridge, vibrant blues and ochres. Sketch-like, artistic, not photorealistic.'
  },
  {
    name: 'Milano',
    region: 'Lombardia',
    prompt: 'Watercolor and ink sketch on white paper, travel sketchbook style. Loose transparent washes, fine ink lines, lots of blank white paper showing. Square composition. Aperitivo hour in Navigli district, Milan. Young people at canal-side bar, bicycles parked, colorful Aperol spritzes on tables, modern energy, early evening. Sketch-like, artistic, not photorealistic.'
  },
  {
    name: 'Napoli',
    region: 'Campania',
    prompt: 'Watercolor and ink sketch on white paper, travel sketchbook style. Loose transparent washes, fine ink lines, lots of blank white paper showing. Square composition. Busy street in Spaccanapoli, Naples. Laundry hanging overhead, scooter parked outside pizzeria, locals gesturing in conversation, Vesuvius in distance, chaotic vibrant energy. Sketch-like, artistic, not photorealistic.'
  },
  {
    name: 'Bologna',
    region: 'Emilia-Romagna',
    prompt: 'Watercolor and ink sketch on white paper, travel sketchbook style. Loose transparent washes, fine ink lines, lots of blank white paper showing. Square composition. Under the porticos, Bologna. University students with books, bicycle leaning against column, street market vendors, red terracotta buildings, afternoon light through arches. Sketch-like, artistic, not photorealistic.'
  },
  {
    name: 'Torino',
    region: 'Piemonte',
    prompt: 'Watercolor and ink sketch on white paper, travel sketchbook style. Loose transparent washes, fine ink lines, lots of blank white paper showing. Square composition. Historic café in Turin. Elegant elderly couple at marble table, ornate Baroque interior visible through windows, waiter in vest, bicerin coffee, sophisticated atmosphere. Sketch-like, artistic, not photorealistic.'
  },
  {
    name: 'Palermo',
    region: 'Sicilia',
    prompt: 'Watercolor and ink sketch on white paper, travel sketchbook style. Loose transparent washes, fine ink lines, lots of blank white paper showing. Square composition. Ballaro street market, Palermo. Vendors selling produce and fish, colorful awnings, locals haggling, Arab-Norman architecture in background, bright Mediterranean light, lively chaos. Sketch-like, artistic, not photorealistic.'
  },
  {
    name: 'Genova',
    region: 'Liguria',
    prompt: 'Watercolor and ink sketch on white paper, travel sketchbook style. Loose transparent washes, fine ink lines, lots of blank white paper showing. Square composition. Harbor street in Genoa. Fishermen mending nets, seafood restaurant tables outside, old port buildings, laundry on balconies, gritty maritime character. Sketch-like, artistic, not photorealistic.'
  },

  // Smaller cities with distinctive character
  {
    name: 'Siena',
    region: 'Toscana',
    prompt: 'Watercolor and ink sketch on white paper, travel sketchbook style. Loose transparent washes, fine ink lines, lots of blank white paper showing. Square composition. Edge of Piazza del Campo, Siena. People sitting on sloped medieval square, gelato in hand, shell-shaped piazza, warm brick red tones, relaxed afternoon. Sketch-like, artistic, not photorealistic.'
  },
  {
    name: 'Lucca',
    region: 'Toscana',
    prompt: 'Watercolor and ink sketch on white paper, travel sketchbook style. Loose transparent washes, fine ink lines, lots of blank white paper showing. Square composition. Cyclists on city walls, Lucca. Families biking along tree-lined ramparts, view over terracotta roofs, children playing, peaceful atmosphere, green trees. Sketch-like, artistic, not photorealistic.'
  },
  {
    name: 'Verona',
    region: 'Veneto',
    prompt: 'Watercolor and ink sketch on white paper, travel sketchbook style. Loose transparent washes, fine ink lines, lots of blank white paper showing. Square composition. Piazza delle Erbe market, Verona. Market stalls with vegetables and flowers, locals shopping with bags, Renaissance buildings, fountain, lively morning bustle. Sketch-like, artistic, not photorealistic.'
  },
  {
    name: 'Bergamo',
    region: 'Lombardia',
    prompt: 'Watercolor and ink sketch on white paper, travel sketchbook style. Loose transparent washes, fine ink lines, lots of blank white paper showing. Square composition. Città Alta hilltop, Bergamo. Stone streets, elderly residents chatting on bench, view over lower town, medieval walls, quiet mountain air. Sketch-like, artistic, not photorealistic.'
  },
  {
    name: 'Mantova',
    region: 'Lombardia',
    prompt: 'Watercolor and ink sketch on white paper, travel sketchbook style. Loose transparent washes, fine ink lines, lots of blank white paper showing. Square composition. Lakeside café, Mantua. Quiet morning, person reading newspaper, swans on water, mist rising from lake, Renaissance palace in background, contemplative mood. Sketch-like, artistic, not photorealistic.'
  },
  {
    name: 'Matera',
    region: 'Basilicata',
    prompt: 'Watercolor and ink sketch on white paper, travel sketchbook style. Loose transparent washes, fine ink lines, lots of blank white paper showing. Square composition. Ancient Sassi cave dwellings, Matera. Stone steps with elderly woman carrying groceries, cave homes carved in ravine, dramatic shadows, honey-colored stone, timeless atmosphere. Sketch-like, artistic, not photorealistic.'
  },
  {
    name: 'Lecce',
    region: 'Puglia',
    prompt: 'Watercolor and ink sketch on white paper, travel sketchbook style. Loose transparent washes, fine ink lines, lots of blank white paper showing. Square composition. Baroque piazza, Lecce. Evening passeggiata, families strolling, children with gelato, ornate honey-stone church facade, warm southern light, leisurely southern Italian life. Sketch-like, artistic, not photorealistic.'
  },
  {
    name: 'Orvieto',
    region: 'Umbria',
    prompt: 'Watercolor and ink sketch on white paper, travel sketchbook style. Loose transparent washes, fine ink lines, lots of blank white paper showing. Square composition. Clifftop café terrace, Orvieto. Tourists at outdoor table admiring valley view, waiter serving wine, volcanic cliff edge, striped cathedral visible, dramatic hilltop setting. Sketch-like, artistic, not photorealistic.'
  },
  {
    name: 'Assisi',
    region: 'Umbria',
    prompt: 'Watercolor and ink sketch on white paper, travel sketchbook style. Loose transparent washes, fine ink lines, lots of blank white paper showing. Square composition. Pilgrims walking pink-stone streets, Assisi. Small group with walking sticks, Umbrian valley below, peaceful spiritual atmosphere, soft rose-colored buildings, quiet contemplation. Sketch-like, artistic, not photorealistic.'
  },
  {
    name: 'Siracusa',
    region: 'Sicilia',
    prompt: 'Watercolor and ink sketch on white paper, travel sketchbook style. Loose transparent washes, fine ink lines, lots of blank white paper showing. Square composition. Ortigia island market, Syracuse. Fish vendors displaying catch, locals selecting seafood, bright Sicilian colors, Greek ruins visible, Mediterranean coastal energy. Sketch-like, artistic, not photorealistic.'
  },
  {
    name: 'Taormina',
    region: 'Sicilia',
    prompt: 'Watercolor and ink sketch on white paper, travel sketchbook style. Loose transparent washes, fine ink lines, lots of blank white paper showing. Square composition. Teatro Greco terrace café, Taormina. Tourists at tables with Mount Etna view, dramatic coastal vista, ancient Greek theater columns, blue sea below, spectacular setting. Sketch-like, artistic, not photorealistic.'
  },
];

async function generateCity(city) {
  const filename = city.name.toLowerCase() + '.jpg';
  const filepath = path.join(__dirname, '..', 'public', 'images', 'cities', filename);

  // Backup existing file
  if (fs.existsSync(filepath)) {
    const backupPath = filepath.replace('.jpg', '-backup.jpg');
    fs.copyFileSync(filepath, backupPath);
    console.log(`  Backed up existing ${city.name}`);
  }

  console.log(`Generating ${city.name}...`);

  const response = await fetch('http://localhost:3000/api/generate-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: city.prompt }),
  });

  const data = await response.json();
  const imageUrl = data.data[0].url;

  // Download image
  const imageResponse = await fetch(imageUrl);
  const buffer = await imageResponse.arrayBuffer();

  fs.writeFileSync(filepath, Buffer.from(buffer));
  console.log(`✓ ${city.name} saved (${city.region})\n`);

  // Wait between requests
  await new Promise(resolve => setTimeout(resolve, 3000));
}

console.log('Regenerating 20 city images with distinctive scenes...\n');

// Generate all cities
for (const city of cities) {
  await generateCity(city);
}

console.log('\n✓ All 20 distinctive city images generated!');
console.log('\nBackups of original images saved as *-backup.jpg');
