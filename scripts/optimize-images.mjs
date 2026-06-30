import sharp from "sharp";
import { readdir, mkdir, stat } from "node:fs/promises";
import path from "node:path";

const SRC = "balay_property_photos";
const OUT = "public/balay_property_photos";

await mkdir(OUT, { recursive: true });
const files = (await readdir(SRC)).filter((f) => /\.(jpe?g|png)$/i.test(f));

let before = 0;
let after = 0;
for (const f of files) {
  const inPath = path.join(SRC, f);
  const outName = f.replace(/\.(jpe?g|png)$/i, ".jpg");
  const outPath = path.join(OUT, outName);
  before += (await stat(inPath)).size;
  await sharp(inPath)
    .rotate() // respect EXIF orientation
    .resize({ width: 1280, withoutEnlargement: true })
    .jpeg({ quality: 72, mozjpeg: true, progressive: true })
    .toFile(outPath);
  after += (await stat(outPath)).size;
  process.stdout.write(`✓ ${outName}\n`);
}

const mb = (n) => (n / 1024 / 1024).toFixed(1) + " MB";
console.log(`\nOptimized ${files.length} images: ${mb(before)} → ${mb(after)} (${Math.round((1 - after / before) * 100)}% smaller)`);
