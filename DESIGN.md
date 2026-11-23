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
- Passport machine-readable lines only: Courier New (monospace), as a stand-in for the OCR-B type on real passports. Not used anywhere else.
- Handwritten postcards only: Caveat (600–700, free on Google Fonts), for the writing side of the stamp postcards (notes, place names, mentor quotes and sender details). Not used anywhere else.

## Layout
- Maximum content width: 1120px. Two-column card grid on desktop, one column on mobile.
- Text: flush-left, ragged-right. Never center long text.
- Spacing: multiples of 8px.
- Sections: no rules above section headings. Separate sections with space (96px desktop, 56–64px mobile) and color blocking. Section headings are 40px bold (30px mobile).
- Color blocking (interim, until the bolder color foundation): white for who Ji-Sook is and the work (passport, Featured Work); a full-width grey (#ECECEC) band for what others say (Recommendations + Reviews by My Mentees); then a slim ink footer bar. Cards stay white with their black borders, so they are the only lines on the page.
- Rules inside components (FROM → TO, recommendation divider, passport dividers) stay, inset inside the card padding.

## Components
- Boarding pass card (`components/boarding-pass.html` and `.css`): used on the homepage under "Featured Work". Solid 2px black border, square corners, 36px padding. Desktop: two columns. Left column, top to bottom: case study title (40px, bold), FROM ✈ TO on one line (TO right-aligned; rule above and dashed rule below, both inset inside the padding), then the CTA sentence (17px). Right column: image in a fixed 4:3 frame. Mobile: one column: title, FROM ✈ TO, CTA sentence, image. Do not add labels such as "Boarding pass" or case study numbers, and do not add a separate CTA button.
  - Ticket cues: a red trim band across the top inside the black border (12px desktop, 10px mobile; no text in it), matching the passport's red header bar. Half-circle notches cut into the edges like a tear-off stub: top and bottom edges at the middle of the column gap on desktop (32px), left and right edges just above the image on mobile (24px). No perforation line: it competed with the dashed route line and split the image off. Notches are decorative (aria-hidden).
  - CTA sentence: a descriptive sentence (e.g. "Explore how an analytics portal helps build efficiency for benefits administrators") ending in →, which stays on the same line as the last word. It is the card's only link, so link text is unique per card (WCAG 2.4.4).
  - With a case study URL: the sentence is red and underlined, and the link is stretched over the whole card so the whole card is clickable. Hover/focus: underline thickens to 2px, the plane flies straight (level, no arc or trail) from FROM to TO and stays there, the arrow nudges right. The border stays black (no red border, no lift or shadow). Keyboard focus adds a red outline around the card. Reduced motion: no flight or nudge.
  - Without a URL yet: the sentence is muted grey and not a link. Every featured card should have its case study page before launch.
  - Plane icon: Material Icons "flight" (Apache 2.0), rotated to point right, in ink. Used between FROM and TO on the boarding pass and the passport. Not an emoji.
- Passport (`components/passport.html` and `.css`): the homepage hero, styled as a passport data page. Red header bar, 2px black border, square corners.
  - Security print: a faint guilloche pattern (thin concentric circles at about 4% ink) behind the whole page. Keep it faint so text keeps full contrast.
  - Data fields: small uppercase labels (NAME, PROFESSION, EXPERIENCE, FOCUS) above the values, next to the photo.
  - Impact: the first field under FROM → TO. Big bold number (+56%, +4.9 pts, 35M, 4) followed by a short plain description; no category tags. Desktop: two columns (2 x 2), each number column only as wide as its widest number, 20px to the text, no dividers inside. Phones: one column with thin rules between rows. "pts" is read to screen readers as "percentage points".
  - Interests are entry stamps in ink, tilted a few degrees, each with one detail of its own: framed with a plane (Mentorship), round seal with curved text (SXSW), dashed with stars (Solo travel), perforated postage edge with a monochrome Swiss flag (Swatch), two-ring oval with curved text (Piano). Stamps are real text in a list; seals and ovals are SVG with a screen-reader label. Desktop: one row, stamps stretch to fill it. Phones: two-column grid, Piano oval centered on its own row.
  - Machine-readable lines: two 44-character lines at the foot of the page, full width (font up to 30px, then letter-spacing fills the rest). Decorative, hidden from screen readers.
- Strengths row: three columns, each with a top rule and no numbers.
- From → To hero: below the intro, one rule above it, values cycle through pairs in `content/hero.json`. No CTA.
- Recommendation card (`components/recommendation.html` and `.css`): structure follows the cards on the current Squarespace site, visuals follow this system. Solid 2px black border, square corners, 32px padding. Quote (17px) on top, then a 1px black divider inside the padding, then a round 48px headshot (initials on grey if no photo) with name (bold) and title (muted). Two columns on desktop, one on mobile.
- Section heading: bold, 40px, no top rule.
- Footer bar: slim full-width ink (#111111) band at the bottom, white text. Minimal: 20px vertical padding, one line (15px, regular weight), then email and LinkedIn icons at 24 x 24, with 24 x 24 tap targets spaced 16px apart (meets WCAG 2.5.8), each with a readable name. Icon hover turns red; keyboard focus shows a white outline. Icons sit right after the line (not pushed to the far edge). Mobile: still one row, 13px text. Replaces the old large closing section and button.

## Tone
- Direct, confident, plain. Short sentences. No hype words.
- Warm where it counts: the values (FROM ambiguity TO clarity) carry the personality.

## Capitalization
- Page titles, section headings and case study card titles use initial caps (title case): capitalize every major word, e.g. "Recommendations from Senior Leaders", "Leave of Absence Request".
- Keep these lowercase unless they are the first or last word: articles (a, an, the), short conjunctions (and, but, or, nor), and short prepositions (at, by, for, from, in, of, on, to, with).
- Always capitalize nouns, verbs, adjectives, adverbs and pronouns (including "My", "Your", "Is").
- Not covered: body text, CTA sentences and the footer line stay in sentence case; small labels (FROM, TO, field labels, stamps) stay uppercase.
