// components/ThemeToggle.tsx
'use client'

import { useEffect } from 'react'

/*
 * No React state for the thumb position or the label. Both variants ship in the
 * HTML and globals.css picks the live one from the data-theme that the inline
 * script in layout.tsx sets before first paint, so there is nothing to hydrate,
 * nothing to flash, and no server/client mismatch to reconcile.
 *
 * Deliberately a <button>, not role="switch": aria-checked has to be a rendered
 * attribute, which means React state, which is the flash this design exists to
 * avoid. The accessible name says what pressing it does ("Light theme"), which
 * is unambiguous without announcing a checked state.
 *
 * `className` carries the display and position utilities because the two call
 * sites differ: inline in the mobile top bar, fixed top-right on desktop.
 */
export default function ThemeToggle({ className = '' }: { className?: string }) {
  // A stored choice wins forever; until one exists, keep tracking the OS so a
  // system switch while the page is open does not leave a stale thumb behind.
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => {
      try {
        if (localStorage.theme) return
      } catch {
        return
      }
      document.documentElement.dataset.theme = mq.matches ? 'dark' : 'light'
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const toggle = () => {
    const root = document.documentElement
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark'
    root.dataset.theme = next
    // Overrides the `color-scheme: light dark` in globals.css, which is what
    // every light-dark() token resolves against.
    root.style.colorScheme = next
    try {
      localStorage.theme = next
    } catch {
      // Private mode or blocked storage: the switch still applies, it just
      // will not survive a reload.
    }
  }

  return (
    <button
      onClick={toggle}
      className={`theme-toggle relative h-6 w-12 shrink-0 rounded-full border border-border-strong bg-surface transition-colors hover:border-accent ${className}`}
    >
      <span data-when="dark" className="sr-only">
        Light theme
      </span>
      <span data-when="light" className="sr-only">
        Dark theme
      </span>
      <span className="theme-switch-thumb absolute top-px left-px flex h-5 w-5 items-center justify-center rounded-full bg-accent text-bg transition-transform">
        <svg data-when="dark" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} aria-hidden="true" className="h-3 w-3">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1.5m0 15V21m9-9h-1.5m-15 0H3m15.364-6.364-1.06 1.06M6.697 17.303l-1.061 1.06m12.728 0-1.06-1.06M6.697 6.697l-1.061-1.06M16.5 12a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Z" />
        </svg>
        <svg data-when="light" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} aria-hidden="true" className="h-3 w-3">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
        </svg>
      </span>
    </button>
  )
}
