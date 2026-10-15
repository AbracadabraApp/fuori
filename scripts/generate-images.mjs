/**
 * Phase 2: Generate images with resume capability
 *
 * Reads city content files and generates all images:
 * - Place images (pastel style)
 * - Character portraits (pen and ink style)
 *
 * Features:
 * - Fully resumable (tracks progress in manifest)
 * - Checks if images exist before generating
 * - Can run city-by-city or all at once
 * - --type place|portrait, --only id,id, --force (regenerate existing), --dry (print prompts)
 *   Mexico places, all 65 in their city's style: COUNTRY=es-mx npm run images -- --type place --force
 * - Handles interruption gracefully
 *
 * Cost: ~$16 for all ~540 images (xAI Grok)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import { buildPlacePrompt } from './lib/place-prompt.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Per-country settings (content/<country>/generation.json). Italy keeps its
// original folders and manifest; other countries get their own image folder
// and manifest, so their ids can't overwrite Italy's images.
const COUNTRY = process.env.COUNTRY || 'it';
const configPath = path.join(__dirname, '..', 'content', COUNTRY, 'generation.json');
const generation = fs.existsSync(configPath) ? JSON.parse(fs.readFileSync(configPath, 'utf8')) : {};
const imageConfig = generation.images ?? {};
// Per-city place styles (Mexico, 2026-10-14): place prompt = city style + scene + sign + rules
const placeStyles = generation.placeStyles ?? {};
const placeRules = generation.placeRules ?? '';
const IMAGE_DIR = path.join(__dirname, '..', 'public', imageConfig.dir ?? 'images');
const MANIFEST_PATH = path.join(__dirname, COUNTRY === 'it' ? 'image-generation-manifest.json' : `image-generation-manifest.${COUNTRY}.json`);

// Load or create manifest
function loadManifest() {
  if (fs.existsSync(MANIFEST_PATH)) {
    return JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'));
  }
  return {
    started: new Date().toISOString(),
    completed: {},
    failed: {},
    stats: { total: 0, completed: 0, failed: 0, skipped: 0 },
  };
}

function saveManifest(manifest) {
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
}

// Get all city content files
function getCityFiles() {
  const citiesDir = path.join(__dirname, '..', 'content', process.env.COUNTRY || 'it', 'cities');
  return fs.readdirSync(citiesDir)
    .filter(f => f.endsWith('.ts') && f !== 'index.ts')
    .map(f => ({
      id: f.replace('.ts', ''),
      path: path.join(citiesDir, f),
    }));
}

// Parse city content to extract image prompts
function parseCityContent(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');

  // This is a simple parser - in production you'd import the actual TypeScript
  // For now, we'll use regex to extract the relevant data

  const images = [];

  // Extract place images
  // Places: id, name (the sign) and imagePrompt (the scene); handles \' inside strings
  const str = `(?:'((?:[^'\\\\]|\\\\.)*)'|"((?:[^"\\\\]|\\\\.)*)")`; // single- or double-quoted
  const placeRegex = new RegExp(`{\\s*id:\\s*['"]([^'"]+)['"],\\s*name:\\s*${str}[^{}\\[]*?imagePrompt:\\s*${str}`, 'g');
  const unescape = (t) => t.replace(/\\(['"])/g, '$1');
  let match;
  while ((match = placeRegex.exec(content)) !== null) {
    images.push({
      type: 'place',
      id: match[1],
      name: unescape(match[2] ?? match[3]),
      prompt: unescape(match[4] ?? match[5]),
    });
  }

  // Extract character portraits
  const charRegex = /{\s*id:\s*['"]([^'"]+)['"],[^}]*portraitPrompt:\s*['"]([^'"]+)['"]/g;
  while ((match = charRegex.exec(content)) !== null) {
    images.push({
      type: 'portrait',
      id: match[1],
      prompt: match[2],
    });
  }

  return images;
}

// Calls xAI directly (no dev server needed). Shape and resolution come from
// the country's settings; without them the generator picks (Italy).
async function generateImage(prompt, type) {
  const size = imageConfig[type] ?? {};
  const response = await fetch('https://api.x.ai/v1/images/generations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.XAI_API_KEY}` },
    body: JSON.stringify({
      model: 'grok-imagine-image-2.0',
      prompt,
      n: 1,
      ...(size.aspect_ratio ? { aspect_ratio: size.aspect_ratio } : {}),
      ...(size.resolution ? { resolution: size.resolution } : {}),
    }),
  });

  if (!response.ok) {
    throw new Error(`xAI error ${response.status}: ${(await response.text()).slice(0, 200)}`);
  }

  const data = await response.json();
  const imageResponse = await fetch(data.data[0].url);
  return await imageResponse.arrayBuffer();
}

// Resize to the configured size and save as JPEG quality 82 (sharp; any OS).
// Without a configured size (Italy), re-encode at the original size.
async function fitToSize(filepath, type) {
  const size = imageConfig[type];
  const img = sharp(fs.readFileSync(filepath));
  const out = await (size?.width ? img.resize(size.width, size.height, { fit: 'cover' }) : img)
    .jpeg({ quality: 82, mozjpeg: true })
    .toBuffer();
  fs.writeFileSync(filepath, out);
}

async function processCity(cityId, cityFile, manifest, options = {}) {
  console.log(`\n=== Processing ${cityId} ===`);

  const images = parseCityContent(cityFile.path);
  console.log(`Found ${images.length} images to generate`);

  let generated = 0;
  let skipped = 0;
  let failed = 0;

  for (const image of images) {
    const imageKey = `${cityId}/${image.id}`;

    // --type place|portrait and --only id,id narrow the run
    if (options.type && image.type !== options.type) continue;
    if (options.only && !options.only.has(image.id)) continue;

    // A city with its own place style: style + scene + the name as the only sign + rules
    const prompt = image.type === 'place' && placeStyles[cityId]
      ? buildPlacePrompt({ style: placeStyles[cityId], scene: image.prompt, sign: image.name, rules: placeRules })
      : image.prompt;
    if (options.dry) {
      console.log(`\n[${imageKey}]\n${prompt}`);
      continue;
    }

    // Check manifest (--force regenerates anyway)
    if (manifest.completed[imageKey] && !options.force) {
      console.log(`⊘ ${imageKey} already generated`);
      skipped++;
      continue;
    }

    // Determine output path
    const dir = image.type === 'place' ? 'places' : 'portraits';
    const filename = `${image.id}.jpg`;
    const filepath = path.join(IMAGE_DIR, dir, filename);

    // Check if file exists (--force regenerates anyway)
    if (fs.existsSync(filepath) && !options.force) {
      console.log(`⊘ ${imageKey} file exists`);
      manifest.completed[imageKey] = {
        timestamp: new Date().toISOString(),
        path: filepath,
        skipped: true,
      };
      skipped++;
      saveManifest(manifest);
      continue;
    }

    // Ensure directory exists
    fs.mkdirSync(path.dirname(filepath), { recursive: true });

    // Generate image
    try {
      console.log(`Generating ${imageKey}...`);
      const buffer = await generateImage(prompt, image.type);
      fs.writeFileSync(filepath, Buffer.from(buffer));
      await fitToSize(filepath, image.type);

      manifest.completed[imageKey] = {
        timestamp: new Date().toISOString(),
        path: filepath,
        type: image.type,
      };
      generated++;

      console.log(`✓ ${imageKey} saved`);
      saveManifest(manifest);

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 3000));

    } catch (error) {
      console.error(`✗ ${imageKey} failed:`, error.message);
      manifest.failed[imageKey] = {
        timestamp: new Date().toISOString(),
        error: error.message,
      };
      failed++;
      saveManifest(manifest);
    }

    // Check if we should stop (for testing or cost control)
    if (options.maxImages && (generated + failed) >= options.maxImages) {
      console.log(`\nReached max images limit (${options.maxImages})`);
      break;
    }
  }

  return { generated, skipped, failed };
}

async function generateAllImages(options = {}) {
  console.log('=== Phase 2: Image Generation ===');
  console.log('Resumable image generation with progress tracking\n');

  const manifest = loadManifest();
  const cityFiles = getCityFiles();

  console.log(`Found ${cityFiles.length} city files`);
  console.log(`Manifest: ${Object.keys(manifest.completed).length} completed, ${Object.keys(manifest.failed).length} failed\n`);

  let totalStats = { generated: 0, skipped: 0, failed: 0 };

  for (const cityFile of cityFiles) {
    // Skip cities if specified
    if (options.city && cityFile.id !== options.city) {
      continue;
    }

    const stats = await processCity(cityFile.id, cityFile, manifest, options);
    totalStats.generated += stats.generated;
    totalStats.skipped += stats.skipped;
    totalStats.failed += stats.failed;

    // Stop if max images reached
    if (options.maxImages && (totalStats.generated + totalStats.failed) >= options.maxImages) {
      break;
    }
  }

  // Update manifest stats (a dry run changes nothing)
  if (options.dry) return;
  manifest.stats = {
    total: Object.keys(manifest.completed).length + Object.keys(manifest.failed).length,
    completed: Object.keys(manifest.completed).length,
    failed: Object.keys(manifest.failed).length,
    lastRun: new Date().toISOString(),
  };
  saveManifest(manifest);

  console.log('\n=== Image Generation Complete ===');
  console.log(`Generated: ${totalStats.generated}`);
  console.log(`Skipped: ${totalStats.skipped}`);
  console.log(`Failed: ${totalStats.failed}`);
  console.log(`\nManifest saved to: ${MANIFEST_PATH}`);

  if (totalStats.failed > 0) {
    console.log('\nTo retry failed images, run this script again.');
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const options = {};

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--city' && args[i + 1]) {
    options.city = args[i + 1];
    i++;
  } else if (args[i] === '--max' && args[i + 1]) {
    options.maxImages = parseInt(args[i + 1]);
    i++;
  } else if (args[i] === '--only' && args[i + 1]) {
    options.only = new Set(args[i + 1].split(','));
    i++;
  } else if (args[i] === '--type' && args[i + 1]) {
    options.type = args[i + 1];
    i++;
  } else if (args[i] === '--force') {
    options.force = true;
  } else if (args[i] === '--dry') {
    options.dry = true;
  } else if (args[i] === '--reset') {
    if (fs.existsSync(MANIFEST_PATH)) {
      fs.unlinkSync(MANIFEST_PATH);
      console.log('Manifest reset.');
    }
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateAllImages(options);
}
