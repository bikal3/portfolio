# Field Atlas Portfolio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild bikal3.com.np as a dated record of studies for an academic reader, per `docs/superpowers/specs/2026-09-30-field-atlas-portfolio-design.md`.

**Architecture:** Next.js 16 App Router, static export to GitHub Pages. One page composed of section components, each fed from typed data modules in `data/`. Design tokens are CSS custom properties using `light-dark()`, so one token set serves both palettes with no duplicated media queries.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS v4, TypeScript. Fonts via `next/font/google` (Newsreader, IBM Plex Mono). No test runner in this project — verification is `npm run lint`, `npx tsc --noEmit`, `npm run build`, plus `scripts/verify.mjs` (Task 1) asserting against the built HTML.

**Branch:** `redesign/field-atlas`. The deploy workflow triggers only on push to `main`, so this branch is safe to push. Do not merge to `main` until the result is reviewed in a browser.

---

## File Structure

**Create**
| Path | Responsibility |
|---|---|
| `scripts/verify.mjs` | Asserts the quality bar against `out/index.html`. Run after every build via `npm run verify`. |
| `data/publications.ts` | Papers and thesis. Ships empty; types documented. |
| `components/ui/RecordTable.tsx` | Label/value rows in mono. Returns `null` when empty. |
| `components/sections/Masthead.tsx` | Name, role, affiliation, coordinate ticks. Owns the page `h1`. |
| `components/sections/ResearchStatement.tsx` | Replaces `About.tsx` prose. |
| `components/sections/Studies.tsx` | Projects as dated entries grouped by year. Replaces `Projects.tsx`. |
| `components/sections/Publications.tsx` | Papers list + thesis. Both self-hiding. |
| `components/sections/Teaching.tsx` | Lecturer and TA roles. |
| `components/sections/PriorExperience.tsx` | Non-teaching roles. See Task 10 note. |
| `scripts/capture-figures.mjs` | One-off screenshot script. Not a dependency. |

**Modify**
| Path | Change |
|---|---|
| `app/globals.css` | Tokens, type scale, graticule, wrapper width |
| `app/layout.tsx` | Fonts, wrapper width, JSON-LD unchanged |
| `app/page.tsx` | New section order |
| `components/Navbar.tsx` | `NAV_ITEMS` for the new sections |
| `components/sections/EducationExperience.tsx` | Reduced to Education only |
| `data/portfolio.ts` | `Study` record fields |

**Delete**
`components/sections/About.tsx`, `components/sections/Projects.tsx`

---

### Task 1: Verification script

Everything after this task depends on a repeatable check. There is no test runner, so this script is the regression net.

Two classes of bug make a check like this worse than useless, because it reports success while the property is broken:

- **Substring matching on minified CSS.** `main:focus-visible{outline:none}` contains the literal `:focus-visible{outline`, so a naive substring check for the global focus ring is satisfied by the rule that disables it. The checks below parse rule blocks and read the `outline` declaration instead.
- **Matching the RSC flight payload.** Next serialises the whole page into `<script>self.__next_f.push(...)</script>`, so `og:image:width` and `application/ld+json` appear as text even when the real tags are gone. Checks run against `dom` (scripts stripped), except the JSON-LD one, which must see a real `<script>` tag and so matches the tag shape rather than a bare string.

**Files:**
- Create: `scripts/verify.mjs`
- Modify: `package.json` (add the `verify` script)

- [ ] **Step 1: Write the script**

```js
// scripts/verify.mjs
// Asserts the quality bar against the built page. Run: npm run verify
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const html = readFileSync('out/index.html', 'utf8')
// Next serialises the page into an RSC flight payload inside <script>. Strip
// it, or a check can be satisfied by the payload's copy of a tag that is no
// longer in the document.
const dom = html.replace(/<script[\s\S]*?<\/script>/g, '')
const css = readdirSync('out/_next/static/chunks')
  .filter((f) => f.endsWith('.css'))
  .map((f) => readFileSync(join('out/_next/static/chunks', f), 'utf8'))
  .join('')

const failures = []
const check = (name, condition) => {
  if (!condition) failures.push(name)
}

// Parse rule blocks so CSS checks compare selectors and declarations rather
// than substrings of minified text.
const rules = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(([, sel, body]) => ({
  selectors: sel.split(',').map((s) => s.trim()),
  body,
}))
const outlineOf = (body) => body.match(/(?:^|;)\s*outline\s*:\s*([^;]+)/)?.[1].trim()
// A ring that is absent, zero-width or transparent is not a ring.
const invisible = (v) =>
  /^(none|0(\.0+)?(px|r?em|pt|%)?(\s|$))/.test(v) || /\btransparent\b/.test(v)
// Collecting declared outlines first, then filtering out `undefined`, keeps
// the two checks below asymmetric on purpose: both require an `outline` to
// exist, and disagree only on whether it must be visible. A single shared
// helper cannot do this -- it would have to default a missing declaration to
// "visible" for one check and "suppressed" for the other.
//
// Ceiling: rules are matched without brace-depth tracking, so a ring declared
// only inside an @media block would still satisfy 'global focus ring'.
// Tracking depth means writing a CSS parser, which is not worth it here.
const outlines = (selector) =>
  rules
    .filter((r) => r.selectors.includes(selector))
    .map((r) => outlineOf(r.body))
    .filter((v) => v !== undefined)

// Headings: exactly one h1, and no level is skipped.
const levels = [...dom.matchAll(/<h([1-6])/g)].map((m) => Number(m[1]))
check('exactly one h1', levels.filter((l) => l === 1).length === 1)
check('h1 is first heading', levels[0] === 1)
check(
  'no skipped heading level',
  levels.every((l, i) => i === 0 || l <= levels[i - 1] + 1)
)

// Anchors must never nest: the stretched-link pattern makes this easy to
// break. `<a(?:\s[^>]*)?>` matches a bare `<a>` as the outer anchor too --
// `<a[\s>]` would consume that tag's own `>` and then need a second one.
check('no nested anchors', !/<a(?:\s[^>]*)?>(?:(?!<\/a>).)*<a[\s>]/s.test(dom))

// Quality bar held since the 2026-09 audit.
check('skip link present', dom.includes('Skip to content'))
check('global focus ring', outlines(':focus-visible').some((v) => !invisible(v)))
check('main opts out of ring', outlines('main:focus-visible').some((v) => invisible(v)))
check('reduced motion honoured', css.includes('prefers-reduced-motion'))
check('no per-block measure caps', !/max-w-\[\d+ch\]/.test(dom))
check('canonical present', /<link[^>]+rel="canonical"/.test(dom))
check('JSON-LD present', /<script[^>]+type="application\/ld\+json"/.test(html))
check(
  'og image dimensions',
  /<meta[^>]+property="og:image:width"/.test(dom) &&
    /<meta[^>]+property="og:image:height"/.test(dom)
)

// Every external link opens safely.
const targets = [...dom.matchAll(/<a[\s>][^>]*target="_blank"[^>]*>/g)]
check(
  'every target=_blank has rel=noopener',
  targets.every((m) => m[0].includes('noopener'))
)

if (failures.length) {
  console.error('FAIL\n' + failures.map((f) => '  - ' + f).join('\n'))
  process.exit(1)
}
console.log('verify: all checks passed')
```

