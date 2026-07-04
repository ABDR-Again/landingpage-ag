import { mkdir, readdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const root = process.cwd();
const inputRoot = path.join(root, 'assets', 'images', 'client-testimonials-images');
const outputRoot = path.join(root, 'assets', 'optimized', 'client-testimonials');
const lowRoot = path.join(outputRoot, 'low');
const fullRoot = path.join(outputRoot, 'full');
const manifestPath = path.join(root, 'src', 'sections', 'testimonial-images.js');

const clientNameFixes = new Map([
  ['Crays Blackman-Rogers', 'Carys Blackman-Rogers'],
]);

const imageExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp']);
const targetBytes = 50 * 1024;

function slugify(value) {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function walkFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await walkFiles(fullPath));
      continue;
    }

    if (entry.isFile() && imageExtensions.has(path.extname(entry.name).toLowerCase())) {
      files.push(fullPath);
    }
  }

  return files;
}

async function makeLowVariant(inputPath, outputPath) {
  const widths = [760, 680, 600, 520, 460, 400, 340, 300];
  const qualities = [72, 64, 56, 48, 40, 34, 28];
  let bestBuffer = null;

  for (const width of widths) {
    for (const quality of qualities) {
      const buffer = await sharp(inputPath)
        .rotate()
        .resize({ width, withoutEnlargement: true })
        .webp({ quality, effort: 6 })
        .toBuffer();

      bestBuffer = buffer;
      if (buffer.byteLength <= targetBytes) {
        await writeFile(outputPath, buffer);
        return buffer.byteLength;
      }
    }
  }

  await writeFile(outputPath, bestBuffer);
  return bestBuffer.byteLength;
}

async function makeFullVariant(inputPath, outputPath) {
  const buffer = await sharp(inputPath)
    .rotate()
    .resize({ width: 1800, withoutEnlargement: true })
    .webp({ quality: 82, effort: 5 })
    .toBuffer();

  await writeFile(outputPath, buffer);
  return buffer.byteLength;
}

function modulePath(filePath) {
  return path
    .relative(path.join(root, 'src', 'sections'), filePath)
    .replaceAll(path.sep, '/');
}

function toJsUrl(filePath) {
  return `new URL(${JSON.stringify(modulePath(filePath))}, import.meta.url).href`;
}

async function main() {
  await mkdir(lowRoot, { recursive: true });
  await mkdir(fullRoot, { recursive: true });
  await mkdir(path.dirname(manifestPath), { recursive: true });

  const files = (await walkFiles(inputRoot))
    .filter((file) => !/profile/i.test(path.basename(file)))
    .sort((a, b) => a.localeCompare(b));

  const manifest = new Map();
  const rows = [];

  for (const file of files) {
    const clientFolder = path.basename(path.dirname(file));
    const clientName = clientNameFixes.get(clientFolder) ?? clientFolder;
    const baseSlug = `${slugify(clientName)}-${slugify(path.basename(file, path.extname(file)))}`;
    const lowPath = path.join(lowRoot, `${baseSlug}.webp`);
    const fullPath = path.join(fullRoot, `${baseSlug}.webp`);

    const lowBytes = await makeLowVariant(file, lowPath);
    const fullBytes = await makeFullVariant(file, fullPath);

    if (!manifest.has(clientName)) {
      manifest.set(clientName, []);
    }

    manifest.get(clientName).push({
      lowPath,
      fullPath,
      original: path.relative(root, file).replaceAll(path.sep, '/'),
    });

    rows.push({
      client: clientName,
      file: path.basename(file),
      lowKB: Math.round(lowBytes / 1024),
      fullKB: Math.round(fullBytes / 1024),
    });
  }

  const ordered = [...manifest.entries()].sort(([a], [b]) => a.localeCompare(b));
  const moduleLines = [
    'export const testimonialImages = {',
  ];

  for (const [client, images] of ordered) {
    moduleLines.push(`  ${JSON.stringify(client)}: [`);
    for (const image of images) {
      moduleLines.push('    {');
      moduleLines.push(`      low: ${toJsUrl(image.lowPath)},`);
      moduleLines.push(`      full: ${toJsUrl(image.fullPath)},`);
      moduleLines.push(`      original: ${JSON.stringify(image.original)},`);
      moduleLines.push('    },');
    }
    moduleLines.push('  ],');
  }

  moduleLines.push('};');
  moduleLines.push('');
  await writeFile(manifestPath, moduleLines.join('\n'), 'utf8');

  console.table(rows);

  const oversized = rows.filter((row) => row.lowKB > 50);
  if (oversized.length) {
    console.warn('Some optimized images remain above 50 KB:', oversized);
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
