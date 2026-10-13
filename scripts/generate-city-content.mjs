/**
 * Phase 1: Generate city content using Claude
 *
 * Creates complete city pantries with:
 * - Places (using city pantry formula)
 * - Characters for each place
 * - Image prompts for places and portraits
 *
 * Output: content/$COUNTRY/cities/{city}.ts files (COUNTRY defaults to it)
 * Settings per country: content/$COUNTRY/generation.json
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

// Everything country-specific lives in content/<country>/generation.json:
// country and language names, cities and neighbourhoods, what kinds of
// places to make, the image prompt templates, and (optionally) people who
// already exist and must be included.
const COUNTRY = process.env.COUNTRY || 'it';
const config = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'content', COUNTRY, 'generation.json'), 'utf8'));
const cities = config.cities;

async function generateCityPantry(city) {
  console.log(`\nGenerating content for ${city.name}...`);

  const people = city.people?.length
    ? `\nThese people already exist and must be included, each with their place (keep their id, name, gender, age and role, and copy their portraitPrompt exactly):\n${JSON.stringify(city.people, null, 2)}\n`
    : '';

  const prompt = `You are creating a city pantry for ${city.name}, ${config.country} for a ${config.language} language learning app. The learner has come to live here; the places are where their everyday life happens.

Places to include (${config.placesPerCity} places):
${config.placeKinds}

City: ${city.name}
Region: ${city.region}
Neighborhoods: ${city.neighbourhoods.join(', ')}
${people}
For each place:
1. Give it an authentic ${config.language} name (use real place names where appropriate)
2. Assign it to a neighborhood
3. Create one character who works or appears there (${config.language} name, gender, age, personality, role)
4. Write an image prompt for the place following this template: ${config.placePrompt}
5. Write a portrait prompt for the character following this template: ${config.portraitPrompt}

Make the places feel authentic to ${city.name} today. Include city-specific specialties.

Return only the data, in this exact TypeScript format:

export const ${toIdentifier(city.id)}: CityPantry = {
  id: '${city.id}',
  name: '${city.name}',
  region: '${city.region}',
  neighbourhoods: [${city.neighbourhoods.map(n => `'${n}'`).join(', ')}],
  places: [
    {
      id: 'place-id',
      name: 'Place Name',
      kind: 'bar', // or market, bakery, taquería, etc.
      neighbourhood: 'Neighborhood',
      real: true, // or false
      characterId: 'character-id',
      imagePrompt: '...',
    },
    // ... more places
  ],
  characters: [
    {
      id: 'character-id',
      name: 'Character Name',
      gender: 'f', // or 'm'
      age: 35,
      role: 'barista',
      placeId: 'place-id',
      personality: ['trait1', 'trait2', 'trait3'],
      portraitPrompt: '...',
    },
    // ... more characters
  ],
  food: ['item1', 'item2', ...],
  customs: ['custom1', 'custom2', ...],
  localTouches: ['expression1', 'expression2', ...],
};

Be creative but authentic.`;

  const message = await anthropic.messages.create({
    model: process.env.CLAUDE_MODEL || 'claude-sonnet-5-5',
    max_tokens: 16000,
    messages: [{
      role: 'user',
      content: prompt,
    }],
  });

  // Keep only the TypeScript, in case the reply wraps it in a code fence
  const text = message.content.filter(b => b.type === 'text').map(b => b.text).join('');
  return text.replace(/^[\s\S]*?```(?:typescript|ts)?\n/, '').replace(/\n```[\s\S]*$/, '').trim();
}

// 'san-miguel-de-allende' -> 'sanMiguelDeAllende'
function toIdentifier(id) {
  return id.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}

async function generateAllCities() {
  console.log('=== Phase 1: Content Generation ===');
  console.log(`Generating content for ${cities.length} cities using Claude...\n`);

  for (const city of cities) {
    const outputPath = path.join(__dirname, '..', 'content', COUNTRY, 'cities', `${city.id}.ts`);
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });

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
  console.log(`Review the generated files in content/${COUNTRY}/cities/`);
  console.log('Then run: node scripts/generate-images.mjs');
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateAllCities();
}