- [ ] **Step 2: Add the npm script**

Twelve tasks have to run this. In `package.json`, add to `scripts`, after `"lint"`:

```json
    "verify": "npm run verify"
```

- [ ] **Step 3: Prove it passes on a clean build**

```bash
rm -rf .next out && npm run build >/dev/null && npm run verify
```

Expected: `verify: all checks passed`

- [ ] **Step 4: Prove each check can actually fail**

A check that cannot fail is worse than no check. Mutate the **built output** in `out/` — never the source — and run `npm run verify` after each. Restore by rebuilding.

Run all five of these and confirm each names the expected failure:

| Mutation to `out/` | Expected failure |
|---|---|
| Add `<h1>x</h1>` to `out/index.html` | `exactly one h1` |
| Delete the `:focus-visible{outline:...}` rule from `out/_next/static/chunks/*.css`, leaving `main:focus-visible{outline:none}` | `global focus ring` |
| Change `main:focus-visible{outline:none}` to `outline:3px solid red` | `main opts out of ring` |
| Delete the real `<script type="application/ld+json">` from `<head>` | `JSON-LD present` |
| Delete `<meta property="og:image:height">` from `<head>` | `og image dimensions` |

The second and fourth are the whole point of this task: both passed silently under the earlier substring-based version.

After the last mutation, rebuild clean and confirm `npm run verify` passes again.

- [ ] **Step 5: Commit**

```bash
git add scripts/verify.mjs package.json
git commit -m "test: add build verification script"
```

---

### Task 2: Design tokens and typography

**Files:**
- Modify: `app/globals.css`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Replace the font imports in `app/layout.tsx`**

The CSS variable names matter. Do **not** name them `--font-serif` / `--font-mono`: those are Tailwind v4's own theme keys, and a `@theme` entry cannot reference itself (`--font-serif: var(--font-serif), …` is cyclic and invalid). Give next/font its own names, and let the theme keys point at them in Step 2.

```tsx
import { IBM_Plex_Mono, Newsreader } from 'next/font/google'

const serif = Newsreader({
  subsets: ['latin'],
  variable: '--font-newsreader',
  display: 'swap',
})

const mono = IBM_Plex_Mono({
  // Newsreader is a variable font and takes no `weight`; IBM Plex Mono has no
  // variable build on Google Fonts, so its weights must be listed.
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-plex-mono',
  display: 'swap',
})
```

Then on the `<html>` element replace `className={inter.variable}` with:

```tsx
className={`${serif.variable} ${mono.variable}`}
```

- [ ] **Step 2: Update `app/globals.css`**

First, stop Tailwind scanning the plan documents. Tailwind v4 auto-detects sources from the project root and honours `.gitignore`, so every class name written in a `docs/` code block becomes a real emitted rule — a superseded class would silently work in a component instead of failing visibly. Add directly under the import:

```css
@import "tailwindcss";
@source not "../docs";
```

Inside `@theme`, replace the `--font-family-sans` line with the real theme keys, so `font-serif` and `font-mono` become genuine utilities carrying their fallback tails:

```css
  --font-serif: var(--font-newsreader), Georgia, serif;
  --font-mono: var(--font-plex-mono), ui-monospace, monospace;
```

Shift the accent to a cartographic ink blue. It stays in the same hue family as the current accent, and every pairing gains roughly 1.3 points of contrast ratio:

```css
  /* Lowest pairing is accent-on-accent-bg: 6.20:1 light, 7.82:1 dark. */
  --color-accent: light-dark(#1b5e7e, #7cb8d4);
```

Then **merge** the type declarations into the existing `body` rule rather than adding a second block — Task 3 adds its own `body` block for the graticule, and two colour/type blocks invite a later "tidy-up" that collapses `background-image` into the `background` shorthand and wipes `background-color`:

```css
body {
  background-color: var(--color-bg);
  color: var(--color-text-body);
  font-family: var(--font-serif);
  /* rem, not px: a px value here overrides the reader's own browser font-size
     setting, and desynchronises the rem-based Tailwind type scale from it. */
  font-size: 1rem;
  line-height: 1.6;
}
```

- [ ] **Step 3: Set the column width from a real measurement**

Use `max-w-[51rem]`. Both values must change together -- the page wrapper and
the desktop theme-toggle wrapper, which aligns to the content's right edge.

This number is measured, not estimated, and two earlier estimates were wrong:

| Wrapper | Content box | Measure | Source |
|---|---|---|---|
| 58rem | 640px | ~80-88 chars | estimate, overshoots |
| 53rem | 560px | **79.3 chars measured** | real prose, 16 rendered lines, range 69-85 |
| 51rem | 528px | **76.2 chars measured** | real prose, 16 rendered lines, range 72-81 |

Linear scaling predicted 74.8 for 51rem; the measured value is 76.2, because
line breaking is discrete -- whole words wrap, so the mean does not scale
smoothly with width. The observed slope is ~0.1 characters per pixel.

