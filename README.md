Sorry Darling — Static site scaffold

Place your artwork images in `assets/images/` (or keep them in `assets/`) and update the HTML pages as needed. Open `index.html` in a browser to preview.

Photo gallery manifest update:

- Add or remove images from `assets/images/photoGallery/`
- Run: `node scripts/update-gallery-manifest.js`
- This regenerates `assets/images/photoGallery/manifest.json` so the gallery automatically reflects the current directory contents.
