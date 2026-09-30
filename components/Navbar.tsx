// components/Navbar.tsx
'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import profileImg from '@/data/profile.webp'
import ThemeToggle from '@/components/ThemeToggle'

// Order mirrors the DOM order of the sections, which is what scroll-spy
// reports back; the work leads, the biography follows.
const NAV_ITEMS = [
  { id: 'projects', label: 'Projects' },
  { id: 'about', label: 'About' },
  { id: 'experience', label: 'Experience' },
  { id: 'education', label: 'Education' },
] as const

const SOCIAL_LINKS = [
  {
    label: 'GitHub',
    href: 'https://github.com/bikal3',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="w-4 h-4">
        <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.604-3.369-1.34-3.369-1.34-.454-1.154-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836a9.59 9.59 0 0 1 2.504.337c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
      </svg>
    ),
  },
  {
    label: 'LinkedIn',
    href: 'https://linkedin.com/in/shresthabikal/',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="w-4 h-4">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
] as const

type NavId = (typeof NAV_ITEMS)[number]['id']

interface SidebarContentProps {
  active: NavId | null
  isHome: boolean
  onNav?: () => void
}

/*
 * Kept at module scope on purpose. Declaring this inside Navbar would make
 * React see a new component type on every render, remounting the whole
 * sidebar — profile image included — each time scroll-spy updates `active`.
 */
function SidebarContent({ active, isHome, onNav }: SidebarContentProps) {
  const navLinkClass = (id: NavId) =>
    `text-xs px-3 py-2 rounded-md transition-all border-l-2 ${
      active === id
        ? 'text-accent bg-accent-bg border-accent'
        : 'text-text-muted hover:text-text-strong hover:bg-surface border-transparent'
    }`

  return (
    <>
      {/* Profile */}
      <div className="flex flex-col gap-3">
        <Link href="/" className="flex flex-col gap-3 group" onClick={onNav}>
          <Image
            src={profileImg}
            alt="Bikal Shrestha"
            width={160}
            height={160}
            sizes="160px"
            className="rounded-xl object-cover border-2 border-border-strong group-hover:border-accent transition-colors w-full aspect-square"
            priority
          />
          <div>
            <p className="font-bold text-text-strong text-sm leading-snug group-hover:text-accent transition-colors">
              Bikal Shrestha
            </p>
            <p className="text-[11px] text-text-muted mt-1 leading-snug">
              Spatial Data Analyst · Data Scientist
            </p>
          </div>
        </Link>
        <a
          href="mailto:bikal3.bs@gmail.com"
          className="flex items-center gap-1 text-[11px] text-text-faint hover:text-accent transition-colors"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true" className="w-3 h-3 shrink-0">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0-9.75 6.75L2.25 6.75" />
          </svg>
          bikal3.bs@gmail.com
        </a>
      </div>

      {/* CV button */}
      <a
        href="/BikalShrestha-CV.pdf"
        download
        className="flex items-center justify-center gap-2 text-xs font-semibold text-accent border border-accent rounded-md px-3 py-2 hover:bg-accent-bg transition-all"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true" className="w-3.5 h-3.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
        </svg>
        Download CV
      </a>

      {/* Social links */}
      <div className="border-t border-border-strong pt-4 flex flex-col gap-2">
        {SOCIAL_LINKS.map(({ label, href, icon }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-text-muted hover:text-accent transition-colors text-xs"
          >
            {icon}
            {label}
          </a>
        ))}
      </div>

      {/* Nav links */}
      {/*
        One branch, not two: off the home page `active` is always null, so
        navLinkClass already returns the inactive styling and aria-current is
        already undefined. A plain anchor covers both the same-page hash jump
        and the trip back from /404 — the latter costs a full reload, which on
        a two-page static export is not worth a second code path.
      */}
      <div className="border-t border-border-strong pt-4 flex flex-col gap-1">
        {NAV_ITEMS.map(({ id, label }) => (
          <a
            key={id}
            href={isHome ? `#${id}` : `/#${id}`}
            className={navLinkClass(id)}
            aria-current={active === id ? 'location' : undefined}
            onClick={onNav}
          >
            {label}
          </a>
        ))}
      </div>
    </>
  )
}

export default function Navbar() {
  const [activeSection, setActiveSection] = useState<NavId | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const toggleRef = useRef<HTMLButtonElement>(null)
  const pathname = usePathname()
  const isHome = pathname === '/'

  // Derived rather than synced into state: off the home page there are no
  // sections to highlight, so there is nothing for an effect to reset.
  const active = isHome ? activeSection : null

  useEffect(() => {
    if (!isHome) return
    const observer = new IntersectionObserver(
      (entries) => {
        const hit = entries.find((e) => e.isIntersecting)
        if (hit) setActiveSection(hit.target.id as NavId)
      },
      { rootMargin: '-40% 0px -55% 0px' }
    )
    NAV_ITEMS.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [isHome])

  const closeMenu = useCallback(() => {
    setMenuOpen(false)
    toggleRef.current?.focus()
  }, [])

  // While the drawer covers the viewport the page behind it must not scroll,
  // and must not stay tabbable — otherwise Tab walks into content the user
  // cannot see. `inert` takes it out of both the tab order and the a11y tree.
  // Escape closes the drawer and returns focus to the button that opened it.
  useEffect(() => {
    if (!menuOpen) return
    const covered = document.getElementById('main-content')
    document.body.classList.add('menu-open')
    covered?.setAttribute('inert', '')
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMenu()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.classList.remove('menu-open')
      covered?.removeAttribute('inert')
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [menuOpen, closeMenu])

  return (
    <>
      {/* ── Mobile top bar ── */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 bg-bg border-b border-border-strong flex items-center justify-between px-5 h-14">
        <Link href="/" className="flex items-center gap-2.5 group" onClick={() => setMenuOpen(false)}>
          <Image
            src={profileImg}
            alt="Bikal Shrestha"
            width={32}
            height={32}
            sizes="32px"
            className="rounded-lg object-cover border border-border-strong"
            priority
          />
          <span className="font-bold text-text-strong text-sm group-hover:text-accent transition-colors">
            Bikal Shrestha
          </span>
        </Link>
        <div className="flex items-center gap-1">
          <ThemeToggle className="block" />
          <button
            ref={toggleRef}
            onClick={() => setMenuOpen((o) => !o)}
            className="text-text-muted hover:text-text-strong transition-colors p-1"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls={menuOpen ? 'mobile-menu' : undefined}
          >
            {menuOpen ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            )}
          </button>
        </div>
      </header>

      {/* ── Mobile drawer ── */}
      {menuOpen && (
        <nav
          id="mobile-menu"
          aria-label="Main"
          className="md:hidden fixed inset-0 top-14 z-40 bg-bg overflow-y-auto px-5 py-8 flex flex-col gap-6"
        >
          <SidebarContent active={active} isHome={isHome} onNav={closeMenu} />
        </nav>
      )}

      {/* ── Desktop side nav ── */}
      <nav
        aria-label="Main"
        className="hidden md:flex w-52 shrink-0 sticky top-0 self-start h-screen overflow-y-auto z-50 bg-bg border-r border-border-strong flex-col px-5 py-8 gap-6"
      >
        <SidebarContent active={active} isHome={isHome} />
      </nav>
    </>
  )
}
