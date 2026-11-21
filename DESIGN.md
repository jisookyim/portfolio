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
- Rules: 1–2px black lines to separate sections, used as structure.

## Components
- Boarding pass card (`components/boarding-pass.html` and `.css`): used on the homepage only. Solid 2px black border, 36px padding. Desktop: two columns. Left column, top to bottom: case study title (40px, bold), FROM → TO on one line (black ink, rule above and dashed rule below), short blurb (17px, muted), red CTA button at the bottom. Right column: image in a fixed 4:3 frame. Mobile: one column, in this order: title, FROM → TO, blurb, image, CTA. Do not add labels such as "Boarding pass" or case study numbers.
- Strengths row: three columns, each with a top rule and no numbers.
- From → To hero: below the intro, one rule above it, values cycle through pairs in `content/hero.json`. No CTA.
- Testimonial block: large type, name and title in muted text.
- Section heading: bold, with a top rule.
- Closing call to action: large heading and one button.

## Tone
- Direct, confident, plain. Short sentences. No hype words.
- Warm where it counts: the values (FROM ambiguity TO clarity) carry the personality.
