// scripts/capture-figures.mjs
// One-off. Playwright stays out of package.json: the site has no build or
// runtime need for a browser. Run:
//   npx --yes playwright@latest install chromium
//   npx --yes --package playwright@latest -c 'NODE_PATH="${PATH%%/.bin:*}" node scripts/capture-figures.mjs'
// (npx puts its own node_modules/.bin first on PATH, so NODE_PATH names the
// node_modules beside it; npx wires up binaries, not imports.)
import { createRequire } from 'node:module'
import { mkdirSync, readFileSync } from 'node:fs'

// require, not import: ESM resolution ignores NODE_PATH, and playwright is not
// a dependency of this project on purpose.
const { chromium } = createRequire(import.meta.url)('playwright')

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
    await page.goto(study.demo, { waitUntil: 'networkidle', timeout: 120000 })
    // Dismisses an onboarding dialog if one opened (BhumiScan ships a welcome
    // tour). Harmless on the sites that have none.
    await page.keyboard.press('Escape')
    await page.waitForTimeout(1000)
    await page.screenshot({ path: `data/figures/${slug}.webp`, quality: 80, type: 'webp' })
    console.log('captured', slug)
  } catch (error) {
    console.error('skipped', slug, '-', error.message)
  }
}
await browser.close()
