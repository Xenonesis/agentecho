/**
 * Icon + logo generator
 *
 * Renders assets/icon.svg to PNG at chrome extension sizes (16/32/48/128),
 * and assets/logo.svg to a wide banner PNG for the README.
 *
 *   node scripts/generate-icons.js
 *
 * Requires: sharp (devDependency).
 */

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const assetsDir = path.join(__dirname, '../assets');

const iconSvg = path.join(assetsDir, 'icon.svg');
const logoSvg = path.join(assetsDir, 'logo.svg');

async function generateIcons() {
  if (!fs.existsSync(iconSvg)) {
    console.error(`Missing ${iconSvg}`);
    process.exit(1);
  }

  // Chrome extension icons: 16, 32, 48, 128
  const sizes = [16, 32, 48, 128];
  for (const size of sizes) {
    const out = path.join(assetsDir, `icon${size}.png`);
    await sharp(iconSvg, { density: 384 }) // high density for crisp downscaling
      .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png({ compressionLevel: 9 })
      .toFile(out);
    console.log(`  ${path.relative(process.cwd(), out)}  (${size}\u00d7${size})`);
  }

  // README banner: 1280x400 for sharp retina on GitHub
  if (fs.existsSync(logoSvg)) {
    const out = path.join(assetsDir, 'logo.png');
    await sharp(logoSvg, { density: 192 })
      .resize(1280, 400, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png({ compressionLevel: 9 })
      .toFile(out);
    console.log(`  ${path.relative(process.cwd(), out)}  (1280\u00d7400 banner)`);
  }

  console.log('Done.');
}

generateIcons().catch(err => {
  console.error(err);
  process.exit(1);
});