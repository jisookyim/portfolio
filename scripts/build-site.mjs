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
  chart: "M5 9.2h3V19H5zM10.6 5h2.8v14h-2.8zm5.6 8H19v6h-2.8z",
  lines: "M14 17H4v2h10v-2zm6-8H4v2h16V9zM4 15h16v-2H4v2zM4 5v2h16V5H4z",
  touch: "M9 11.24V7.5C9 6.12 10.12 5 11.5 5S14 6.12 14 7.5v3.74c1.21-.81 2-2.18 2-3.74C16 5.01 13.99 3 11.5 3S7 5.01 7 7.5c0 1.56.79 2.93 2 3.74zm9.84 4.63l-4.54-2.26c-.17-.07-.35-.11-.54-.11H13v-6c0-.83-.67-1.5-1.5-1.5S10 6.67 10 7.5v10.74l-3.43-.72c-.08-.01-.15-.03-.24-.03-.31 0-.59.13-.79.33l-.79.8 4.94 4.94c.27.27.65.44 1.06.44h6.79c.75 0 1.33-.55 1.44-1.28l.75-5.27c.01-.07.02-.14.02-.2 0-.62-.38-1.16-.91-1.38z",
  person: "M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z",
  people: "M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z",
  star: "M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z",
  target: "M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3c-.46-4.17-3.77-7.48-7.94-7.94V1h-2v2.06C6.83 3.52 3.52 6.83 3.06 11H1v2h2.06c.46 4.17 3.77 7.48 7.94 7.94V23h2v-2.06c4.17-.46 7.48-3.77 7.94-7.94H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z",
  chat: "M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z",
  checklist: "M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z",
  tune: "M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h-2v6h2zM7 9v2H3v2h4v2h2V9H7zm14 4v-2H11v2h10zm-6-4h2V7h4V5h-4V3h-2v6z",
  bulb: "M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7z",
  eye: "M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z",
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
    `<figure class="cs-media cs-wide${b.portrait ? " cs-media--portrait" : ""}">${b.label ? `<figcaption class="cs-media-label">${escapeHtml(b.label)}</figcaption>` : ""}<img src="${assetPath(b.src)}" alt="${escapeHtml(b.alt)}" width="${b.width}" height="${b.height}" loading="lazy">${b.caption ? `<figcaption>${escapeHtml(b.caption)}</figcaption>` : ""}</figure>`,
  // Two images side by side on one plate.
  gallery: (b) =>
    `<figure class="cs-media cs-gallery cs-wide"${b.columns ? ` style="--cols: ${b.columns.split(" ").map((c) => `minmax(0, ${c})`).join(" ")}"` : ""}>${b.items
      .map((i) => `<img src="${assetPath(i.src)}" alt="${escapeHtml(i.alt)}" width="${i.width}" height="${i.height}" loading="lazy">`)
      .join("")}</figure>`,
  // A video with no src yet shows its poster and a visible note.
  video: (b) =>
    !b.src && !b.poster
      ? `<figure class="cs-media cs-wide"><div class="cs-video-empty" role="img" aria-label="${escapeHtml(b.alt)}">${escapeHtml(b.note || "")}</div></figure>`
      : b.src
      ? `<figure class="cs-media cs-wide"><video src="${assetPath(b.src)}" poster="${assetPath(b.poster)}" width="${b.width}" height="${b.height}" controls playsinline preload="metadata" aria-label="${escapeHtml(b.alt)}"></video></figure>`
      : `<figure class="cs-media cs-wide"><img src="${assetPath(b.poster)}" alt="${escapeHtml(b.alt)}" width="${b.width}" height="${b.height}" loading="lazy"><figcaption>${escapeHtml(b.note || "")}</figcaption></figure>`,
  cards: (b) =>
    `<div class="cs-cards cs-wide">${b.items
      .map(
        (c) =>
          `<div class="cs-card">${cardIcon(c.icon)}${c.title ? `<h3>${escapeHtml(c.title)}</h3>` : ""}${(c.text || [])
            .map((t) => `<p>${escapeHtml(t)}</p>`)
            .join("")}${c.list ? list(c.list) : ""}</div>`,
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
    cover_src: escapeHtml(page.cover_src || card.image_src),
    cover_class: page.cover_cutout ? " cs-cover--cutout" : "",
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
