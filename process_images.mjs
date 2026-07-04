import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

async function optimizeImages() {
  const imagesDir = path.join(process.cwd(), 'assets', 'images');
  const projectsDir = path.join(imagesDir, 'projects-pics');
  const optimizedDir = path.join(imagesDir, 'optimized');

  await fs.mkdir(optimizedDir, { recursive: true });

  console.log('Optimizing logo...');
  // Logo: png < 20KB. Resize width to max 300px.
  await sharp(path.join(imagesDir, 'ag_logo2.png'))
    .resize({ width: 300, withoutEnlargement: true })
    .png({ quality: 60, compressionLevel: 9 })
    .toFile(path.join(optimizedDir, 'ag_logo2.png'));

  console.log('Optimizing owner picture...');
  // Owner: webp < 50KB. Resize width to max 600px.
  await sharp(path.join(imagesDir, 'andre.jpeg'))
    .resize({ width: 600, withoutEnlargement: true })
    .webp({ quality: 60 })
    .toFile(path.join(optimizedDir, 'andre.webp'));

  console.log('Optimizing project pictures...');
  const files = await fs.readdir(projectsDir);
  const webpFiles = files.filter(f => f.toLowerCase().endsWith('.webp'));
  
  const projectsData = [];

  for (const file of webpFiles) {
    const filePath = path.join(projectsDir, file);
    const optPath = path.join(optimizedDir, file);
    
    // Read metadata
    const metadata = await sharp(filePath).metadata();
    
    // Determine orientation class
    const ratio = metadata.width / metadata.height;
    let sizeClass = 'size-normal'; // default close to square
    if (ratio >= 1.3) sizeClass = 'size-wide'; // 16:9 is ~1.77
    else if (ratio <= 0.75) sizeClass = 'size-tall'; // 9:16 is ~0.56
    
    // Optimize to < 50KB. WebP with quality 50 and resize width to max 800px.
    await sharp(filePath)
      .resize({ width: 800, withoutEnlargement: true })
      .webp({ quality: 50 })
      .toFile(optPath);
      
    // Record data for the frontend
    projectsData.push({
      original: `./assets/images/projects-pics/${file}`,
      thumbnail: `./assets/images/optimized/${file}`,
      sizeClass: sizeClass,
      alt: file.replace('_result-scaled.webp', '').replace(/-/g, ' ')
    });
  }
  
  await fs.writeFile(path.join(process.cwd(), 'projects_data.json'), JSON.stringify(projectsData, null, 2));
  console.log('Finished image optimization.');
}

optimizeImages().catch(console.error);
