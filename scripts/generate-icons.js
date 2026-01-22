/**
 * Icon Conversion Script
 *
 * This script converts existing JPEG icons to PNG format.
 * Run with: node scripts/generate-icons.js
 *
 * Requires: npm install sharp
 */

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sizes = [16, 32, 48, 128];
const assetsDir = path.join(__dirname, '../assets');

async function convertIcons() {
  for (const size of sizes) {
    const inputPath = path.join(assetsDir, `icon${size}.jpeg`);
    const outputPath = path.join(assetsDir, `icon${size}.png`);

    // Check if JPEG source exists
    if (!fs.existsSync(inputPath)) {
      console.warn(`Warning: ${inputPath} not found, skipping...`);
      continue;
    }

    await sharp(inputPath)
      .png()
      .toFile(outputPath);

    console.log(`Converted: icon${size}.jpeg -> icon${size}.png`);
  }

  console.log('Icon conversion complete!');
}

convertIcons().catch(console.error);
