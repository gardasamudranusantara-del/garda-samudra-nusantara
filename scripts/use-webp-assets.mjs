import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const files = [
  "app/page.jsx",
  "app/globals.css",
  "components/DivisionPage.jsx",
  "components/GSNExportAssistant.jsx",
  "components/InquiryForm.jsx",
  "components/Navbar.jsx",
  "components/ProductSection.jsx",
  "data/company.js"
];

let changedFiles = 0;
let replacements = 0;

for (const file of files) {
  const fullPath = path.join(root, file);
  let source = await fs.readFile(fullPath, "utf8");
  const next = source.replace(/\/images\/([^"')\s]+?)\.(png|jpe?g)/gi, (_match, name) => {
    replacements += 1;
    return `/images/${name}.webp`;
  });

  if (next !== source) {
    await fs.writeFile(fullPath, next);
    changedFiles += 1;
  }
}

console.log(JSON.stringify({ changedFiles, replacements }, null, 2));
