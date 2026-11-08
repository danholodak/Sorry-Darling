const fs = require('fs');
const path = require('path');

const photoDir = path.join(__dirname, '..', 'assets', 'images', 'photoGallery');
const manifestPath = path.join(photoDir, 'manifest.json');

const allowedExtensions = new Set([
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.gif',
  '.avif',
  '.bmp'
]);

const files = fs
  .readdirSync(photoDir, { withFileTypes: true })
  .filter((entry) => entry.isFile())
  .map((entry) => entry.name)
  .filter((name) => name !== 'manifest.json')
  .filter((name) => allowedExtensions.has(path.extname(name).toLowerCase()))
  .map((name) => {
    const extension = path.extname(name);
    const caption = path.basename(name, extension);
    return {
      src: `assets/images/photoGallery/${name}`,
      caption
    };
  })
  .sort((a, b) => a.caption.localeCompare(b.caption, undefined, { sensitivity: 'base' }));

fs.writeFileSync(manifestPath, `${JSON.stringify(files, null, 2)}\n`, 'utf8');

console.log(`Updated ${manifestPath} with ${files.length} photo entries.`);
