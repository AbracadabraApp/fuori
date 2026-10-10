/**
 * Phase 1: Generate city content using Claude
 *
 * Creates complete city pantries with:
 * - Places (using city pantry formula)
 * - Characters for each place
 * - Image prompts for places and portraits
 *
 * Output: content/it/cities/{city}.ts files
 * Cost: ~$0.50 for all 20 cities (Claude Sonnet)
 */

import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// City definitions
const cities = [
  { id: 'firenze', name: 'Firenze', region: 'Toscana', neighborhoods: ['Oltrarno', 'San Lorenzo', 'Santa Croce', 'Santo Spirito'] },
  { id: 'venezia', name: 'Venezia', region: 'Veneto', neighborhoods: ['Cannaregio', 'Castello', 'Dorsoduro', 'San Marco'] },
  { id: 'milano', name: 'Milano', region: 'Lombardia', neighborhoods: ['Navigli', 'Brera', 'Porta Romana', 'Isola'] },
  // Add more cities as needed
];

const cityPantryFormula = `
City Pantry Formula (25-30 places):

Daily Routine (repeat across neighborhoods):
- 3 bars/cafés - morning coffee, daily touchpoint
- 2 bakeries - bread, pastries, morning routine

Food & Shopping (vocabulary contexts):
- 2-3 markets - produce, local food, vendors
- 2 restaurants - sit-down, regional dishes
- 1-2 specialty food - city-specific (e.g., pizzeria, osteria, trattoria)

Cultural/Landmark (2-4 places):
- 1 major landmark (iconic)
- 1-2 churches/cultural sites
- 1 park or public garden
- 1-2 piazzas (social gathering)

Social/Evening (1-2 each):
- Wine bars or aperitivo spots (enoteca, wine bar)
- Bookshop or cultural shop

Practical (1-2 total):
- Pharmacy, neighborhood shop
- Transportation hub if relevant

City Character (2-3 unique):
Reflect what makes this city special
`;

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
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 16000,
    messages: [{
      role: 'user',
      content: prompt,
    }],
  });

  return message.content[0].text;
}

async function generateAllCities() {
  console.log('=== Phase 1: Content Generation ===');
  console.log(`Generating content for ${cities.length} cities using Claude...\n`);

  for (const city of cities) {
    const outputPath = path.join(__dirname, '..', 'content', 'it', 'cities', `${city.id}.ts`);

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

  console.log('\n=== Content Generation Complete ===');
  console.log('Review the generated files in content/it/cities/');
  console.log('Then run: node scripts/generate-images.mjs');
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateAllCities();
}
