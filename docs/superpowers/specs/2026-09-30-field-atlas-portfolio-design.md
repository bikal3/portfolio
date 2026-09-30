# Field Atlas — portfolio redesign

**Date:** 2026-09-30
**Branch:** `redesign/field-atlas`
**Status:** approved design, not yet implemented

## Goal

Rebuild bikal3.com.np for an academic reader. The current site is shaped like an
industry portfolio: a skills grid, projects as product cards, no publications.
The people who matter now are PhD supervisors, grant reviewers and research
collaborators, and they judge on evidence, method and validation.

The redesign keeps the content but changes what the page *presents itself as*:
from a portfolio of things built to a record of studies conducted.

## Audience and success criteria

Primary reader: an academic assessing whether this person can do research.

The page succeeds when that reader can, without scrolling past the first screen
and a half, answer:

1. What does this person study?
2. Have they published?
3. Is the work validated against anything real?

Secondary readers (students, prospective employers) are not designed for. Where
their needs conflict, the academic reader wins.

## Direction

Merge of two explored directions:

- **Research atlas** — the page carries map-sheet conventions: a graticule,
  coordinate ticks, and every study reduced to a record of region, sensor,
  period and validation.
- **Field notebook** — entries are dated and chronological, each with a figure
  and caption, so the page reads as ongoing work rather than a finished CV.

The merge: **dated entries carrying instrument-grade records.** Chronology and
figures come from the notebook, metadata discipline from the atlas.

Both palettes ship, driven by one token set, exactly as the current site does.

## Information architecture

Single page. Static export. Existing GitHub Pages deploy is unchanged.

### Layout shell

The two-column shell is kept: a sticky sidebar holding the photo, name, contact
and section nav, and a single content column beside it. The mobile drawer
behaviour is unchanged.

The content column's width is set once on the page wrapper, as it is now, and
no block inside carries its own width cap. The wrapper is 51rem, measured
rather than estimated: a 528px content box rendering real prose at 16px gives
a **mean of 76.2 characters per line** (range 72-81, across 16 rendered lines).

The 45-75 target applies to the mean, not to the longest line. Ragged-right
text always throws individual lines above the average, and the maximum stays
near 79-81 at any width in this range, so treating the ceiling as a hard cap on
every line would chase a number that cannot be reached. 76.2 is accepted.

For reference if it is ever revisited: 53rem measures 79.3, and extrapolating
the measured slope of ~0.1 characters per pixel puts 50rem near 74.6. Raising
the body size from 12-14px to 16px does most of the work; the column then
narrows slightly rather than widening. The
desktop theme toggle's wrapper must track the wrapper width, since it aligns to
the content's right edge.

Section 1 below is the masthead *inside* the content column. The name appearing
both there and in the sidebar is intended: the sidebar is a nav landmark, and
the masthead is the document's own heading.

| # | Section | Content | Notes |
|---|---------|---------|-------|
| 1 | Header | Name, role, affiliation, coordinate ticks | No photo at the top; the sidebar keeps it |
| 2 | Research statement | 2–3 paragraphs | Cut down from the current four-paragraph About |
| 3 | Publications | Papers and preprints | Renders nothing while the data file is empty |
| 4 | Thesis | MS GIScience thesis | Same self-hiding behaviour |
| 5 | Studies | The 8 projects as dated entries, grouped by year | Replaces the current Projects section |
| 6 | Teaching | Senior Lecturer role, 11-module series, PyTorch labs | Promoted out of Experience |
| 7 | Education | Degrees | Unchanged content |
| 8 | Contact | Email, GitHub, LinkedIn, CV | Unchanged content |

The standalone Skills grid is removed. Tools move into each study's record,
where an academic reader can see what a tool was used *for*. The skills the
reader cares about are evidenced by the studies, not asserted by a badge wall.

Nav order follows DOM order, as it does today, so scroll-spy stays honest.

## Visual system

### Tokens

