# Design system

Status: foundation v1. Swiss direction chosen. Bolder colors still to be defined.

## Direction
- Style: Swiss (International Typographic Style). Strict grid, flush-left text, clear hierarchy, restrained color.
- Feel: TBD (three words from Ji-Sook still pending)
- Concept layer: the homepage project cards are boarding passes (FROM → TO). This is a component, not a style.
- Avoid: common AI-template looks (purple gradients, glassmorphism, generic Inter-everywhere layouts).

## Colors
Base palette (Swiss):
- Ink: #111111 (primary text, rules)
- Paper: #FFFFFF (page background)
- Grey: #ECECEC (alternate section background)
- Muted text: #5C5C5C (secondary copy)
- Red: #E30613 (single accent: links, numbers, highlights, CTA)

Bold palette: TBD. To be added later as a small set of extra accent colors. Until then, use the base palette only. Do not add new colors ad hoc.

Usage rules:
- One accent color per view. Red is the default accent.
- Color signals meaning (links, numbers, emphasis), not decoration.

## Typography
- Headings and body: Archivo (neo-grotesque sans-serif, Helvetica-like, free on Google Fonts). Swap only if Ji-Sook asks.
- Do not use Inter, system defaults, or serif display faces unless added here.
- Headings: bold (700–800), tight leading.
- Body: regular (400), 17px, line height about 1.5.
- Labels and data (FROM, TO): uppercase, small, letter-spaced.

## Layout
- Maximum content width: 1120px. Two-column card grid on desktop, one column on mobile.
- Text: flush-left, ragged-right. Never center long text.
- Spacing: multiples of 8px.
- Sections: no rules above section headings. Separate sections with space (96px desktop, 56–64px mobile) and color blocking. Section headings are 40px bold (30px mobile).
- Color blocking (interim, until the bolder color foundation): white for who Ji-Sook is and the work (passport, Featured Work); a full-width grey (#ECECEC) band for what others say (Recommendations + Reviews by my mentees); white for Let's connect. Cards stay white with their black borders, so they are the only lines on the page.
- Rules inside components (FROM → TO, recommendation divider, passport dividers) stay, inset inside the card padding.

## Components
- Boarding pass card (`components/boarding-pass.html` and `.css`): used on the homepage under "Featured Work". Solid 2px black border, square corners, 36px padding. Desktop: two columns. Left column, top to bottom: case study title (40px, bold), FROM ✈ TO on one line (TO right-aligned; rule above and dashed rule below, both inset inside the padding), then the CTA sentence (17px). Right column: image in a fixed 4:3 frame. Mobile: one column: title, FROM ✈ TO, CTA sentence, image. Do not add labels such as "Boarding pass" or case study numbers, and do not add a separate CTA button.
  - CTA sentence: a descriptive sentence (e.g. "Explore how an analytics portal helps build efficiency for benefits administrators") ending in →, which stays on the same line as the last word. It is the card's only link, so link text is unique per card (WCAG 2.4.4).
  - With a case study URL: the sentence is red and underlined, and the link is stretched over the whole card so the whole card is clickable. Hover/focus: underline thickens to 2px, the plane flies straight (level, no arc or trail) from FROM to TO and stays there, the arrow nudges right. The border stays black (no red border, no lift or shadow). Keyboard focus adds a red outline around the card. Reduced motion: no flight or nudge.
  - Without a URL yet: the sentence is muted grey and not a link. Every featured card should have its case study page before launch.
  - Plane icon: Material Icons "flight" (Apache 2.0), rotated to point right, in ink. Used between FROM and TO on the boarding pass and the passport. Not an emoji.
- Strengths row: three columns, each with a top rule and no numbers.
- From → To hero: below the intro, one rule above it, values cycle through pairs in `content/hero.json`. No CTA.
- Recommendation card (`components/recommendation.html` and `.css`): structure follows the cards on the current Squarespace site, visuals follow this system. Solid 2px black border, square corners, 32px padding. Quote (17px) on top, then a 1px black divider inside the padding, then a round 48px headshot (initials on grey if no photo) with name (bold) and title (muted). Two columns on desktop, one on mobile.
- Section heading: bold, 40px, no top rule.
- Closing call to action: large heading and one button.

## Tone
- Direct, confident, plain. Short sentences. No hype words.
- Warm where it counts: the values (FROM ambiguity TO clarity) carry the personality.
