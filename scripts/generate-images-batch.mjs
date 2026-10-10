/**
 * Phase 2: Generate images using xAI Batch API for 20-50% savings
 *
 * Reads city content files and generates all images using batch processing:
 * - Place images (pastel style)
 * - Character portraits (pen and ink style)
 *
 * Features:
 * - Uses xAI Batch API for 20-50% cost savings
 * - Fully resumable (tracks progress in manifest)
 * - Checks if images exist before generating
 * - Can run city-by-city or all at once
 * - Handles interruption gracefully
 *
 * Cost: ~$8-13 for all ~540 images (with Batch API discount)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const XAI_API_KEY = process.env.XAI_API_KEY;
const XAI_API_URL = 'https://api.x.ai/v1';

const MANIFEST_PATH = path.join(__dirname, 'image-generation-manifest.json');
const BATCH_STATE_PATH = path.join(__dirname, 'batch-state.json');

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

// Load or create batch state
function loadBatchState() {
  if (fs.existsSync(BATCH_STATE_PATH)) {
    return JSON.parse(fs.readFileSync(BATCH_STATE_PATH, 'utf-8'));
  }
  return { batchId: null, submitted: [] };
}

function saveBatchState(state) {
  fs.writeFileSync(BATCH_STATE_PATH, JSON.stringify(state, null, 2));
}

// Get all city content files
function getCityFiles() {
  const citiesDir = path.join(__dirname, '..', 'content', 'it', 'cities');
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
  const images = [];

  // Extract place images
  const placeRegex = /{\s*id:\s*['"]([^'"]+)['"],[^}]*imagePrompt:\s*['"]([^'"]+)['"]/g;
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

// Create a batch
async function createBatch() {
  const response = await fetch(`${XAI_API_URL}/batches`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${XAI_API_KEY}`,
    },
    body: JSON.stringify({
      description: 'Fuori image generation batch',
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to create batch: ${response.statusText}`);
  }

  const data = await response.json();
  return data.batch_id;
}

// Submit batch requests
async function submitBatchRequests(batchId, requests) {
  const response = await fetch(`${XAI_API_URL}/batches/${batchId}/requests`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${XAI_API_KEY}`,
    },
    body: JSON.stringify({ batch_requests: requests }),
  });

  if (!response.ok) {
    throw new Error(`Failed to submit batch requests: ${response.statusText}`);
  }

  return await response.json();
}

// Execute batch
async function executeBatch(batchId) {
  const response = await fetch(`${XAI_API_URL}/batches/${batchId}/execute`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${XAI_API_KEY}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to execute batch: ${response.statusText}`);
  }

  return await response.json();
}

// Check batch status
async function getBatchStatus(batchId) {
  const response = await fetch(`${XAI_API_URL}/batches/${batchId}`, {
    headers: {
      'Authorization': `Bearer ${XAI_API_KEY}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to get batch status: ${response.statusText}`);
  }

  return await response.json();
}

// Get batch results
async function getBatchResults(batchId, cursor = null) {
  let url = `${XAI_API_URL}/batches/${batchId}/results`;
  if (cursor) {
    url += `?cursor=${cursor}`;
  }

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${XAI_API_KEY}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to get batch results: ${response.statusText}`);
  }

  return await response.json();
}

async function generateAllImages(options = {}) {
  console.log('=== Phase 2: Batch Image Generation ===');
  console.log('Using xAI Batch API for 20-50% cost savings\n');

  const manifest = loadManifest();
  const batchState = loadBatchState();
  const cityFiles = getCityFiles();

  console.log(`Found ${cityFiles.length} city files`);
  console.log(`Manifest: ${Object.keys(manifest.completed).length} completed, ${Object.keys(manifest.failed).length} failed\n`);

  // Collect all images that need to be generated
  const pendingRequests = [];

  for (const cityFile of cityFiles) {
    if (options.city && cityFile.id !== options.city) {
      continue;
    }

    const images = parseCityContent(cityFile.path);

    for (const image of images) {
      const imageKey = `${cityFile.id}/${image.id}`;

      // Skip if already completed
      if (manifest.completed[imageKey]) {
        continue;
      }

      // Determine output path
      const dir = image.type === 'place' ? 'places' : 'portraits';
      const filename = `${image.id}.jpg`;
      const filepath = path.join(__dirname, '..', 'public', 'images', dir, filename);

      // Skip if file exists
      if (fs.existsSync(filepath)) {
        manifest.completed[imageKey] = {
          timestamp: new Date().toISOString(),
          path: filepath,
          skipped: true,
        };
        continue;
      }

      // Add to batch
      pendingRequests.push({
        batch_request_id: imageKey,
        batch_request: {
          image_generation: {
            prompt: image.prompt,
            model: 'grok-imagine-image-2.0',
          },
        },
        metadata: {
          cityId: cityFile.id,
          imageId: image.id,
          type: image.type,
          filepath: filepath,
        },
      });

      if (options.maxImages && pendingRequests.length >= options.maxImages) {
        break;
      }
    }

    if (options.maxImages && pendingRequests.length >= options.maxImages) {
      break;
    }
  }

  if (pendingRequests.length === 0) {
    console.log('No images to generate!');
    return;
  }

  console.log(`\n=== Preparing to generate ${pendingRequests.length} images ===\n`);

  // Create batch if needed
  if (!batchState.batchId) {
    console.log('Creating batch...');
    batchState.batchId = await createBatch();
    saveBatchState(batchState);
    console.log(`✓ Batch created: ${batchState.batchId}\n`);
  }

  // Submit requests
  console.log('Submitting batch requests...');
  await submitBatchRequests(batchState.batchId, pendingRequests);
  batchState.submitted = pendingRequests.map(r => r.batch_request_id);
  saveBatchState(batchState);
  console.log(`✓ ${pendingRequests.length} requests submitted\n`);

  // Execute batch
  console.log('Executing batch...');
  await executeBatch(batchState.batchId);
  console.log('✓ Batch execution started\n');

  // Poll for completion
  console.log('Waiting for batch to complete...');
  let status;
  do {
    await new Promise(resolve => setTimeout(resolve, 10000)); // Check every 10 seconds
    status = await getBatchStatus(batchState.batchId);
    console.log(`  Status: ${status.status}, Progress: ${status.completed || 0}/${status.total || pendingRequests.length}`);
  } while (status.status === 'processing' || status.status === 'pending');

  if (status.status !== 'completed') {
    console.error(`\n✗ Batch failed with status: ${status.status}`);
    return;
  }

  console.log('\n✓ Batch completed! Downloading results...\n');

  // Download results
  let cursor = null;
  let downloaded = 0;

  do {
    const results = await getBatchResults(batchState.batchId, cursor);

    for (const result of results.results) {
      const requestData = pendingRequests.find(r => r.batch_request_id === result.batch_request_id);
      if (!requestData) continue;

      const { filepath } = requestData.metadata;

      if (result.status === 'completed' && result.result?.image_response?.url) {
        try {
          // Download image
          const imageResponse = await fetch(result.result.image_response.url);
          const buffer = await imageResponse.arrayBuffer();

          // Ensure directory exists
          fs.mkdirSync(path.dirname(filepath), { recursive: true });

          // Save image
          fs.writeFileSync(filepath, Buffer.from(buffer));

          // Update manifest
          manifest.completed[result.batch_request_id] = {
            timestamp: new Date().toISOString(),
            path: filepath,
            type: requestData.metadata.type,
          };

          downloaded++;
          console.log(`✓ ${result.batch_request_id}`);
        } catch (error) {
          console.error(`✗ ${result.batch_request_id}: ${error.message}`);
          manifest.failed[result.batch_request_id] = {
            timestamp: new Date().toISOString(),
            error: error.message,
          };
        }
      } else {
        console.error(`✗ ${result.batch_request_id}: ${result.status}`);
        manifest.failed[result.batch_request_id] = {
          timestamp: new Date().toISOString(),
          error: result.error || 'Unknown error',
        };
      }

      saveManifest(manifest);
    }

    cursor = results.next_cursor;
  } while (cursor);

  // Update final stats
  manifest.stats = {
    total: Object.keys(manifest.completed).length + Object.keys(manifest.failed).length,
    completed: Object.keys(manifest.completed).length,
    failed: Object.keys(manifest.failed).length,
    lastRun: new Date().toISOString(),
  };
  saveManifest(manifest);

  // Clean up batch state
  fs.unlinkSync(BATCH_STATE_PATH);

  console.log('\n=== Batch Image Generation Complete ===');
  console.log(`Downloaded: ${downloaded}`);
  console.log(`Failed: ${Object.keys(manifest.failed).length}`);
  console.log(`\nManifest saved to: ${MANIFEST_PATH}`);
  console.log(`Estimated savings: 20-50% off standard pricing`);
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
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateAllImages(options);
}
