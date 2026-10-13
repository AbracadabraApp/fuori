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
 * - Handles interruption gracefully
 *
 * Cost: ~$16 for all ~540 images (xAI Grok)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execFileSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Per-country settings (content/<country>/generation.json). Italy keeps its
// original folders and manifest; other countries get their own image folder
// and manifest, so their ids can't overwrite Italy's images.
const COUNTRY = process.env.COUNTRY || 'it';
const configPath = path.join(__dirname, '..', 'content', COUNTRY, 'generation.json');
const imageConfig = fs.existsSync(configPath) ? JSON.parse(fs.readFileSync(configPath, 'utf8')).images ?? {} : {};
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
  const placeRegex = /{\s*id:\s*['"]([^'"]+)['"],[^{}\[]*imagePrompt:\s*['"]([^'"]+)['"]/g;
  let match;
  while ((match = placeRegex.exec(content)) !== null) {
    images.push({
      type: 'place',
      id: match[1],
      prompt: match[2],
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

// Resize to the configured size as JPEG (macOS sips). Elsewhere, keep the original.
function fitToSize(filepath, type) {
  const size = imageConfig[type];
  if (!size?.width) return;
  try {
    execFileSync('sips', ['-s', 'format', 'jpeg', '-s', 'formatOptions', '88', '-z', String(size.height), String(size.width), filepath, '--out', filepath], { stdio: 'ignore' });
  } catch {
    console.warn(`  (could not resize ${path.basename(filepath)}; kept the original size)`);
  }
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

    // Check manifest
    if (manifest.completed[imageKey]) {
      console.log(`⊘ ${imageKey} already generated`);
      skipped++;
      continue;
    }

    // Determine output path
    const dir = image.type === 'place' ? 'places' : 'portraits';
    const filename = `${image.id}.jpg`;
    const filepath = path.join(IMAGE_DIR, dir, filename);

    // Check if file exists
    if (fs.existsSync(filepath)) {
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
      const buffer = await generateImage(image.prompt, image.type);
      fs.writeFileSync(filepath, Buffer.from(buffer));
      fitToSize(filepath, image.type);

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

  // Update manifest stats
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
