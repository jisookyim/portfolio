// Builds the homepage (index.html) from templates/index.html.
// Each case study JSON in content/case-studies/ becomes one boarding pass card.
// Usage: node scripts/build-site.mjs
//
// Inputs:  templates/index.html, components/boarding-pass.html, content/case-studies/*.json
// Output:  index.html (generated; do not edit by hand)

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8");

const escapeHtml = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// Strip the leading HTML comment from a component template.
const stripComment = (s) => s.replace(/^\s*<!--[\s\S]*?-->\s*/, "");

const boardingPass = stripComment(read("components/boarding-pass.html"));
const homeTemplate = stripComment(read("templates/index.html"));

const dataDir = path.join(root, "content/case-studies");
const files = fs.readdirSync(dataDir).filter((f) => f.endsWith(".json")).sort();

const tickets = files.map((file) => {
  const data = JSON.parse(fs.readFileSync(path.join(dataDir, file), "utf8"));
  return boardingPass
    .replace(/\{\{(\w+)\}\}/g, (_, key) => {
      if (!(key in data)) throw new Error(`${file}: missing "${key}"`);
      return escapeHtml(data[key]);
    })
    .split("\n")
    .map((line) => (line ? "      " + line : line))
    .join("\n");
});

const home = homeTemplate.replace("{{tickets}}", tickets.join("\n\n"));

fs.writeFileSync(path.join(root, "index.html"), home);
console.log(`built index.html with ${files.length} boarding pass card(s)`);
