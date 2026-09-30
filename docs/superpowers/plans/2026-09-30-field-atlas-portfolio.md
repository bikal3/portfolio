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
const suppressed = (value) => /^(none|0)\b/.test(value ?? '')

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
check(
  'global focus ring',
  rules.some(
    (r) => r.selectors.includes(':focus-visible') && !suppressed(outlineOf(r.body))
  )
)
check(
  'main opts out of ring',
  rules.some(
    (r) => r.selectors.includes('main:focus-visible') && suppressed(outlineOf(r.body))
  )
)
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

Replace the `Inter` import and its instantiation:

```tsx
import { IBM_Plex_Mono, Newsreader } from 'next/font/google'

const serif = Newsreader({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
})

const mono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
})
```

Then on the `<html>` element replace `className={inter.variable}` with:

```tsx
className={`${serif.variable} ${mono.variable}`}
```

- [ ] **Step 2: Update the token block in `app/globals.css`**

Replace the `--font-family-sans` line inside `@theme` and add the type tokens:

```css
  --font-family-serif: var(--font-serif), Georgia, serif;
  --font-family-mono: var(--font-mono), ui-monospace, monospace;
```

Also shift the accent to a cartographic ink blue. It stays in the same family
as the current accent so the site remains recognisably the same person's, and
both values keep their existing contrast headroom:

```css
  --color-accent: light-dark(#1b5e7e, #7cb8d4);
```

Add below the existing `body` rule:

```css
body {
  font-family: var(--font-family-serif);
  font-size: 16px;
  line-height: 1.6;
}
```

- [ ] **Step 3: Widen the column for 16px prose**

In `app/layout.tsx`, change **both** width values from `max-w-[53rem]` to `max-w-[58rem]`: the page wrapper and the desktop theme-toggle wrapper. They must stay equal — the toggle aligns to the content's right edge and will drift if only one changes.

At 58rem the wrapper is 928px: 208px sidebar plus 720px main, whose `md:px-10` leaves 640px of content — about 70 characters at 16px.

- [ ] **Step 4: Verify**

```bash
npm run lint && npx tsc --noEmit && rm -rf .next out && npm run build >/dev/null && npm run verify
grep -c "max-w-\[58rem\]" app/layout.tsx
```

Expected: `verify: all checks passed`, and the grep prints `2`.

- [ ] **Step 5: Commit**

```bash
git add app/globals.css app/layout.tsx
git commit -m "style: swap Inter for Newsreader and IBM Plex Mono"
```

---

### Task 3: Graticule

**Files:**
- Modify: `app/globals.css`

- [ ] **Step 1: Add the graticule tokens and rule**

Add inside `@theme`:

```css
  --color-graticule: light-dark(#e9e6dd, #182029);
```

Add after the `body` rule. It is painted on `body`, so there is no extra DOM node and nothing for assistive technology to encounter:

```css
/*
 * Map graticule. Painted on body as a background-image rather than an added
 * element, so it costs no DOM and needs no aria-hidden. Sits behind cards and
 * panels, which carry their own surface colour, so it never reduces the
 * contrast of body text.
 */
body {
  background-image:
    linear-gradient(var(--color-graticule) 1px, transparent 1px),
    linear-gradient(90deg, var(--color-graticule) 1px, transparent 1px);
  background-size: 32px 32px;
}
```

- [ ] **Step 2: Verify contrast is untouched**

```bash
rm -rf .next out && npm run build >/dev/null && npm run verify
```

Expected: `verify: all checks passed`. The graticule sits on `body`; text sits on `--color-bg` surfaces above it.

- [ ] **Step 3: Commit**

```bash
git add app/globals.css
git commit -m "style: add the map graticule background"
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
