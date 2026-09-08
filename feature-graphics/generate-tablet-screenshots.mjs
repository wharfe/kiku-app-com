#!/usr/bin/env node

// Generate tablet screenshots (7-inch and 10-inch) from existing phone screenshots.
// Places each phone screenshot centered on a tablet-sized canvas,
// filling side margins with a matching amber gradient.
//
// Usage: node generate-tablet-screenshots.mjs
// Input:  feature-graphics/screenshots/<page>/*.png  (phone screenshots)
// Output: feature-graphics/tablet-screenshots/7-inch/<page>/*.png
//         feature-graphics/tablet-screenshots/10-inch/<page>/*.png

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const INPUT_DIR = path.join(__dirname, 'screenshots');
const OUTPUT_DIR = path.join(__dirname, 'tablet-screenshots');

// Tablet dimensions (portrait)
const TABLETS = [
  { name: '7-inch', prefix: '7in', width: 1200, height: 1920 },
  { name: '10-inch', prefix: '10in', width: 1600, height: 2560 },
];

// Map page folder names to language codes
function langFromPage(pageName) {
  const match = pageName.match(/- (ja|hi|id)$/);
  return match ? match[1] : 'en';
}

// Brand gradient colors for side fill (warm amber)
const GRADIENT_LEFT = { r: 232, g: 165, b: 60 };  // #E8A53C (mid amber)
const GRADIENT_RIGHT = { r: 210, g: 130, b: 20 };  // #D28214

/**
 * Create a vertical gradient SVG to use as background.
 * Uses a horizontal linear gradient matching the phone screenshot edges.
 */
function createGradientBackground(width, height) {
  // Radial-ish warm amber background matching the phone screenshot style
  return Buffer.from(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#FFB870"/>
          <stop offset="30%" stop-color="#E8820C"/>
          <stop offset="100%" stop-color="#C46A00"/>
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#bg)"/>
    </svg>
  `);
}

async function processScreenshot(inputPath, tablet, outputPath) {
  const metadata = await sharp(inputPath).metadata();
  const phoneWidth = metadata.width;
  const phoneHeight = metadata.height;

  // Scale phone screenshot to fit tablet height
  const scale = tablet.height / phoneHeight;
  const scaledWidth = Math.round(phoneWidth * scale);
  const scaledHeight = tablet.height;

  // Calculate horizontal centering offset
  const leftOffset = Math.round((tablet.width - scaledWidth) / 2);

  // Create gradient background
  const background = createGradientBackground(tablet.width, tablet.height);

  // Resize phone screenshot
  const resized = await sharp(inputPath)
    .resize(scaledWidth, scaledHeight, { fit: 'fill' })
    .toBuffer();

  // Composite: gradient background + centered phone screenshot
  await sharp(background)
    .resize(tablet.width, tablet.height)
    .composite([
      {
        input: resized,
        left: leftOffset,
        top: 0,
      },
    ])
    .png()
    .toFile(outputPath);
}

async function main() {
  // Discover all pages and screenshots
  const pages = fs.readdirSync(INPUT_DIR).filter((d) =>
    fs.statSync(path.join(INPUT_DIR, d)).isDirectory()
  );

  let totalCount = 0;

  for (const tablet of TABLETS) {
    console.log(`\n=== ${tablet.name} (${tablet.width}x${tablet.height}) ===`);

    for (const page of pages) {
      const pageInputDir = path.join(INPUT_DIR, page);
      const pageOutputDir = path.join(OUTPUT_DIR, tablet.name, page);
      fs.mkdirSync(pageOutputDir, { recursive: true });

      const files = fs.readdirSync(pageInputDir).filter((f) => f.endsWith('.png'));

      console.log(`\n[${page}] (${files.length} files)`);

      const lang = langFromPage(page);

      for (const file of files) {
        const inputPath = path.join(pageInputDir, file);
        const outputFile = `${tablet.prefix}_${lang}_${file}`;
        const outputPath = path.join(pageOutputDir, outputFile);

        process.stdout.write(`  ${outputFile}...`);
        await processScreenshot(inputPath, tablet, outputPath);
        console.log(' OK');
        totalCount++;
      }
    }
  }

  console.log(`\nDone! ${totalCount} tablet screenshots saved to ${OUTPUT_DIR}/`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