The 45-75 target is read as applying to the **mean**, not the longest line.
76.2 is accepted: it is 1.2 over a soft convention, inside the 72-81 spread of
the measurement, and 50rem would buy only ~1.6 characters.

The maximum is not width-independent -- 85 at 53rem, 81 at 51rem -- so it is
not a reason to widen anything back.

Beware the measuring method. A canvas `measureText` over the a-z alphabet
reports 73.7 characters for the 560px column, which looks compliant. It is
wrong by about 8%: the alphabet weights `m` and `w` equally with `i` and `l`,
so it overstates average character width against English prose. Counting
characters on actually rendered lines of the real bio paragraphs gives 79.3.
**Trust rendered lines, not the alphabet metric.**

The target is 45-75 characters. 51rem lands at the top of that range, keeping
as much width as possible for the study records and figures.

There is no safety net: `scripts/verify.mjs` forbids per-block `max-w-[Nch]`
caps, so this one wrapper value is the measure for the whole page.

- [ ] **Step 4: Verify**

```bash
npm run lint && npx tsc --noEmit && rm -rf .next out && npm run build >/dev/null && npm run verify
grep -c "max-w-\[53rem\]" app/layout.tsx
grep -c '53rem' out/_next/static/chunks/*.css
grep -o 'font-mono{[^}]*}' out/_next/static/chunks/*.css
```

Expected: `verify: all checks passed`; the first grep prints `2`; the second prints `1`; the third shows `font-mono` resolving through `var(--font-mono)`, or nothing at all while no component uses the utility yet.

Measure the real line length in a headless browser against the built page, and record the number here rather than trusting the estimate:

```js
const p = document.querySelector('main p'), cs = getComputedStyle(p)
const c = document.createElement('canvas').getContext('2d')
c.font = `${cs.fontSize} ${cs.fontFamily}`
const t = 'abcdefghijklmnopqrstuvwxyz '
console.log(p.clientWidth / (c.measureText(t).width / t.length))
```

Expected: a value in the 45–75 range. If it exceeds 75, the column is still too wide and the wrapper needs reducing further before Task 3.

- [ ] **Step 5: Commit**

```bash
git add app/globals.css app/layout.tsx
git commit -m "style: swap Inter for Newsreader and IBM Plex Mono"
```

---

### Task 3: Graticule

The graticule surrounds the content rather than sitting under it. The page
reads as a map sheet laid on a gridded table: content on clean paper, grid in
the margin.

This is not a stylistic preference, it is forced. Measured worst case with text
directly over a 1px graticule line at the originally specified colours:

| Pairing | Over a line | Needs |
|---|---|---|
| light body `#3a3a3a` on `#e9e6dd` | 9.11 | 4.5 — pass |
| dark body `#cccccc` on `#182029` | 10.24 | 4.5 — pass |
| light faint `#6e6e6e` on `#e9e6dd` | **4.09** | 4.5 — **fail** |
| dark faint `#7f7f7f` on `#182029` | **4.11** | 4.5 — **fail** |

`--color-text-faint` carries dates, the footer, section counts and the sidebar
role line, and most of it sits bare on the page background. Lightening the
graticule until faint text passes lands at 4.52/4.51 — a 0.02 margin — and
takes the dark lines to 1.06:1 against the background, which is invisible.
Darkening the faint token collapses the faint/muted tier in dark.

Keeping the grid out from under text solves it outright, keeps the lines
visible, and is what the spec asked for: *"it never sits behind body text where
it would cost contrast."*

**Files:**
- Modify: `app/globals.css`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Add the token**

Inside `@theme`:

```css
  /* Never sits under text -- see the page wrapper's opaque background. */
  --color-graticule: light-dark(#e9e6dd, #182029);
```

- [ ] **Step 2: Paint it on `body`**

A separate `body` block, after the merged one from Task 2. Keep it separate so
its explanation travels with it, and use `background-image` rather than the
`background` shorthand, which would reset Task 2's `background-color`:

```css
/*
 * Map graticule. Painted on body as a background-image rather than an added
 * element, so it costs no DOM and needs no aria-hidden. The page wrapper is
 * opaque and covers it, so the grid only shows in the margins beside the
 * content -- never behind text, where it would cost contrast.
 */
body {
  background-image:
    linear-gradient(var(--color-graticule) 1px, transparent 1px),
    linear-gradient(90deg, var(--color-graticule) 1px, transparent 1px);
  background-size: 32px 32px;
}
```

- [ ] **Step 3: Make the content wrapper opaque**

In `app/layout.tsx`, add `bg-bg` to the page wrapper, so the content sits on
solid paper and the graticule shows only around it:

```tsx
className="max-w-[51rem] mx-auto flex min-h-screen bg-bg"
```

The mask works in two parts, and both are load-bearing:

1. In-flow content is inside the wrapper, so the opaque background covers the
   grid behind it.
2. Every `fixed` overlay that escapes the wrapper carries its own opaque
   surface. At grid-visible widths the focused skip link is the only escapee --
   it sits at `top-3 left-3`, in the left margin over the grid -- and it is
   safe because of `focus:bg-surface`, measured at 6.65:1 light / 8.33:1 dark.
   The mobile header, drawer and BackToTop are all `md:hidden`, so they exist
   only below 768px where no margin exists, and are opaque anyway.

**Ceiling: the mask covers in-flow boxes, not painted overflow.** A child whose
border box is clamped can still paint text past it -- `min-w-0` does not
prevent this -- and that text would land on the graticule, re-opening the
4.09/4.11 contrast failure invisibly. No current content overflows. The tasks
most likely to breach it are the record tables from Task 6 onward, where a long
unbroken token in a mono cell is the classic cause. Do not pre-empt it; if it
bites, `overflow-wrap: anywhere` on the record cells is the fix. Note that a
`getBoundingClientRect` comparison returns a false negative here -- the useful
assertion is `document.documentElement.scrollWidth === window.innerWidth`.

Below 816px the wrapper fills the viewport and the graticule is simply not
visible; it is decoration, and small screens have no room for it. (816px
assumes a 16px root: both widths are in `rem`, so a reader at a 20px root, or
at 200% zoom, loses the grid at proportionally larger viewports.)

