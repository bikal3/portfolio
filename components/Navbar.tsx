// components/Navbar.tsx
'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import profileImg from '@/data/profile.webp'
import { profile } from '@/data/profile'
import { GitHubIcon, LinkedInIcon } from '@/components/ui/icons'
import ThemeToggle from '@/components/ThemeToggle'

// Publications and Thesis are deliberately absent: they render nothing while
// their data is empty, and a nav link to a section that does not exist is a
// dead anchor.
const NAV_ITEMS = [
  { id: 'research', label: 'Research' },
  { id: 'studies', label: 'Studies' },
  { id: 'teaching', label: 'Teaching' },
  { id: 'experience', label: 'Experience' },
  { id: 'education', label: 'Education' },
  { id: 'contact', label: 'Contact' },
] as const

const SOCIAL_LINKS = [
  { label: 'GitHub', href: profile.github, Icon: GitHubIcon },
  { label: 'LinkedIn', href: profile.linkedin, Icon: LinkedInIcon },
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
    `text-xs px-3 py-2 rounded-md transition-colors border-l-2 ${
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
          href={`mailto:${profile.email}`}
          className="flex items-center gap-1 text-[11px] text-text-faint hover:text-accent transition-colors"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true" className="w-3 h-3 shrink-0">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0-9.75 6.75L2.25 6.75" />
          </svg>
          {profile.email}
        </a>
      </div>

      {/* CV button */}
      <a
        href={profile.cv}
        download
        className="flex items-center justify-center gap-2 text-xs font-semibold text-accent border border-accent rounded-md px-3 py-2 hover:bg-accent-bg transition-colors"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true" className="w-3.5 h-3.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
        </svg>
        Download CV
      </a>

      {/* Social links */}
      <div className="border-t border-border-strong pt-4 flex flex-col gap-2">
        {SOCIAL_LINKS.map(({ label, href, Icon }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-text-muted hover:text-accent transition-colors text-xs"
          >
            <Icon className="w-4 h-4" />
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

  // A line a quarter of the way down the viewport decides the active section:
  // the last one whose top has passed it. This replaced an IntersectionObserver
  // band, which highlighted the wrong item for four of the six sections -- a
  // band thinner than a section is only ever reported mid-scroll, and the
  // callback receives the entries that *changed*, so picking the first
  // intersecting one in a partial batch is not the same as picking the one
  // under the line.
  useEffect(() => {
    if (!isHome) return
    const onScroll = () => {
      const line = window.innerHeight * 0.25
      // At the foot of the page the last section can no longer reach the line
      // -- only ~130px of the document sits below Contact -- so without this it
      // could never light up at all.
      // ponytail: Education and Contact share that final screen, so clicking
      // Education there still reads Contact. Inherent to any line-based spy
      // once the page runs out of scroll; fixable only by padding the foot of
      // the page, which is not worth distorting the layout for.
      const atBottom =
        window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2
      let current: NavId | null = null
      for (const { id } of NAV_ITEMS) {
        const top = document.getElementById(id)?.getBoundingClientRect().top
        if (top !== undefined && top <= line) current = id
      }
      setActiveSection(atBottom ? NAV_ITEMS[NAV_ITEMS.length - 1].id : current)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
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