One set of custom properties using `light-dark()`, as in the current
`globals.css`. No duplicated palette per theme, no `.dark` selector. The
existing `ThemeToggle` and its pre-paint inline script carry over untouched.

### Typography

Inter is dropped. Two families, both from `next/font/google`:

- **Newsreader** — prose, headings, study titles. A serif reads as scholarly
  and separates this page from every generic developer portfolio.
- **IBM Plex Mono** — records, dates, coordinate ticks, section labels. Carries
  the instrument character and aligns numeric columns.

Body prose sits at 16px, not the current 12–14px: an academic reader reads
rather than skims. The column measure holds at roughly 70 characters, which
means the content column widens to suit the larger type.

### Graticule

A CSS gradient grid at very low contrast, from the token set so it adapts to
both palettes. Two constraints: it never sits behind body text where it would
cost contrast, and it is painted as a `background-image` on an element that
already exists. No extra DOM node, so there is nothing for assistive technology
to encounter and no `aria-hidden` to maintain.

### Accent

A cartographic ink blue, carried forward from the current accent so the site
stays recognisably the same person's.

## Components and data

New:

- `StudyEntry` — one dated project: date, title, figure, record, description, links.
- `RecordTable` — label/value rows in mono. Used by `StudyEntry`.
- `PublicationList` — renders a list, or nothing at all when given an empty array.

Reused unchanged: `ThemeToggle`, `Footer`, `BackToTop`, `SectionLabel`, and
`Navbar` adapted for the new section list.

Data:

- `data/portfolio.ts` — each project gains `region`, `sensors`, `period` and
  `validation`. `date` already exists and already drives the newest-first sort.
- `data/publications.ts` — new. Ships as an empty array with a documented entry
  shape and a comment explaining the self-hiding behaviour.
- `data/profile.ts` — unchanged, already the single source for contact details.

### Publications: self-hiding by design

`publications.ts` exports an empty array on delivery. `PublicationList` returns
`null` for an empty list, and the Publications and Thesis sections are not
rendered at all in that state — no empty heading, no "coming soon".

This is deliberate: publication metadata is the one thing on an academic page
that must never be invented. The section appears the moment real entries are
pasted in, and the layout is built and styled ready for them.

## Figures

Each study carries a small figure. Source: a screenshot of that project's live
site. All eight projects have working demos.

Generation is a one-off `npx playwright` script run manually and committed as
WebP. Playwright is **not** added to `package.json` — the site has no runtime or
build need for it, and adding a browser dependency to a static portfolio for an
asset generated once would be dead weight.

If figure generation is skipped, `StudyEntry` renders without the figure column
and the layout still holds. The figure is an enhancement, not a requirement.

## Quality bar carried over

Everything won in the 2026-09 audit stays, and the redesign is not complete if
any of it regresses:

- One column measure; no per-block width caps fighting their containers
- A single `:focus-visible` ring across the site
- Skip link, with `<main>` opting out of the ring
- Tap targets at 24px minimum
- `prefers-reduced-motion` honoured
- Mobile drawer: `aria-expanded`, Escape, focus return, scroll lock, `inert` background
- Heading outline with exactly one `h1` and no skipped levels
- `Person` JSON-LD, canonical, OG card at its real dimensions
- `.nojekyll`, CNAME, and the existing deploy workflow untouched

## Out of scope

No CMS. No blog. No search. No talks or posters section. No scroll-triggered
animation and no load reveal: the page renders in its final state. No changes
to the deploy pipeline.

## Branch and deploy strategy

Work happens on `redesign/field-atlas`. The deploy workflow triggers only on
push to `main`, so the branch is safe to push and review without touching the
live site. `main` is not merged into until the redesign is reviewed in a
browser and explicitly approved.

## Open items

1. **Publication and thesis entries** — content only Bikal can supply. The
   sections are built and hidden until then. Not a blocker for implementation.
2. **Per-study record values** — `region`, `sensors`, `period` and `validation`
   will be drafted from each project's README and live site, then need Bikal's
   confirmation before merge. Anything not verifiable from a source is left
   blank rather than guessed.
