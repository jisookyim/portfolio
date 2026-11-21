// Builds the homepage (index.html) from templates/index.html.
// - Each case study JSON in content/case-studies/ becomes one boarding pass card.
// - content/hero.json becomes the animated From → To hero at the top.
// Usage: node scripts/build-site.mjs
//
// Inputs:  templates/index.html, components/boarding-pass.html, content/case-studies/*.json, content/hero.json
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

// --- case study cards ---
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

// --- hero: From → To cycle ---
const hero = JSON.parse(read("content/hero.json"));
if (!Array.isArray(hero.pairs) || hero.pairs.length < 1) {
  throw new Error("content/hero.json: needs at least one pair in \"pairs\"");
}
hero.pairs.forEach((p, n) => {
  if (!p.from || !p.to) throw new Error(`content/hero.json: pair ${n + 1} needs "from" and "to"`);
});

const stack = (key) =>
  hero.pairs
    .map((p, i) => `<span${i === 0 ? ' class="is-active"' : ""}>${escapeHtml(p[key])}</span>`)
    .join("");

const heroHtml = `<section class="hero" aria-label="From and to" data-interval="${Number(hero.interval_ms) || 2600}">
  <div class="hero-route">
    <div class="hero-point">
      <p class="hero-label">From</p>
      <div class="hero-cycle" data-cycle aria-hidden="true">${stack("from")}</div>
    </div>
    <div class="hero-arrow" aria-hidden="true">→</div>
    <div class="hero-point hero-to">
      <p class="hero-label">To</p>
      <div class="hero-cycle" data-cycle aria-hidden="true">${stack("to")}</div>
    </div>
  </div>
  <p class="sr-only">${hero.pairs
    .map((p) => `From ${escapeHtml(p.from)} to ${escapeHtml(p.to)}.`)
    .join(" ")}</p>
</section>`;

// --- assemble ---
const home = homeTemplate
  .replace("{{hero}}", heroHtml)
  .replace("{{tickets}}", tickets.join("\n\n"));

fs.writeFileSync(path.join(root, "index.html"), home);
console.log(`built index.html: hero with ${hero.pairs.length} pair(s), ${files.length} boarding pass card(s)`);
