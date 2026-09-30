// scripts/verify.mjs
// Asserts the quality bar against the built page. Run: node scripts/verify.mjs
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const html = readFileSync('out/index.html', 'utf8')
const dom = html.replace(/<script[\s\S]*?<\/script>/g, '')
const css = readdirSync('out/_next/static/chunks')
  .filter((f) => f.endsWith('.css'))
  .map((f) => readFileSync(join('out/_next/static/chunks', f), 'utf8'))
  .join('')

const failures = []
const check = (name, condition) => {
  if (!condition) failures.push(name)
}

// Headings: exactly one h1, and no level is skipped.
const levels = [...dom.matchAll(/<h([1-6])/g)].map((m) => Number(m[1]))
check('exactly one h1', levels.filter((l) => l === 1).length === 1)
check('h1 is first heading', levels[0] === 1)
check(
  'no skipped heading level',
  levels.every((l, i) => i === 0 || l <= levels[i - 1] + 1)
)

// Anchors must never nest: the stretched-link pattern makes this easy to break.
check('no nested anchors', !/<a [^>]*>(?:(?!<\/a>).)*<a /s.test(dom))

// Quality bar held since the 2026-09 audit.
check('skip link present', dom.includes('Skip to content'))
check('global focus ring', css.includes(':focus-visible{outline'))
check('main opts out of ring', css.includes('main:focus'))
check('reduced motion honoured', css.includes('prefers-reduced-motion'))
check('no per-block measure caps', !dom.includes('max-w-[68ch]'))
check('canonical present', html.includes('rel="canonical"'))
check('JSON-LD present', html.includes('application/ld+json'))
check('og image dimensions', html.includes('og:image:width'))

// Every external link opens safely.
const targets = [...dom.matchAll(/<a [^>]*target="_blank"[^>]*>/g)]
check(
  'every target=_blank has rel=noopener',
  targets.every((m) => m[0].includes('noopener'))
)

if (failures.length) {
  console.error('FAIL\n' + failures.map((f) => '  - ' + f).join('\n'))
  process.exit(1)
}
console.log(`verify: ${'all checks passed'}`)
