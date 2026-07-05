import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';

async function processHero() {
  const imagesDir = path.join(process.cwd(), 'assets', 'images');
  const optimizedDir = path.join(imagesDir, 'optimized');
  
  await fs.mkdir(optimizedDir, { recursive: true });

  const heroPath = path.join(imagesDir, 'hero.png');

  console.log('Optimizing hero for desktop...');
  await sharp(heroPath)
    .resize({ width: 1920, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(path.join(optimizedDir, 'hero-desktop.webp'));

  console.log('Optimizing hero for mobile (<30KB)...');
  await sharp(heroPath)
    .resize({ width: 800, withoutEnlargement: true })
    .webp({ quality: 40, effort: 6 })
    .toFile(path.join(optimizedDir, 'hero-mobile.webp'));

  console.log('Hero images optimized successfully.');
}

processHero().catch(console.error);
