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
// break. `<a(?:\s[^>]*)?>` matches a bare `<a>` as the outer anchor too —
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
