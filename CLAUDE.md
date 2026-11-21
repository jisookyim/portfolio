# Project instructions for Claude

This repository holds the portfolio website for Ji-Sook Yim (Product & UX Design).

## Before any change
- Read `DESIGN.md` for the visual rules. Do not invent colors, fonts, or spacing that are not in it.
- Read `content/` for the words on each page. Keep the wording unless Ji-Sook asks for a change.

## Structure
- `content/` holds the text for each page, as plain Markdown.
- `DESIGN.md` holds the visual system: colors, type, spacing, components, and tone.
- Site pages and shared styles will be added here as the site is built.

## Components (required)
- Every case study header is the boarding pass component: `components/boarding-pass.html` (markup) and `components/boarding-pass.css` (styles). Do not write a new header or restyle it on one page.
- Case study pages are generated. To add or change one, edit or add a file in `content/case-studies/` (JSON), then run `node scripts/build-case-studies.mjs`. Do not hand-edit files in `case-studies/`.
- To change the boarding pass for all case studies, edit the component files, then rebuild.
- Homepage case study cards use the project card component described in `DESIGN.md`. Link each card to its generated page in `case-studies/`.

## Rules
- Reuse shared components and styles instead of one-off styling.
- Keep the homepage and case study pages built from the same components.
- Make small, focused commits with clear messages.
- Ask before deleting content or changing the site's navigation.
