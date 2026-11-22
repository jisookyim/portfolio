# Project instructions for Claude

This repository holds the portfolio website for Ji-Sook Yim (Product & UX Design).

## Before any change
- Read `DESIGN.md` for the visual rules. Do not invent colors, fonts, or spacing that are not in it.
- Read `content/` for the words on each page. Keep the wording unless Ji-Sook asks for a change.

## Structure
- `templates/index.html`: homepage layout (editable source).
- `index.html`: generated homepage. Do not hand-edit.
- `components/`: reusable pieces. `boarding-pass.html` and `.css` are the case study cards; `site.css` is the shared base styling.
- `content/case-studies/`: one JSON file per case study (title, from, to, image, CTA).
- `content/recommendations/`: one JSON file per recommendation (quote, name, title, optional photo). Filename prefix (01-, 02-) sets the order.
- `components/recommendation.html` and `.css`: the recommendation card, shared by every recommendation.
- `content/homepage.md`: homepage text.
- `scripts/build-site.mjs`: builds `index.html` from the template and the case study files.
- `DESIGN.md`: the visual system.

## Components (required)
- Boarding pass cards appear on the homepage only. They are built from `components/boarding-pass.html` and `.css`. Do not write a new card or restyle it on one page.
- To add or change a homepage card, edit or add a file in `content/case-studies/`, then run `node scripts/build-site.mjs`.
- To change how every card looks, edit `components/boarding-pass.css` or `.html`, then rebuild.
- To add or change a recommendation, edit or add a file in `content/recommendations/`, then rebuild. To change how every recommendation card looks, edit `components/recommendation.css` or `.html`. Without a photo, the card shows the person's initials.
- To change the homepage layout, edit `templates/index.html`, then rebuild.
- Case study pages are not designed yet. Do not create them or assume a layout for them until Ji-Sook decides.

## Rules
- Reuse shared components and styles instead of one-off styling.
- Make small, focused commits with clear messages.
- Ask before deleting content or changing the site's navigation.
