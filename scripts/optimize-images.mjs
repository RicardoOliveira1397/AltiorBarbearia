import sharp from 'sharp';
import { mkdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

const directory = join(import.meta.dirname, '..', 'public', 'images');
await mkdir(directory, { recursive: true });

// Bake the existing CSS saturation matrix into the assets so moving images
// do not need a live filter pass. Keep the JPGs as the editable originals.
function saturationMatrix(amount) {
  return [
    [.213 + .787 * amount, .715 - .715 * amount, .072 - .072 * amount],
    [.213 - .213 * amount, .715 + .285 * amount, .072 - .072 * amount],
    [.213 - .213 * amount, .715 - .715 * amount, .072 + .928 * amount]
  ];
}

const variants = [
  ['craft', 'craft', .4, [640, 1280]],
  ['portrait', 'portrait', .4, [640, 1280]],
  ['atelier', 'atelier', .4, [640, 1280]],
  ['detail', 'detail', .4, [640, 1280]],
  ['craft', 'craft-hero', .55, [960, 1800]],
  ['portrait', 'portrait-closing', .35, [960, 1800]]
];

let originalBytes = 0, defaultBytes = 0;
for (const name of ['craft', 'portrait', 'atelier', 'detail']) {
  originalBytes += (await readFile(join(directory, `${name}.jpg`))).byteLength;
}
for (const [source, output, saturation, widths] of variants) {
  const input = join(directory, `${source}.jpg`);
  for (const width of widths) {
    const result = await sharp(input).resize({ width, withoutEnlargement: true })
      .recomb(saturationMatrix(saturation)).webp({ quality: 82, effort: 5 })
      .toFile(join(directory, `${output}-${width}.webp`));
    if (source === output && width === 1280) defaultBytes += result.size;
  }
}

// A tiny static texture replaces the full-screen SVG turbulence filter.
let seed = 1397;
const pixels = Buffer.alloc(96 * 96);
for (let i = 0; i < pixels.length; i++) {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  pixels[i] = seed >>> 24;
}
await sharp(pixels, { raw: { width: 96, height: 96, channels: 1 } })
  .png().toFile(join(directory, 'grain.png'));
console.log(JSON.stringify({ originalBytes, defaultBytes, reductionPercent: Math.round(100 * (1 - defaultBytes / originalBytes)) }));
