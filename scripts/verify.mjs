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
// break. `<a(?:\s[^>]*)?>` matches a bare `<a>` as the outer anchor too —
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
