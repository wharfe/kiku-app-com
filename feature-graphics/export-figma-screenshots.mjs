#!/usr/bin/env node

// Export all screenshot frames from the KIKU Figma file as PNG.
// Usage: node export-figma-screenshots.mjs
// Requires: FIGMA_PERSONAL_ACCESS_TOKEN in .env (same directory)

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load token from .env
const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const tokenMatch = envContent.match(/FIGMA_PERSONAL_ACCESS_TOKEN=(.+)/);
if (!tokenMatch) {
  console.error('FIGMA_PERSONAL_ACCESS_TOKEN not found in .env');
  process.exit(1);
}
const TOKEN = tokenMatch[1].trim();

const FILE_KEY = 'GTGi6sz0EQdAxlIE5eMSGp';
const OUTPUT_DIR = path.join(__dirname, 'screenshots');
const SCALE = 2; // 2x for high-res Play Store screenshots

async function fetchJSON(url) {
  const res = await fetch(url, {
    headers: { 'X-Figma-Token': TOKEN },
  });
  if (!res.ok) throw new Error(`Figma API ${res.status}: ${await res.text()}`);
  return res.json();
}

async function downloadImage(url, filepath) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed: ${res.status}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(filepath, buffer);
}

async function main() {
  // Get file structure
  console.log('Fetching Figma file structure...');
  const file = await fetchJSON(
    `https://api.figma.com/v1/files/${FILE_KEY}?depth=2`
  );

  // Collect all frame IDs grouped by page
  const frames = [];
  for (const page of file.document.children) {
    for (const node of page.children || []) {
      if (node.type === 'FRAME') {
        frames.push({
          id: node.id,
          name: node.name,
          page: page.name,
        });
      }
    }
  }

  console.log(`Found ${frames.length} frames across ${file.document.children.length} pages`);

  // Create output directories per page
  for (const page of file.document.children) {
    const pageDir = path.join(OUTPUT_DIR, sanitize(page.name));
    fs.mkdirSync(pageDir, { recursive: true });
  }

  // Request image URLs per page to avoid render timeout
  console.log('Requesting image URLs and downloading per page...');
  const pageNames = [...new Set(frames.map((f) => f.page))];

  for (const pageName of pageNames) {
    const pageFrames = frames.filter((f) => f.page === pageName);
    const ids = pageFrames.map((f) => f.id).join(',');

    console.log(`\n[${pageName}] (${pageFrames.length} frames)`);
    const images = await fetchJSON(
      `https://api.figma.com/v1/images/${FILE_KEY}?ids=${ids}&format=png&scale=${SCALE}`
    );

    if (images.err) {
      console.error(`  ERROR: ${images.err}`);
      continue;
    }

    for (const frame of pageFrames) {
      const url = images.images[frame.id];
      if (!url) {
        console.warn(`  SKIP: No image URL for "${frame.name}" (${frame.id})`);
        continue;
      }

      const pageDir = path.join(OUTPUT_DIR, sanitize(pageName));
      const filename = `${sanitize(frame.name)}.png`;
      const filepath = path.join(pageDir, filename);

      process.stdout.write(`  ${filename}...`);
      await downloadImage(url, filepath);
      console.log(' OK');
    }
  }

  console.log(`\nDone! ${frames.length} screenshots saved to ${OUTPUT_DIR}/`);
}

function sanitize(name) {
  return name.replace(/[\/\\?%*:|"<>]/g, '-').replace(/\s+/g, ' ').trim();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
