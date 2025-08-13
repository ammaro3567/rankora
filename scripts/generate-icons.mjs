import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const publicDir = path.resolve('public');
const source = path.join(publicDir, 'logo1024.png');

const targets = [
  { name: 'logo16.png', size: 16 },
  { name: 'logo32.png', size: 32 },
  { name: 'logo180.png', size: 180 },
  { name: 'logo192.png', size: 192 },
  { name: 'logo512.png', size: 512 },
  { name: 'apple-touch-icon.png', size: 180 },
];

async function main() {
  if (!fs.existsSync(source)) {
    console.error(`Source image not found: ${source}`);
    process.exit(1);
  }

  for (const t of targets) {
    const out = path.join(publicDir, t.name);
    await sharp(source)
      .resize(t.size, t.size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png({ compressionLevel: 8 })
      .toFile(out);
    console.log('Wrote', out);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