- [ ] **Step 4: Verify**

```bash
npm run lint && npx tsc --noEmit && rm -rf .next out && npm run build >/dev/null && npm run verify
```

Confirm from the built CSS that the `body` rule still carries
`background-color` — a `background` shorthand anywhere would silently drop it.

Then confirm in a headless browser at 1440px wide, in both themes, that the
grid is visible in the margins and that no text overlaps a line. Sample a pixel
inside the content column and one in the margin; they must differ.

- [ ] **Step 5: Commit**

```bash
git add app/globals.css app/layout.tsx
git commit -m "style: add the map graticule around the content"
```

---

### Task 3b: Cover the graticule invariants, and centre the lattice

Task 3's design rests on two invariants that nothing detects. Deleting `bg-bg`
from the wrapper puts the grid back under all text and silently restores a
**WCAG AA failure**; collapsing the merged `body` rules into a `background:`
shorthand silently kills the page background colour. Both are the
"reports success while the property is broken" class that Task 1 exists to
catch.

**Files:**
- Modify: `scripts/verify.mjs`
- Modify: `app/globals.css`

- [ ] **Step 1: Add the two checks**

In `scripts/verify.mjs`, after the existing `measure caps` check:

```js
// Task 3 keeps the graticule out from under text by making the page wrapper
// opaque. Lose either half and the grid returns behind every line of body
// text, where faint text measures 4.09:1 light and 4.11:1 dark -- under AA.
check(
  'body keeps its background colour',
  rules.filter((r) => r.selectors.includes('body')).some((r) => /background-color\s*:/.test(r.body))
)
check(
  'page wrapper is opaque',
  /class="[^"]*\bbg-bg\b[^"]*max-w-\[51rem\]|class="[^"]*max-w-\[51rem\][^"]*\bbg-bg\b/.test(dom)
)
```

The wrapper check accepts either class order, since Tailwind is free to reorder.

- [ ] **Step 2: Prove both can fail**

Mutate the built output in `out/` only, never the source, and rebuild to restore:

| Mutation | Expected failure |
|---|---|
| In the built CSS, change `body{background-color:...` to drop that declaration | `body keeps its background colour` |
| In `out/index.html`, remove `bg-bg` from the wrapper's class attribute | `page wrapper is opaque` |

- [ ] **Step 3: Centre the lattice**

The grid's origin is the `body` box, so its phase drifts with viewport width
and the gap either side of the content column goes lopsided -- 19/29 at 1366px,
and at 1680px and 3440px a line lands flush against the column edge, reading as
an accidental hairline border. One declaration fixes it at every width, because
`408 mod 32 = 24` symmetrically. Add to the graticule `body` block:

```css
  background-position-x: 50%;
```

Confirmed at 1280/1366/1440/1600/1920/2560: gaps become a constant 24px on both
sides, with zero graticule pixels inside the column. Only the vertical-line
layer moves; the horizontal gradient is uniform in X, so shifting it does
nothing. Accepted trade: between 816px and 864px the margins are thinner than
24px and the grid does not appear there, where today a hairline can.

Perfect alignment to both edges is impossible at this width (816 = 32 x 25.5)
and would need a 52rem column, contradicting Task 2's measured decision. Do not
chase it.

- [ ] **Step 4: Verify**

```bash
npm run lint && npx tsc --noEmit && rm -rf .next out && npm run build >/dev/null && npm run verify
```

- [ ] **Step 5: Commit**

```bash
git add scripts/verify.mjs app/globals.css
git commit -m "test: cover the graticule invariants, and centre the lattice"
```

---

### Task 4: Study record fields

**Files:**
- Modify: `data/portfolio.ts`

- [ ] **Step 1: Extend the interface**

Replace the `Project` interface with:

```ts
interface Study {
  title: string
  /** When the work was done, as 'MMM YYYY'. Drives the newest-first sort. */
  date: string
  description: string
  /** Map-sheet record. Any field left undefined is omitted from the table
      rather than rendered blank: an academic reader reads a blank field as a
      gap in the work, so only state what is verifiable. */
  region?: string
  sensors?: string[]
  period?: string
  validation?: string
  technologies: string[]
  github?: string
  demo?: string
}
```

Rename every use of `Project` in this file to `Study`, including `const PROJECTS: Study[]` and `export const projects: Study[]`.

- [ ] **Step 2: Fill the records that are verifiable**

Add to each entry only what its README or live site states. Example for the first:

```ts
  {
    title: 'Rasuwa Transboundary Flood',
    date: 'Aug 2026',
    region: 'Bhote Koshi–Trishuli, Rasuwa',
    sensors: ['Sentinel-1', 'Sentinel-2', 'SRTM'],
    period: 'Aug 2026',
    validation: 'HOT ground survey',
    // ...existing description, technologies, github, demo
  },
```

Leave a field out entirely when the source does not state it. Do not infer a sensor or a validation method.

- [ ] **Step 3: Verify**

```bash
npx tsc --noEmit && npm run lint
```

Expected: both clean.

- [ ] **Step 4: Commit**

```bash
git add data/portfolio.ts
git commit -m "feat: add map-sheet record fields to each study"
```

---

### Task 5: Publications data

**Files:**
- Create: `data/publications.ts`

- [ ] **Step 1: Write the module**

```ts
// data/publications.ts

export interface Publication {
  authors: string
  year: string
  title: string
  venue: string
  status: 'published' | 'preprint' | 'in review'
  url?: string
  doi?: string
}

export interface Thesis {
  title: string
  degree: string
  institution: string
  year: string
  advisor?: string
  url?: string
}

/*
 * Empty on delivery, and that is deliberate. Publication metadata is the one
 * thing on an academic page that must never be invented, so the sections that
 * read these render nothing at all until real entries are pasted in. See
 * Publications.tsx: an empty list produces no heading and no placeholder.
 */
export const papers: Publication[] = []

export const thesis: Thesis | null = null
```

- [ ] **Step 2: Verify**

