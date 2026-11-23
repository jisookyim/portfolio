# Design system

Status: foundation v2. Swiss direction with the Departure Board color palette.

## Direction
- Style: Swiss (International Typographic Style). Strict grid, flush-left text, clear hierarchy, bold flat color blocks.
- Feel: TBD (three words from Ji-Sook still pending)
- Concept layer: the homepage project cards are boarding passes (FROM → TO). This is a component, not a style.
- Avoid: common AI-template looks (purple gradients, glassmorphism, generic Inter-everywhere layouts).

## Colors
Base:
- Ink: #111111 (primary text, rules, card borders)
- Paper: #FFFFFF (passport and card surfaces)
- Muted text: #5C5C5C (secondary copy on white)
- Grey: #ECECEC (initials circle when a recommendation has no photo)
- Mist: #F4F5FF (case study reading area only; a very pale tint of periwinkle)

Departure Board palette (`components/theme-departure-board.css`):
- Mint: #5FF0C0 (page background: passport and Featured Work)
- Periwinkle: #9AA8FF (Recommendations and Reviews section)
- Indigo: #1A1466 (passport header, footer, name, impact numbers, links)
- Route colors for trims and postcard frames: Coral #FF7350, Signal Yellow #FFD400, Pink #FF9BE0, Periwinkle, Mint, Indigo

Stamp inks (dark enough for text on white): Indigo #1A1466, Magenta #C2108C, Teal #00686B, Rust #C2410C, Plum #7A1F5C, Violet #4F3BC9.

Usage rules:
- Sections are full-width color blocks, with no trim around them.
- Each boarding pass has its own route color on its top band. Each stamp has its own ink and postcard color.
- Bright colors are backgrounds. Text on them is ink, and text must meet WCAG AA contrast.
- Do not add new colors ad hoc.

## Typography
- Headings and body: Archivo (neo-grotesque sans-serif, Helvetica-like, free on Google Fonts). Swap only if Ji-Sook asks.
- Do not use Inter, system defaults, or serif display faces unless added here.
- Headings: medium weight (500), slightly wide (`font-stretch: 112%`), tight tracking and leading. Hierarchy comes from clear size steps, not heavy weight.
- Heading scale (desktop / tablet / phone): hero and passport name 48 / 48 / 32; section headers and case study headlines 40 / 34 / 28; boarding pass titles 28 / 28 / 24.
- Body: regular (400), 17px, line height about 1.5.
- Labels and data (FROM, TO): uppercase, small, letter-spaced.
- Passport machine-readable lines only: Courier New (monospace), as a stand-in for the OCR-B type on real passports. Not used anywhere else.
- Handwritten postcards only: Caveat (600–700, free on Google Fonts), for the writing side of the stamp postcards (notes, place names, mentor quotes and sender details). Not used anywhere else.

## Layout
- Maximum content width: 1120px. Two-column card grid on desktop, one column on mobile.
- Text: flush-left, ragged-right. Never center long text.
- Spacing: multiples of 8px.
- Sections: no rules above section headings. Separate sections with space (96px desktop, 56–64px mobile) and color blocking. Section headings follow the heading scale.
- Color blocking: mint for who Ji-Sook is and the work (passport, Featured Work); a full-width periwinkle section for what others say (Recommendations + Reviews by My Mentees); then a slim indigo footer bar. Passport and cards stay white with black borders.
- Rules inside components (FROM → TO, recommendation divider, passport dividers) stay, inset inside the card padding.

## Components
- Boarding pass card (`components/boarding-pass.html` and `.css`): used on the homepage under "Featured Work". Solid 2px black border, square corners, 36px padding. Desktop: two columns. Left column, top to bottom: case study title (28px, medium), FROM ✈ TO on one line (TO right-aligned; rule above and dashed rule below, both inset inside the padding), then the CTA sentence (17px). Right column: image in a fixed 4:3 frame. Mobile: one column: title, FROM ✈ TO, CTA sentence, image. Do not add labels such as "Boarding pass" or case study numbers, and do not add a separate CTA button.
  - Ticket cues: a route-color trim band across the top inside the black border (12px desktop, 10px mobile; no text in it), a different color per card. Open half-circle notches cut into the edges like a tear-off stub (each one paints over the border, so no line closes the curve): top and bottom edges at the middle of the column gap on desktop (32px), left and right edges just above the image on mobile (24px). No perforation line: it competed with the dashed route line and split the image off. Notches are decorative (aria-hidden).
  - CTA sentence: a descriptive sentence (e.g. "Explore how an analytics portal helps build efficiency for benefits administrators") ending in →, which stays on the same line as the last word. It is the card's only link, so link text is unique per card (WCAG 2.4.4).
  - With a case study URL: the sentence is indigo and underlined, and the link is stretched over the whole card so the whole card is clickable. Hover/focus: underline thickens to 2px, the plane flies straight (level, no arc or trail) from FROM to TO and stays there, the arrow nudges right. The border stays black (no colored border, no lift or shadow). Keyboard focus adds an indigo outline around the card. Reduced motion: no flight or nudge.
  - Without a URL yet: the sentence is muted grey and not a link. Every featured card should have its case study page before launch.
  - Plane icon: Material Icons "flight" (Apache 2.0), rotated to point right, in ink. Used between FROM and TO on the boarding pass and the passport. Not an emoji.
