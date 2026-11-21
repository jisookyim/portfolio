// Builds every case study page from the boarding pass component.
// Usage: node scripts/build-case-studies.mjs
// Inputs:  content/case-studies/*.json  (one file per case study)
// Output:  case-studies/*.html          (generated; do not edit by hand)

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const template = fs.readFileSync(path.join(root, "components/boarding-pass.html"), "utf8");
const dataDir = path.join(root, "content/case-studies");
const outDir = path.join(root, "case-studies");

fs.mkdirSync(outDir, { recursive: true });

const escapeHtml = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

for (const file of fs.readdirSync(dataDir).filter((f) => f.endsWith(".json"))) {
  const data = JSON.parse(fs.readFileSync(path.join(dataDir, file), "utf8"));

  const component = template
    // Strip the template's own comment header so it does not end up in pages.
    .replace(/<!--[\s\S]*?-->\s*/, "")
    .replace(/\{\{(\w+)\}\}/g, (_, key) => {
      if (!(key in data)) throw new Error(`${file}: missing "${key}"`);
      return escapeHtml(data[key]);
    });

  const page = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(data.title)} | Ji-Sook Yim</title>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,400..800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../components/boarding-pass.css">
</head>
<body style="margin:0;padding:56px 24px;background:#FFFFFF;">
${component}
</body>
</html>
`;

  const outName = file.replace(/\.json$/, ".html");
  fs.writeFileSync(path.join(outDir, outName), page);
  console.log(`built case-studies/${outName}`);
}
