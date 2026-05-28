import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const publicDir = path.join(root, "public");
const imagesDir = path.join(publicDir, "images");
const logoPath = path.join(publicDir, "logos", "gsn-clear-logo.png");
const ogSourcePath = path.join(imagesDir, "gsn-network-map.png");

async function writeBrandAssets() {
  await sharp(ogSourcePath)
    .resize(1200, 630, { fit: "cover", position: "center" })
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(path.join(publicDir, "og-gsn.jpg"));

  await sharp(logoPath)
    .resize(32, 32, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toFile(path.join(publicDir, "favicon-32x32.png"));

  await sharp(logoPath)
    .resize(180, 180, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toFile(path.join(publicDir, "apple-touch-icon.png"));

  await sharp(logoPath)
    .resize(192, 192, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toFile(path.join(publicDir, "favicon-192x192.png"));
}

async function listImageFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name);
      return entry.isDirectory() ? listImageFiles(fullPath) : fullPath;
    })
  );

  return files.flat().filter((file) => /\.(png|jpe?g)$/i.test(file));
}

async function optimizeImage(file) {
  const before = (await fs.stat(file)).size;
  const ext = path.extname(file).toLowerCase();
  const image = sharp(file, { animated: false });
  const metadata = await image.metadata();
  const maxWidth = ext === ".png" ? 1500 : 1800;
  const needsResize = metadata.width && metadata.width > maxWidth;
  const pipeline = needsResize ? image.resize({ width: maxWidth, withoutEnlargement: true }) : image;
  const tempFile = `${file}.optimized`;

  if (ext === ".jpg" || ext === ".jpeg") {
    await pipeline.jpeg({ quality: 82, mozjpeg: true }).toFile(tempFile);
  } else {
    await pipeline.png({ compressionLevel: 9, adaptiveFiltering: true, palette: false }).toFile(tempFile);
  }

  const after = (await fs.stat(tempFile)).size;
  if (after < before) {
    await fs.rename(tempFile, file);
    return { file, before, after };
  }

  await fs.unlink(tempFile);
  return { file, before, after: before };
}

await writeBrandAssets();

const imageFiles = await listImageFiles(imagesDir);
const optimized = [];

for (const file of imageFiles) {
  optimized.push(await optimizeImage(file));
}

const beforeTotal = optimized.reduce((total, item) => total + item.before, 0);
const afterTotal = optimized.reduce((total, item) => total + item.after, 0);
const changed = optimized.filter((item) => item.after < item.before);

console.log(
  JSON.stringify(
    {
      generated: ["public/og-gsn.jpg", "public/favicon-32x32.png", "public/favicon-192x192.png", "public/apple-touch-icon.png"],
      optimizedImages: changed.length,
      beforeTotal,
      afterTotal,
      saved: beforeTotal - afterTotal,
      largestSavings: changed
        .sort((a, b) => b.before - b.after - (a.before - a.after))
        .slice(0, 12)
        .map((item) => ({
          file: path.relative(root, item.file),
          before: item.before,
          after: item.after,
          saved: item.before - item.after
        }))
    },
    null,
    2
  )
);