- Passport (`components/passport.html` and `.css`): the homepage hero, styled as a passport data page. Indigo header bar with a four-color route stripe below it, 2px black border, square corners.
  - Security print: a faint guilloche pattern (thin concentric circles at about 4% ink) behind the whole page. Keep it faint so text keeps full contrast.
  - Data fields: small uppercase labels (NAME, PROFESSION, EXPERIENCE, FOCUS) above the values, next to the photo.
  - Impact: the first field under FROM → TO. Big bold number (+56%, +4.9 pts, 35M, 4) followed by a short plain description; no category tags. Desktop: two columns (2 x 2), each number column only as wide as its widest number, 20px to the text, no dividers inside. Phones: one column with thin rules between rows. "pts" is read to screen readers as "percentage points".
  - Interests are six entry stamps, each in its own ink, tilted a few degrees, each with one detail of its own: framed with a plane (Mentorship), round seal with curved text (SXSW), dashed with stars (Solo travel), perforated postage edge with a monochrome Swiss flag (Swatch), two-ring oval with curved text (Piano), puzzle piece (Jigsaw). Stamps are real text in a list; seals and ovals are SVG with a screen-reader label. Wide screens: one row. Tablets: two rows of three. Phones: three rows of two. Each stamp opens a stamp postcard.
  - Machine-readable lines: two 44-character lines at the foot of the page, full width (font up to 30px, then letter-spacing fills the rest). Decorative, hidden from screen readers.
- Stamp postcard (`components/stamp-postcards.css` and `.js`, content in `content/stamps.json`): one shared popover for every passport stamp. Hover eases the stamp straight with no bounce; click, tap or Enter opens the postcard over a dark overlay. Shared shell: colored frame, stamp, postmark, arrows, count, optional link and close button.
  - Picture variant (Solo travel, SXSW, Swatch, Piano, Jigsaw): uncropped photo or video on the left, handwritten note and label on the right. A playing video fills the card.
  - Letter variant (Mentorship): handwritten mentee quote on the left, "From" details on the right.
- Strengths row: three columns, each with a top rule and no numbers.
- From → To hero: below the intro, one rule above it, values cycle through pairs in `content/hero.json`. No CTA.
- Recommendation card (`components/recommendation.html` and `.css`): structure follows the cards on the current Squarespace site, visuals follow this system. Solid 2px black border, square corners, 32px padding. Quote (17px) on top, then a 1px black divider inside the padding, then a round 48px headshot (initials on grey if no photo) with name (bold) and title (muted). Two columns on desktop, one on mobile.
- Section heading: medium weight, 40px on desktop, no top rule.
- Case study page (`templates/case-study.html`, `components/case-study.css`, content in `content/case-study-pages/`): the Swiss index template.
  - POV: color is the ticket, white is the work. The header takes that project's boarding pass color; the reading area stays a quiet mist tint, with images and cards on white. Do not color-block individual reading sections.
  - Header: a white ticket on the route color with no trim band (the background already carries the color). Main area: title, FROM ✈ TO, summary. Stub: Role, Team and Timeline as small print, with open notches at the tear line. Full-width cover image below. Phones: stub drops below and notches move to the side edges.
  - Sections: a narrow 176px rail holds the section name as a small tracked label (12px, indigo). Everything else shares one wide column with a single left edge. Hairlines separate sections.
  - Type steps: label, then 40px subheading, then body. All body copy is one size (18px desktop, 17px phone); do not enlarge opening paragraphs.
  - Blocks: text, subhead, list, image, gallery (two images side by side), video, cards and compare. Images and video sit on a white plate at full column width; tall photos use the portrait option (up to 640px high). Cards have the route trim and a line icon, no emoji; 2 or 4 cards use two columns, 3 use three.
  - Case study pages run wider than the homepage (max 1360px) so screenshots stay legible.
- Footer bar: slim full-width indigo (#1A1466) band at the bottom, white text. Minimal: 20px vertical padding, one line (15px, regular weight), then email and LinkedIn icons at 24 x 24, with 24 x 24 tap targets spaced 16px apart (meets WCAG 2.5.8), each with a readable name. Icon hover turns yellow; keyboard focus shows a white outline. Icons sit right after the line (not pushed to the far edge). Mobile: still one row, 13px text. Replaces the old large closing section and button.

## Tone
- Direct, confident, plain. Short sentences. No hype words.
- Warm where it counts: the values (FROM ambiguity TO clarity) carry the personality.

## Capitalization
- Page titles, section headings and case study card titles use initial caps (title case): capitalize every major word, e.g. "Recommendations from Senior Leaders", "Leave of Absence Request".
- Keep these lowercase unless they are the first or last word: articles (a, an, the), short conjunctions (and, but, or, nor), and short prepositions (at, by, for, from, in, of, on, to, with).
- Always capitalize nouns, verbs, adjectives, adverbs and pronouns (including "My", "Your", "Is").
- Not covered: body text, CTA sentences and the footer line stay in sentence case; small labels (FROM, TO, field labels, stamps) stay uppercase.
