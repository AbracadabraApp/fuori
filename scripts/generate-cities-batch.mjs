/**
 * Generate specific cities passed as arguments
 * Usage: node scripts/generate-cities-batch.mjs napoli bologna torino
 */

import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// All city definitions
const allCities = {
  napoli: { id: 'napoli', name: 'Napoli', region: 'Campania', neighborhoods: ['Centro Storico', 'Vomero', 'Chiaia', 'Spaccanapoli'] },
  bologna: { id: 'bologna', name: 'Bologna', region: 'Emilia-Romagna', neighborhoods: ['Centro Storico', 'Quartiere Universitario', 'Santo Stefano', 'Saragozza'] },
  torino: { id: 'torino', name: 'Torino', region: 'Piemonte', neighborhoods: ['Centro', 'Quadrilatero Romano', 'San Salvario', 'Crocetta'] },
  palermo: { id: 'palermo', name: 'Palermo', region: 'Sicilia', neighborhoods: ['Kalsa', 'Vucciria', 'Ballarò', 'Politeama'] },
  genova: { id: 'genova', name: 'Genova', region: 'Liguria', neighborhoods: ['Centro Storico', 'Caruggi', 'Boccadasse', 'Castelletto'] },
  siena: { id: 'siena', name: 'Siena', region: 'Toscana', neighborhoods: ['Piazza del Campo', 'Terzo di Città', 'Terzo di San Martino', 'Terzo di Camollia'] },
  lucca: { id: 'lucca', name: 'Lucca', region: 'Toscana', neighborhoods: ['Centro Storico', 'San Michele', 'San Martino', 'San Frediano'] },
  verona: { id: 'verona', name: 'Verona', region: 'Veneto', neighborhoods: ['Centro Storico', 'Veronetta', 'Borgo Trento', 'San Zeno'] },
  bergamo: { id: 'bergamo', name: 'Bergamo', region: 'Lombardia', neighborhoods: ['Città Alta', 'Città Bassa', 'Borgo Palazzo', 'Longuelo'] },
  mantova: { id: 'mantova', name: 'Mantova', region: 'Lombardia', neighborhoods: ['Centro Storico', 'Te', 'Cittadella', 'Lunetta'] },
  matera: { id: 'matera', name: 'Matera', region: 'Basilicata', neighborhoods: ['Sassi Barisano', 'Sassi Caveoso', 'Civita', 'Piano'] },
  lecce: { id: 'lecce', name: 'Lecce', region: 'Puglia', neighborhoods: ['Centro Storico', 'Piazza Sant\'Oronzo', 'Porta Napoli', 'Santa Croce'] },
  orvieto: { id: 'orvieto', name: 'Orvieto', region: 'Umbria', neighborhoods: ['Centro Storico', 'Duomo', 'Quartiere Medievale', 'Porta Maggiore'] },
  assisi: { id: 'assisi', name: 'Assisi', region: 'Umbria', neighborhoods: ['Centro Storico', 'San Francesco', 'Santa Chiara', 'Rocca Maggiore'] },
  siracusa: { id: 'siracusa', name: 'Siracusa', region: 'Sicilia', neighborhoods: ['Ortigia', 'Neapolis', 'Acradina', 'Tyche'] },
  taormina: { id: 'taormina', name: 'Taormina', region: 'Sicilia', neighborhoods: ['Centro Storico', 'Corso Umberto', 'Teatro Greco', 'Castelmola'] },
};

// The formula lives in content/it/generation.json (placeKinds), the one copy
// both generators read (Josh, 2026-10-27: fix the source of the repetition)
const cityPantryFormula = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'content', 'it', 'generation.json'), 'utf8')).placeKinds;

const artStyleGuidelines = `
Art Styles:
- Cities: "Loose watercolor with ink lines, atmospheric, flowing"
- Places: "Soft pastel sketch, warm colors, textured, inviting"
- People: "Pen and ink portrait with minimal watercolor wash, detailed, personal"
`;

async function generateCityPantry(city) {
  console.log(`\nGenerating content for ${city.name}...`);

  const prompt = `You are creating a city pantry for ${city.name}, Italy for an Italian language learning app.

${cityPantryFormula}

${artStyleGuidelines}

City: ${city.name}
Region: ${city.region}
Neighborhoods: ${city.neighborhoods.join(', ')}

Create a complete city pantry following the formula above. For each place:
1. Generate an appropriate Italian name (use real place names where appropriate)
2. Assign it to a neighborhood
3. Create a character who works/appears there (Italian name, age, personality, role)
4. Write an image prompt for the place (pastel style)
5. Write an image prompt for the character portrait (pen and ink style)

Make the places feel authentic to ${city.name}. Include city-specific specialties.
Use the regional character and dialect touches appropriate to ${city.region}.

Return the data in this exact TypeScript format:

export const ${city.id}: CityPantry = {
  id: '${city.id}',
  name: '${city.name}',
  neighbourhoods: [${city.neighborhoods.map(n => `'${n}'`).join(', ')}],
  places: [
    {
      id: 'place-id',
      name: 'Place Name',
      kind: 'bar', // or market, bakery, trattoria, etc.
      neighbourhood: 'Neighborhood',
      real: true, // or false
      characterId: 'character-id',
      imagePrompt: 'Soft pastel sketch on white paper...',
    },
    // ... more places
  ],
  characters: [
    {
      id: 'character-id',
      name: 'Character Name',
      age: 35,
      role: 'barista',
      placeId: 'place-id',
      personality: ['trait1', 'trait2', 'trait3'],
      portraitPrompt: 'Pen and ink portrait on white paper...',
    },
    // ... more characters
  ],
  food: ['item1', 'item2', ...],
  customs: ['custom1', 'custom2', ...],
  localTouches: ['expression1', 'expression2', ...],
};

Generate 25-30 places following the formula. Be creative but authentic.`;

  const message = await anthropic.messages.create({
    model: process.env.CLAUDE_MODEL || 'claude-sonnet-5-5',
    max_tokens: 16000,
    messages: [{
      role: 'user',
      content: prompt,
    }],
  });

  return message.content[0].text;
}

async function generateCities() {
  const cityNames = process.argv.slice(2);

  if (cityNames.length === 0) {
    console.error('Usage: node generate-cities-batch.mjs <city1> <city2> ...');
    process.exit(1);
  }

  console.log(`=== Generating ${cityNames.length} cities ===\n`);

  for (const cityName of cityNames) {
    const city = allCities[cityName.toLowerCase()];

    if (!city) {
      console.error(`✗ Unknown city: ${cityName}`);
      continue;
    }

    const outputPath = path.join(__dirname, '..', 'content', process.env.COUNTRY || 'it', 'cities', `${city.id}.ts`);

    // Check if already exists
    if (fs.existsSync(outputPath)) {
      console.log(`⊘ ${city.name} already exists, skipping...`);
      continue;
    }

    try {
      const content = await generateCityPantry(city);

      // Add imports at the top
      const fullContent = `import { CityPantry } from '@/lib/types';\n\n${content}\n`;

      fs.writeFileSync(outputPath, fullContent);
      console.log(`✓ ${city.name} generated → ${outputPath}`);

      // Wait between requests to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error(`✗ Error generating ${city.name}:`, error.message);
    }
  }

  console.log('\n=== Batch Complete ===');
}

generateCities();
