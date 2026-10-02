# Bikal Shrestha - Portfolio

Single-page academic portfolio: a record of studies rather than a product
showcase. Built with Next.js 16, Tailwind CSS v4 and TypeScript, exported as
static files.

**Live:** [bikal3.com.np](https://bikal3.com.np)

## Stack

- **Framework:** Next.js 16 (App Router, `output: 'export'`)
- **Styling:** Tailwind CSS v4, themed with native CSS `light-dark()`
- **Type:** Newsreader (prose) and IBM Plex Mono (records, dates, labels)
- **Language:** TypeScript
- **Deployment:** GitHub Pages + Cloudflare DNS, on push to `main`

## Development

```bash
npm install
npm run dev                       # http://localhost:3000
npm run lint && npx tsc --noEmit  # static checks
npm run build                     # static export into out/
npm run verify                    # assert the quality bar against out/
```

`npm run verify` is the regression net: 16 assertions parsed out of the built
page and stylesheet, covering things that are easy to break by accident and
invisible in review.

- **Headings:** exactly one `h1`, it comes first, no skipped levels
- **Focus:** a global `:focus-visible` ring, with `main` opting out of it
- **Links:** no nested anchors, skip link present, every `target="_blank"`
  carries `rel="noopener"`
- **Layout:** one desktop column width, no per-block measure caps, `body` keeps
  its background colour, the page wrapper stays opaque
- **Motion:** `prefers-reduced-motion` honoured
- **Metadata:** canonical, `Person` JSON-LD, OG image dimensions

Run it after `npm run build`: it reads `out/`, not the source. It is a net, not
a formality, so when a check fails, fix the page rather than the check.

## Page structure

Sections in DOM order, which is also nav order so scroll-spy stays honest:

| Section | Source |
|---------|--------|
| Masthead | `components/sections/Masthead.tsx` |
| Research statement | `components/sections/ResearchStatement.tsx` |
| Publications, Thesis | `components/sections/Publications.tsx` |
| Studies | `components/sections/Studies.tsx` |
| Teaching | `components/sections/Teaching.tsx` |
| Experience | `components/sections/PriorExperience.tsx` |
| Education | `components/sections/Education.tsx` |
| Contact | `components/sections/Contact.tsx` |

| Path | Contents |
|------|----------|
| `app/` | Root layout, page, global styles, OG card, 404 |
| `components/sections/` | The sections above |
| `components/ui/` | `RecordTable`, `SectionLabel`, icons |
| `data/portfolio.ts` | Studies, teaching, prior experience, education |
| `data/publications.ts` | Papers and thesis (ships empty, see below) |
| `data/profile.ts` | Email, GitHub, LinkedIn, CV path - the only copy |
| `data/figures/` | One screenshot per study, WebP |
| `docs/superpowers/` | Design spec and implementation plan |
| `scripts/verify.mjs` | The quality-bar checks |
| `scripts/capture-figures.mjs` | One-off figure capture, not a dependency |
| `public/` | CV and `CNAME` |

## Editing content

Everything readable on the page comes from `data/`. No component needs touching
to add or change content.

**A study** is one entry in `PROJECTS` in `data/portfolio.ts`. The array is
exported sorted newest-first by `date` and grouped by year at render time, so
position in the file does not matter. Each study carries an optional map-sheet
record: `region`, `sensors`, `period`, `validation`. Any field left undefined is
omitted from the table rather than rendered blank, which is deliberate: an
academic reader reads a blank field as a gap in the work, so only state what a
source actually supports.

**Publications and the thesis hide themselves.** `data/publications.ts` exports
an empty `papers` array and a null `thesis`, and both sections return `null` in
that state: no heading, no "coming soon". The layout is built and styled, and
appears the moment real entries are pasted in. This is on purpose, because
publication metadata is the one thing on an academic page that must never be
invented.

**Figures** are screenshots of each study's live site, captured once by
`scripts/capture-figures.mjs` and committed as WebP. Playwright is deliberately
not in `package.json`: nothing at build or runtime needs a browser. The exact
invocation is in that script's header comment, and it sets `NODE_PATH`, because
ESM resolution ignores it.

Figures are decorative (`alt=""`) and optional, so a study without one still
renders correctly.

## Notes for anyone changing this

- **There is no `robots.ts`, on purpose.** An absent `robots.txt` lets
  Cloudflare's AI-crawler blocklist apply. Adding one that allows everything
  would override it.
- **The column width is set once**, on the page wrapper in `app/layout.tsx`, and
  no block inside carries its own cap. The desktop theme-toggle wrapper must
  carry the same value, since it aligns to the content's right edge; `verify`
  fails if the two disagree.
- **The graticule is painted on `body`** and the page wrapper's opaque
  background is what keeps it out from under text, where it measured below the
  WCAG AA contrast floor. `bg-bg` on that wrapper is load-bearing.
- **The social card** is `app/opengraph-image.png` (1200x630) with alt text
  alongside it. Next reads the file's real dimensions, so the `og:image:width`
  and `height` tags cannot drift from the image.
- `docs/superpowers/specs/` records why the layout is the way it is, including
  measurements. Worth reading before changing the type or the column.

## Contact

- Email: bikal3.bs@gmail.com
- GitHub: [github.com/bikal3](https://github.com/bikal3)
- LinkedIn: [linkedin.com/in/shresthabikal](https://linkedin.com/in/shresthabikal/)
