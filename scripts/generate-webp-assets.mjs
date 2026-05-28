import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const imagesDir = path.join(root, "public", "images");

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

const files = await listImageFiles(imagesDir);
const generated = [];

for (const file of files) {
  const target = file.replace(/\.(png|jpe?g)$/i, ".webp");
  const image = sharp(file, { animated: false });
  const metadata = await image.metadata();
  const maxWidth = metadata.width && metadata.width > 1800 ? 1800 : undefined;
  const pipeline = maxWidth ? image.resize({ width: maxWidth, withoutEnlargement: true }) : image;

  await pipeline.webp({ quality: 78, effort: 5 }).toFile(target);

  const before = (await fs.stat(file)).size;
  const after = (await fs.stat(target)).size;
  generated.push({ file: path.relative(root, file), target: path.relative(root, target), before, after });
}

const beforeTotal = generated.reduce((total, item) => total + item.before, 0);
const afterTotal = generated.reduce((total, item) => total + item.after, 0);

console.log(
  JSON.stringify(
    {
      generated: generated.length,
      beforeTotal,
      webpTotal: afterTotal,
      estimatedSavedWhenUsed: beforeTotal - afterTotal,
      largestSavings: generated
        .sort((a, b) => b.before - b.after - (a.before - a.after))
        .slice(0, 12)
        .map((item) => ({
          file: item.file,
          target: item.target,
          before: item.before,
          after: item.after,
          saved: item.before - item.after
        }))
    },
    null,
    2
  )
);
