// Builds the homepage (index.html) from templates/index.html.
// - Each case study JSON in content/case-studies/ becomes one boarding pass card.
// - Each recommendation JSON in content/recommendations/ becomes one recommendation card.
// - components/passport.html is inserted where {{passport}} sits in the template.
// - content/hero.json still feeds the From → To hero, if a {{hero}} slot is used.
// - Each JSON in content/case-study-pages/ becomes a page at /<file-name>/ using templates/case-study.html.
// Usage: node scripts/build-site.mjs
//
// Inputs:  templates/index.html, components/boarding-pass.html, content/case-studies/*.json, content/hero.json
// Output:  index.html (generated; do not edit by hand)

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8");

const escapeHtml = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// Strip the leading HTML comment from a component template.
const stripComment = (s) => s.replace(/^\s*<!--[\s\S]*?-->\s*/, "");

const boardingPass = stripComment(read("components/boarding-pass.html"));
const homeTemplate = stripComment(read("templates/index.html"));
const passport = stripComment(read("components/passport.html"));
const siteHeader = stripComment(read("components/site-header.html")).trim();
const siteFooter = stripComment(read("components/site-footer.html")).trim();
const withRoot = (html, rootPath) => html.replaceAll("{{root}}", rootPath);

// Add a content fingerprint to CSS and JS links so browsers never show a stale copy after a change.
const fingerprint = (html) =>
  html.replace(/((?:href|src)=")((?:\.\.\/)?components\/([\w-]+\.(?:css|js)))"/g, (_, attr, url, name) => {
    const hash = crypto.createHash("sha1").update(read(`components/${name}`)).digest("hex").slice(0, 8);
    return `${attr}${url}?v=${hash}"`;
  });

// --- case study cards ---
const dataDir = path.join(root, "content/case-studies");
const files = fs.readdirSync(dataDir).filter((f) => f.endsWith(".json")).sort();

// The CTA sentence is the card's only link. With cta_href it becomes a link
// (stretched over the card in CSS); without it, plain text so nothing links nowhere.
const ctaHtml = (data) => {
  const text = escapeHtml(data.cta_text.trim());
  // keep the arrow on the same line as the last word
  const cut = text.lastIndexOf(" ");
  const body = `${text.slice(0, cut + 1)}<span class="bp-cta-end">${text.slice(cut + 1)}<span class="bp-cta-arrow" aria-hidden="true">→</span></span>`;
  return data.cta_href
    ? `<a class="bp-cta" href="${escapeHtml(data.cta_href)}">${body}</a>`
    : `<p class="bp-cta">${body}</p>`;
};

const tickets = files.map((file) => {
  const data = JSON.parse(fs.readFileSync(path.join(dataDir, file), "utf8"));
  return boardingPass
    .replace(/\{\{(\w+)\}\}/g, (_, key) => {
      if (key === "cta") {
        if (!data.cta_text) throw new Error(`${file}: missing "cta_text"`);
        return ctaHtml(data);
      }
      if (!(key in data)) throw new Error(`${file}: missing "${key}"`);
      return escapeHtml(data[key]);
    })
    .split("\n")
    .map((line) => (line ? "      " + line : line))
    .join("\n");
});

// --- recommendation cards ---
// One card per JSON file in content/recommendations/, in filename order (01-, 02-, ...).
const recommendation = stripComment(read("components/recommendation.html"));
const recDir = path.join(root, "content/recommendations");
const recFiles = fs.readdirSync(recDir).filter((f) => f.endsWith(".json")).sort();

const initials = (name) =>
  name.split(/\s+/).filter(Boolean).map((w) => w[0]).slice(0, 2).join("").toUpperCase();

const recCards = recFiles.map((file) => {
  const data = JSON.parse(fs.readFileSync(path.join(recDir, file), "utf8"));
  for (const key of ["quote", "name", "title"]) {
    if (!data[key]) throw new Error(`content/recommendations/${file}: missing "${key}"`);
  }
  const avatar = data.photo
    ? `<img class="rec-avatar" src="${escapeHtml(data.photo)}" alt="${escapeHtml(data.name)}">`
    : `<span class="rec-avatar" aria-hidden="true">${escapeHtml(initials(data.name))}</span>`;
  return recommendation
    .replace(/\{\{(\w+)\}\}/g, (_, key) => (key === "avatar" ? avatar : escapeHtml(data[key] ?? "")))
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

// --- stamp postcards: content/stamps.json, read by components/stamp-postcards.js ---
const stampData = JSON.stringify(JSON.parse(read("content/stamps.json"))).replace(/</g, "\\u003c");

// --- assemble ---
const home = homeTemplate
  .replace("{{site_header}}", () => withRoot(siteHeader, ""))
  .replace("{{site_footer}}", () => withRoot(siteFooter, ""))
  .replace("{{stamp_data}}", () => stampData)
  .replace("{{passport}}", passport)
  .replace("{{hero}}", heroHtml)
  .replace("{{tickets}}", tickets.join("\n\n"))
  .replace("{{recommendations}}", recCards.join("\n\n"));

fs.writeFileSync(path.join(root, "index.html"), fingerprint(home));
// --- case study pages ---
// One page per JSON in content/case-study-pages/. The title, FROM, TO and cover come from its
// homepage card ("card"). Each section is a list of reusable blocks, rendered below.
const caseTemplate = stripComment(read("templates/case-study.html"));
const routeColors = ["coral", "signal-yellow", "pink", "periwinkle", "indigo"];

// Card icons: Material Icons (Apache 2.0). Decorative, so hidden from screen readers.
const cardIcons = {
  sparkle: "M19 9l1.25-2.75L23 5l-2.75-1.25L19 1l-1.25 2.75L15 5l2.75 1.25L19 9zm-7.5.5L9 4 6.5 9.5 1 12l5.5 2.5L9 20l2.5-5.5L17 12l-5.5-2.5zM19 15l-1.25 2.75L15 19l2.75 1.25L19 23l1.25-2.75L23 19l-2.75-1.25L19 15z",
  calendar: "M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z",
  compare: "M9.01 14H2v2h7.01v3L13 15l-3.99-4v3zm5.98-1v-3H22V8h-7.01V5L11 9l3.99 4z",
  clock: "M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z",
  shield: "M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z",
  trend: "M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z",
};
const cardIcon = (name) => {
  if (!name) return "";
  if (!cardIcons[name]) throw new Error(`Unknown card icon "${name}"`);
  return `<svg class="cs-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="${cardIcons[name]}"/></svg>`;
};

const listItem = (item) =>
  typeof item === "string"
    ? `<li>${escapeHtml(item)}</li>`
    : `<li><strong>${escapeHtml(item.lead)}:</strong> ${escapeHtml(item.text)}</li>`;
const list = (items) => `<ul class="cs-list">${items.map(listItem).join("")}</ul>`;
const assetPath = (src) => `../${escapeHtml(src)}`;

const blockRenderers = {
  text: (b) => `<p>${escapeHtml(b.text)}</p>`,
  subhead: (b) => `<h3>${escapeHtml(b.text)}</h3>`,
  list: (b) => list(b.items),
  image: (b) =>
    `<figure class="cs-media cs-wide"><img src="${assetPath(b.src)}" alt="${escapeHtml(b.alt)}" width="${b.width}" height="${b.height}" loading="lazy"></figure>`,
  // A video with no src yet shows its poster and a visible note.
  video: (b) =>
    b.src
      ? `<figure class="cs-media cs-wide"><video src="${assetPath(b.src)}" poster="${assetPath(b.poster)}" width="${b.width}" height="${b.height}" controls playsinline preload="metadata" aria-label="${escapeHtml(b.alt)}"></video></figure>`
      : `<figure class="cs-media cs-wide"><img src="${assetPath(b.poster)}" alt="${escapeHtml(b.alt)}" width="${b.width}" height="${b.height}" loading="lazy"><figcaption>${escapeHtml(b.note || "")}</figcaption></figure>`,
  cards: (b) =>
    `<div class="cs-cards cs-wide">${b.items
      .map(
        (c) =>
          `<div class="cs-card">${cardIcon(c.icon)}${c.title ? `<h3>${escapeHtml(c.title)}</h3>` : ""}${c.text
            .map((t) => `<p>${escapeHtml(t)}</p>`)
            .join("")}</div>`,
      )
      .join("")}</div>`,
  compare: (b) =>
    `<div class="cs-compare">${b.items
      .map((c) => `<div><h4>${escapeHtml(c.title)}</h4>${list(c.items)}</div>`)
      .join("")}</div>`,
};

const renderBlock = (block, file) => {
  const render = blockRenderers[block.type];
  if (!render) throw new Error(`content/case-study-pages/${file}: unknown block type "${block.type}"`);
  return `      ${render(block)}`;
};

const pageDir = path.join(root, "content/case-study-pages");
const pageFiles = fs.existsSync(pageDir) ? fs.readdirSync(pageDir).filter((f) => f.endsWith(".json")).sort() : [];

for (const file of pageFiles) {
  const page = JSON.parse(fs.readFileSync(path.join(pageDir, file), "utf8"));
  const cardIndex = files.indexOf(`${page.card}.json`);
  if (cardIndex < 0) throw new Error(`content/case-study-pages/${file}: no homepage card "${page.card}"`);
  const card = JSON.parse(fs.readFileSync(path.join(dataDir, files[cardIndex]), "utf8"));

  const details = page.details
    .map(
      (d) =>
        `      <div><dt>${escapeHtml(d.label)}</dt><dd>${
          d.inline
            ? escapeHtml(d.items.join(", "))
            : d.items.length > 1
            ? `<ul>${d.items.map((i) => `<li>${escapeHtml(i)}</li>`).join("")}</ul>`
            : escapeHtml(d.items[0])
        }</dd></div>`,
    )
    .join("\n");
  const sections = page.sections
    .map(
      (s) => `    <section class="cs-section">
      <div class="page-width">
      <div class="cs-grid">
        <h2 class="cs-label">${escapeHtml(s.heading)}</h2>
        <div class="cs-content">
${s.blocks.map((b) => renderBlock(b, file)).join("\n")}
        </div>
      </div>
      </div>
    </section>`,
    )
    .join("\n\n");

  const values = {
    title: escapeHtml(card.title),
    cta_text: escapeHtml(card.cta_text),
    from: escapeHtml(card.from),
    to: escapeHtml(card.to),
    image_src: escapeHtml(card.image_src),
    summary: escapeHtml(page.summary),
    cover_alt: escapeHtml(page.cover_alt),
    cover_width: page.cover_width,
    cover_height: page.cover_height,
    route: routeColors[cardIndex % routeColors.length],
    details,
    sections,
    site_header: withRoot(siteHeader, "../"),
    site_footer: withRoot(siteFooter, "../"),
  };
  const html = caseTemplate.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    if (!(key in values)) throw new Error(`templates/case-study.html: unknown placeholder "${key}"`);
    return values[key];
  });
  const outDir = path.join(root, path.basename(file, ".json"));
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "index.html"), fingerprint(html));
}

console.log(`built index.html: hero with ${hero.pairs.length} pair(s), ${files.length} boarding pass card(s), ${recFiles.length} recommendation card(s), ${pageFiles.length} case study page(s)`);