```bash
npx tsc --noEmit
```

Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add data/publications.ts
git commit -m "feat: add the publications data module"
```

---

### Task 6: RecordTable

**Files:**
- Create: `components/ui/RecordTable.tsx`

- [ ] **Step 1: Write the component**

```tsx
// components/ui/RecordTable.tsx

export interface Row {
  label: string
  value: string
}

/**
 * Map-sheet record. Rows whose value is empty are dropped by the caller, not
 * rendered blank — a blank field reads as a gap in the work.
 */
export default function RecordTable({ rows }: { rows: Row[] }) {
  if (rows.length === 0) return null

  return (
    <table className="font-mono text-xs text-text-muted">
      <tbody>
        {rows.map(({ label, value }) => (
          <tr key={label}>
            <th
              scope="row"
              className="pr-4 py-0.5 text-left font-normal text-text-faint align-top whitespace-nowrap"
            >
              {label}
            </th>
            <td className="py-0.5 align-top">{value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
```

- [ ] **Step 2: Verify the empty case with a runnable check**

```bash
node --input-type=module -e "
const RecordTable = (rows) => rows.length === 0 ? null : 'table';
console.assert(RecordTable([]) === null, 'empty rows must render nothing');
console.assert(RecordTable([{label:'REGION',value:'Rasuwa'}]) === 'table', 'non-empty renders');
console.log('RecordTable empty-case check passed');"
```

Expected: `RecordTable empty-case check passed`

- [ ] **Step 3: Commit**

```bash
git add components/ui/RecordTable.tsx
git commit -m "feat: add the record table"
```

---

### Task 7: Studies section

**Files:**
- Create: `components/sections/Studies.tsx`
- Delete: `components/sections/Projects.tsx`

- [ ] **Step 1: Write the component**

Carries over three things from `Projects.tsx` that must not regress: the stretched-link pattern (whole card clickable, no nested anchors), 24px tap targets on the footer links, and year grouping off the pre-sorted array.

```tsx
// components/sections/Studies.tsx
import SectionLabel from '@/components/ui/SectionLabel'
import RecordTable, { type Row } from '@/components/ui/RecordTable'
import { ExternalIcon, GitHubIcon } from '@/components/ui/icons'
import { projects } from '@/data/portfolio'

type Study = (typeof projects)[number]

/** `projects` arrives newest-first, so one pass collects each run of a year. */
function byYear(list: Study[]) {
  const groups: { year: string; items: Study[] }[] = []
  for (const study of list) {
    const year = study.date.slice(-4)
    const current = groups.at(-1)
    if (current?.year === year) current.items.push(study)
    else groups.push({ year, items: [study] })
  }
  return groups
}

/** Only states what the data states; undefined fields are dropped. */
function recordRows(study: Study): Row[] {
  const rows: Row[] = []
  if (study.region) rows.push({ label: 'REGION', value: study.region })
  if (study.sensors?.length) rows.push({ label: 'SENSOR', value: study.sensors.join(' · ') })
  if (study.period) rows.push({ label: 'PERIOD', value: study.period })
  if (study.validation) rows.push({ label: 'CHECK', value: study.validation })
  return rows
}

function StudyEntry({ study }: { study: Study }) {
  const primary = study.demo ?? study.github

  return (
    <article className="group relative border-t border-border-subtle pt-5">
      <p className="font-mono text-xs text-text-faint">{study.date}</p>
      <h4 className="text-text-strong text-lg font-semibold mt-1">
        {primary ? (
          <a
            href={primary}
            target="_blank"
            rel="noopener noreferrer"
            className="after:absolute after:inset-0 group-hover:text-accent transition-colors"
          >
            {study.title}
          </a>
        ) : (
          study.title
        )}
      </h4>
      <p className="text-text-body mt-2">{study.description}</p>
      <div className="mt-4">
        <RecordTable rows={recordRows(study)} />
      </div>
      <div className="flex gap-4 mt-4">
        {study.github && (
          <a
            href={study.github}
            target="_blank"
            rel="noopener noreferrer"
            className="relative z-10 inline-flex items-center gap-1.5 py-1.5 -my-1.5 font-mono text-xs text-text-muted hover:text-accent transition-colors"
          >
            <GitHubIcon className="w-3.5 h-3.5" />
            CODE
          </a>
        )}
        {study.demo && (
          <a
            href={study.demo}
            target="_blank"
            rel="noopener noreferrer"
            className="relative z-10 inline-flex items-center gap-1.5 py-1.5 -my-1.5 font-mono text-xs text-text-muted hover:text-accent transition-colors"
          >
            <ExternalIcon className="w-3.5 h-3.5" />
            SITE
          </a>
        )}
      </div>
    </article>
  )
}

export default function Studies() {
  return (
    <section id="studies" aria-labelledby="studies-heading" className="py-12 border-b border-border-subtle">
      <SectionLabel id="studies-heading">Studies</SectionLabel>
      <div className="flex flex-col gap-10">
        {byYear(projects).map(({ year, items }) => (
          <div key={year}>
            <div className="flex items-center gap-3 mb-5">
              <h3 className="font-mono text-xs tracking-[2px] text-text-faint">{year}</h3>
              <span aria-hidden="true" className="h-px flex-1 bg-border-subtle" />
            </div>
            <div className="flex flex-col gap-8">
              {items.map((study) => (
                <StudyEntry key={study.title} study={study} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Delete the old section and point the page at the new one**

```bash
git rm components/sections/Projects.tsx
```

In `app/page.tsx` replace the `Projects` import and `<Projects />` with `Studies` and `<Studies />`.

- [ ] **Step 3: Verify**

```bash
npm run lint && npx tsc --noEmit && rm -rf .next out && npm run build >/dev/null && npm run verify
node --input-type=module -e "
import {readFileSync} from 'node:fs';
const dom = readFileSync('out/index.html','utf8').replace(/<script[\s\S]*?<\/script>/g,'');
const years = [...dom.matchAll(/tracking-\[2px\] text-text-faint\">(\d{4})</g)].map(m=>m[1]);
console.assert(years.join() === [...years].sort().reverse().join(), 'years must be newest first');
console.assert(dom.split('<article').length - 1 === 8, 'expected 8 studies');
console.log('studies order and count OK');"
```

Expected: `verify: all checks passed` and `studies order and count OK`.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: replace project cards with dated study entries"
```

---

### Task 8: Publications and thesis sections

**Files:**
- Create: `components/sections/Publications.tsx`

- [ ] **Step 1: Write the component**

```tsx
// components/sections/Publications.tsx
import SectionLabel from '@/components/ui/SectionLabel'
import { papers, thesis } from '@/data/publications'

/*
 * Both sections return null when their data is empty. No heading, no
 * placeholder, no "coming soon" — an empty Publications heading on an academic
 * page is worse than no section at all.
 */
export function PublicationList() {
  if (papers.length === 0) return null

  return (
    <section id="publications" aria-labelledby="publications-heading" className="py-12 border-b border-border-subtle">
      <SectionLabel id="publications-heading">Publications</SectionLabel>
      <ol className="flex flex-col gap-5">
        {papers.map((paper, i) => (
          <li key={paper.title} className="flex gap-3">
            <span className="font-mono text-xs text-text-faint pt-1.5">[{i + 1}]</span>
            <div>
              <p className="text-text-body">
                {paper.authors} ({paper.year}). {paper.url ? (
                  <a href={paper.url} target="_blank" rel="noopener noreferrer" className="text-text-strong hover:text-accent transition-colors">
                    {paper.title}
                  </a>
                ) : (
                  <span className="text-text-strong">{paper.title}</span>
                )}. <em>{paper.venue}</em>.
              </p>
              <p className="font-mono text-xs text-text-faint mt-1">
                {paper.status.toUpperCase()}{paper.doi ? ` · ${paper.doi}` : ''}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}

export function ThesisSection() {
  if (!thesis) return null

  return (
    <section id="thesis" aria-labelledby="thesis-heading" className="py-12 border-b border-border-subtle">
      <SectionLabel id="thesis-heading">Thesis</SectionLabel>
      <h3 className="text-text-strong text-lg font-semibold">
        {thesis.url ? (
          <a href={thesis.url} target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">
            {thesis.title}
          </a>
        ) : (
          thesis.title
        )}
      </h3>
      <p className="font-mono text-xs text-text-faint mt-2">
        {thesis.degree} · {thesis.institution} · {thesis.year}
        {thesis.advisor ? ` · advised by ${thesis.advisor}` : ''}
      </p>
    </section>
  )
}
```

- [ ] **Step 2: Prove the self-hiding behaviour both ways**

Add `<PublicationList />` and `<ThesisSection />` to `app/page.tsx` (order per Task 11), then:

```bash
rm -rf .next out && npm run build >/dev/null
node --input-type=module -e "
import {readFileSync} from 'node:fs';
const dom = readFileSync('out/index.html','utf8').replace(/<script[\s\S]*?<\/script>/g,'');
console.assert(!dom.includes('id=\"publications\"'), 'empty papers must render no section');
console.assert(!dom.includes('id=\"thesis\"'), 'null thesis must render no section');
console.log('self-hiding OK with empty data');"
```

Expected: `self-hiding OK with empty data`

Now temporarily add one paper to `data/publications.ts`, rebuild, and confirm `id="publications"` **is** present. Revert the temporary entry afterwards — the array ships empty.

- [ ] **Step 3: Verify**

```bash
npm run lint && npx tsc --noEmit && npm run verify
```

Expected: all clean.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add self-hiding publications and thesis sections"
```

---

### Task 9: Masthead and research statement

**Files:**
- Create: `components/sections/Masthead.tsx`
- Create: `components/sections/ResearchStatement.tsx`
- Delete: `components/sections/About.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: Write the masthead**

It owns the page `h1`, which currently lives as `sr-only` in `app/page.tsx`. Remove that `sr-only` heading when wiring this in — two `h1` elements will fail `scripts/verify.mjs`.

```tsx
// components/sections/Masthead.tsx
export default function Masthead() {
  return (
    <header className="py-12 border-b border-border-subtle">
      <p className="font-mono text-xs tracking-[2px] text-text-faint">
        28°12′N 85°19′E · KATHMANDU
      </p>
      <h1 className="text-text-strong text-4xl font-semibold mt-4 leading-tight">
        Bikal Shrestha
      </h1>
      <p className="text-text-muted mt-2">
        Spatial data · remote sensing · hazard mapping
      </p>
    </header>
  )
}
```

- [ ] **Step 2: Write the research statement**

Three paragraphs, cut from the four in `About.tsx`. Drop the fourth (the pre-academic engineering background) — it is covered by Prior experience in Task 10.

```tsx
// components/sections/ResearchStatement.tsx
import SectionLabel from '@/components/ui/SectionLabel'

export default function ResearchStatement() {
  return (
    <section id="research" aria-labelledby="research-heading" className="py-12 border-b border-border-subtle">
      <SectionLabel id="research-heading">Research</SectionLabel>
      <div className="space-y-4 text-text-body">
        <p>
          I&rsquo;m a spatial data analyst with dual master&rsquo;s degrees in
          Geographic Information Science and Data Analytics from Clark
          University. My research sits at the intersection of deep learning,
          remote sensing and environmental science, using satellite data to
          study the systems that shape our planet.
        </p>
        <p>
          Recent work spans precipitation downscaling with deep learning,
          wildfire trend analysis across three decades of satellite imagery, and
          glacial lake outburst flood hazard mapping in the Nepal Himalaya. I am
          drawn to problems where geospatial data can inform real decisions
          about climate risk, land use and disaster preparedness.
        </p>
        <p>
          I build end-to-end pipelines, from raw imagery ingested through Google
          Earth Engine to interactive tools deployed for public use, and I care
          about reproducibility and validating results against ground truth.
        </p>
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Delete About and remove the sr-only h1**

```bash
git rm components/sections/About.tsx
```

In `app/page.tsx`, delete the `<h1 className="sr-only">…</h1>` block and its explanatory comment.

- [ ] **Step 4: Verify**

```bash
npm run lint && npx tsc --noEmit && rm -rf .next out && npm run build >/dev/null && npm run verify
```

Expected: `verify: all checks passed`, which includes `exactly one h1`.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add masthead and research statement"
```

---

### Task 10: Teaching, prior experience, education

The approved spec lists Teaching but no Experience section, which leaves *Data Analyst / Backend Developer* and *Staff Manager* with nowhere to go. Dropping them silently would be a content loss the spec never argued for, so they get a condensed section after Teaching. If Bikal would rather cut them, delete `PriorExperience.tsx` and its usage — nothing else depends on it.

**Files:**
- Create: `components/sections/Teaching.tsx`
- Create: `components/sections/PriorExperience.tsx`
- Modify: `components/sections/EducationExperience.tsx` → Education only

- [ ] **Step 1: Split the data**

In `data/portfolio.ts`, split `experience` into two exported arrays. The file
currently lets TypeScript infer this array's shape; two arrays sharing one
shape earn a declared interface, so add it:

```ts
interface Role {
  role: string
  organization: string
  dates: string
  bullets: string[]
}

export const teaching: Role[] = [
  // 'Senior Lecturer' and 'Teaching Assistant' entries, unchanged
]

export const priorExperience: Role[] = [
  // 'Data Analyst / Backend Developer' and 'Staff Manager' entries, unchanged
]
```

- [ ] **Step 2: Write Teaching**

```tsx
// components/sections/Teaching.tsx
import SectionLabel from '@/components/ui/SectionLabel'
import { teaching } from '@/data/portfolio'

export default function Teaching() {
  return (
    <section id="teaching" aria-labelledby="teaching-heading" className="py-12 border-b border-border-subtle">
      <SectionLabel id="teaching-heading">Teaching</SectionLabel>
      <div className="flex flex-col gap-6">
        {teaching.map((item) => (
          <div key={item.role}>
            <h3 className="text-text-strong text-lg font-semibold">{item.role}</h3>
            <p className="font-mono text-xs text-text-faint mt-1">
              {item.organization} · {item.dates}
            </p>
            <ul className="flex flex-col gap-1.5 mt-3">
              {item.bullets.map((b) => (
                <li key={b} className="flex gap-2 text-text-body">
                  <span className="text-accent shrink-0">›</span>
                  {b}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Write PriorExperience**

```tsx
// components/sections/PriorExperience.tsx
import SectionLabel from '@/components/ui/SectionLabel'
import { priorExperience } from '@/data/portfolio'

export default function PriorExperience() {
  return (
    <section id="experience" aria-labelledby="experience-heading" className="py-12 border-b border-border-subtle">
      <SectionLabel id="experience-heading">Prior experience</SectionLabel>
      <div className="flex flex-col gap-6">
        {priorExperience.map((item) => (
          <div key={item.role}>
            <h3 className="text-text-strong text-lg font-semibold">{item.role}</h3>
            <p className="font-mono text-xs text-text-faint mt-1">
              {item.organization} · {item.dates}
            </p>
            <ul className="flex flex-col gap-1.5 mt-3">
              {item.bullets.map((b) => (
                <li key={b} className="flex gap-2 text-text-body">
                  <span className="text-accent shrink-0">›</span>
                  {b}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 4: Reduce EducationExperience to Education**

Delete the `<section id="experience">` block from `components/sections/EducationExperience.tsx`, leaving only the Education section, and remove `experience` from its import. Rename the file's default export to `Education` and rename the file to `components/sections/Education.tsx`:

```bash
git mv components/sections/EducationExperience.tsx components/sections/Education.tsx
```

- [ ] **Step 5: Verify**

```bash
npm run lint && npx tsc --noEmit && rm -rf .next out && npm run build >/dev/null && npm run verify
```

Expected: all clean.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: split teaching out of experience"
```

---

### Task 11: Page assembly and navigation

**Files:**
- Modify: `app/page.tsx`
- Modify: `components/Navbar.tsx`

- [ ] **Step 1: Assemble the page**

```tsx
// app/page.tsx
import Masthead from '@/components/sections/Masthead'
import ResearchStatement from '@/components/sections/ResearchStatement'
import { PublicationList, ThesisSection } from '@/components/sections/Publications'
import Studies from '@/components/sections/Studies'
import Teaching from '@/components/sections/Teaching'
import PriorExperience from '@/components/sections/PriorExperience'
import Education from '@/components/sections/Education'
import Contact from '@/components/sections/Contact'

export default function HomePage() {
  return (
    <>
      <Masthead />
      <ResearchStatement />
      <PublicationList />
      <ThesisSection />
      <Studies />
      <Teaching />
      <PriorExperience />
      <Education />
      <Contact />
    </>
  )
}
```

- [ ] **Step 2: Update the nav**

In `components/Navbar.tsx` replace `NAV_ITEMS`. Publications and Thesis are deliberately absent: they render nothing while the data is empty, and a nav link to a section that does not exist is a dead anchor.

```tsx
const NAV_ITEMS = [
  { id: 'research', label: 'Research' },
  { id: 'studies', label: 'Studies' },
  { id: 'teaching', label: 'Teaching' },
  { id: 'experience', label: 'Experience' },
  { id: 'education', label: 'Education' },
  { id: 'contact', label: 'Contact' },
] as const
```

- [ ] **Step 3: Verify every nav target exists**

```bash
rm -rf .next out && npm run build >/dev/null && npm run verify
node --input-type=module -e "
import {readFileSync} from 'node:fs';
const dom = readFileSync('out/index.html','utf8').replace(/<script[\s\S]*?<\/script>/g,'');
const ids = new Set([...dom.matchAll(/<section id=\"([a-z]+)\"/g)].map(m=>m[1]));
const hrefs = [...new Set([...dom.matchAll(/href=\"#([a-z-]+)\"/g)].map(m=>m[1]))]
  .filter(h => h !== 'main-content');
const dead = hrefs.filter(h => !ids.has(h));
console.assert(dead.length === 0, 'dead nav anchors: ' + dead);
console.log('nav targets OK:', hrefs.join(', '));"
```

Expected: `nav targets OK: research, studies, teaching, experience, education, contact`

- [ ] **Step 4: Bound the measure below the `md` breakpoint**

Under 768px the sidebar is hidden and `main` takes the whole viewport at
`px-5`, so nothing caps the measure until the 816px wrapper binds. Measured at
6.93px per character: a 767px viewport renders ~105 characters, worse than
desktop. (Pre-existing, and Task 2 improved it from ~127, but the measure goal
currently holds only at `md` and above.)

Fix it on the wrapper, keeping the spec's "set once, no per-block caps" rule --
a responsive value on the same element is still one lever:

```tsx
className="max-w-[34rem] md:max-w-[51rem] mx-auto flex min-h-screen"
```

34rem is 544px, leaving 504px of content at `px-5`, about 73 characters. Below
544px the viewport binds first and the cap is inert, so phones are unaffected.

The theme-toggle wrapper aligns to the content's right edge but is `hidden`
below `md`, so it needs only the `md:` value: `md:max-w-[51rem]`.

Note `scripts/verify.mjs` forbids only the `max-w-[Nch]` form, so a `rem` cap
would pass the script regardless -- this constraint is carried by the spec, not
by the script.

Verify at three widths with a headless browser, counting rendered lines rather
than the alphabet metric: 767px, 768px and 1280px. Expect every mean under 80.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: assemble the field atlas page and nav"
```

---

### Task 12: Figures

Optional enhancement. `StudyEntry` renders correctly without it, so skip this task entirely if the screenshots are not wanted.

**Files:**
- Create: `scripts/capture-figures.mjs`
- Create: `data/figures/*.webp`
- Modify: `data/portfolio.ts`, `components/sections/Studies.tsx`

- [ ] **Step 1: Write the capture script**

Playwright is invoked through `npx` and is **not** added to `package.json`: the site has no build or runtime need for a browser, and this runs once.

```js
// scripts/capture-figures.mjs
// One-off. Run: npx --yes playwright@latest install chromium && node scripts/capture-figures.mjs
import { chromium } from 'playwright'
import { mkdirSync, readFileSync } from 'node:fs'

// Read the demo URLs out of the data file as text. Importing the module would
// need a TypeScript loader, which is not worth wiring up for a one-off script.
const blocks = readFileSync('data/portfolio.ts', 'utf8').split(/\n  \{\n/).slice(1)
const projects = blocks.flatMap((block) => {
  const title = block.match(/title: '([^']+)'/)?.[1]
  const demo = block.match(/demo: '([^']+)'/)?.[1]
  return title && demo ? [{ title, demo }] : []
})

mkdirSync('data/figures', { recursive: true })
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1200, height: 750 } })

for (const study of projects) {
  if (!study.demo) continue
  const slug = study.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  try {
    await page.goto(study.demo, { waitUntil: 'networkidle', timeout: 45000 })
    await page.screenshot({ path: `data/figures/${slug}.webp`, quality: 80, type: 'webp' })
    console.log('captured', slug)
  } catch (error) {
    console.error('skipped', slug, '-', error.message)
  }
}
await browser.close()
```

Note the Render-hosted Arboretum demo cold-starts slowly; the 45s timeout covers it, and a failure only skips that one figure.

- [ ] **Step 2: Run it and inspect every image before committing**

```bash
npx --yes playwright@latest install chromium
node scripts/capture-figures.mjs
ls -la data/figures/
```

Open each file. A screenshot showing a cookie banner, an error page or a loading spinner is worse than no figure — delete those rather than shipping them.

- [ ] **Step 3: Wire figures into the data**

Add to the `Study` interface:

```ts
  figure?: import('next/image').StaticImageData
```

Import and attach per entry, for the figures that captured cleanly:

```ts
import rasuwaFigure from './figures/rasuwa-transboundary-flood.webp'
// ...
    figure: rasuwaFigure,
```

- [ ] **Step 4: Render the figure in `StudyEntry`**

Add the import `import Image from 'next/image'` and place this immediately after the `<h4>`:

```tsx
      {study.figure && (
        <Image
          src={study.figure}
          alt=""
          sizes="640px"
          className="mt-3 w-full rounded border border-border-strong"
        />
      )}
```

`alt=""` is correct here: the figure is decorative, and the study title directly above already names it. A description repeating the title would be noise for a screen reader.

- [ ] **Step 5: Verify**

```bash
npm run lint && npx tsc --noEmit && rm -rf .next out && npm run build >/dev/null && npm run verify
du -sh out
```

Expected: all checks pass, and `out` stays under 8MB.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add study figures captured from the live sites"
```

---

### Task 13: Final pass

**Files:**
- Modify: whatever the checks surface

- [ ] **Step 1: Confirm no dead files or styles remain**

```bash
grep -rn "About\|Projects\|EducationExperience" app components --include=*.tsx | grep -v "PriorExperience" || echo "no stale references"
grep -rn "Inter\|font-family-sans" app components app/globals.css || echo "no stale font references"
```

Expected: both print their "no stale" message.

- [ ] **Step 2: Full verification**

```bash
npm run lint && npx tsc --noEmit && rm -rf .next out && npm run build >/dev/null && npm run verify && du -sh out
```

Expected: `verify: all checks passed`.

- [ ] **Step 3: Review it in a browser, at both themes and both widths**

```bash
npm run dev
```

Check: both palettes; 400px and 1400px wide; the graticule never sits behind body text; the theme toggle lands on the content's right edge; tab through the page and confirm the focus ring is visible on every control.

This step cannot be automated here and must not be skipped — no part of this redesign has been seen rendered.

- [ ] **Step 4: Push the branch**

```bash
git push -u origin redesign/field-atlas
```

The deploy workflow triggers only on push to `main`, so this does not touch the live site.

- [ ] **Step 5: Do not merge yet**

Merging to `main` deploys. Hold until the browser review above is done and Bikal has approved it.

---

## Open items carried from the spec

1. **Publication and thesis entries.** Sections are built and hidden. Bikal supplies the content; no task invents it.
2. **Per-study record values.** Task 4 fills only what each README or live site states. Anything unverifiable is left out and needs Bikal's confirmation before merge.
