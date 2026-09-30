# Bikal Shrestha — Portfolio

Personal portfolio site built with Next.js, Tailwind CSS v4, and TypeScript.

**Live:** [bikal3.com.np](https://bikal3.com.np)

[![HitCount](https://hits.dwyl.com/bikal3/bikal3.com.np.svg?style=flat-square)](https://hits.dwyl.com/bikal3/bikal3.com.np)

## Stack

- **Framework:** Next.js 16 (App Router, static export)
- **Styling:** Tailwind CSS v4, themed with native CSS `light-dark()`
- **Language:** TypeScript
- **Deployment:** GitHub Pages + Cloudflare DNS

## Features

- Light/dark theme toggle: follows the OS by default, remembers an explicit choice
- Side navigation with profile photo, social links, and active section tracking
- Mobile responsive with hamburger drawer
- Projects section as a fixed-height scroll area, so the list stays compact as it grows
- Experience and education sections
- CV download button
- Custom 404 page
- Open Graph / Twitter card meta tags
- `Person` JSON-LD structured data
- Fully static output — no server required

## Project Structure

| Path | Contents |
|------|----------|
| `app/` | App Router pages, root layout, global styles, and the OG card |
| `components/sections/` | Homepage sections (About, Projects, Education & Experience) |
| `data/portfolio.ts` | Projects, education, and experience — edit content here |
| `data/profile.webp` | Sidebar profile photo |
| `public/` | CV and `CNAME` |

The social card lives at `app/opengraph-image.png` (1200×630) with its alt text in
`app/opengraph-image.alt.txt`. Next reads the file's real dimensions, so the
`og:image:width`/`height` tags can't drift out of sync with the image.

Project cards render from `data/portfolio.ts`, so adding a project means adding one
entry to that array — no component changes needed.

## Projects Featured

See the [live site](https://bikal3.com.np) — the list renders from
`data/portfolio.ts`, which is the only place project content is written down.

## Contact

- Email: bikal3.bs@gmail.com
- GitHub: [github.com/bikal3](https://github.com/bikal3)
- LinkedIn: [linkedin.com/in/shresthabikal](https://linkedin.com/in/shresthabikal/)
