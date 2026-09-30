// app/layout.tsx
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import BackToTop from '@/components/BackToTop'
import ThemeToggle from '@/components/ThemeToggle'
import Footer from '@/components/Footer'
import profileImg from '@/data/profile.webp'
import { profile } from '@/data/profile'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

const SITE_URL = 'https://bikal3.com.np'
const DESCRIPTION =
  'Spatial Data Analyst and Data Scientist specializing in GIS, remote sensing, deep learning, and geospatial research.'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'Bikal Shrestha',
  description: DESCRIPTION,
  alternates: {
    canonical: '/',
  },
  // og:image / twitter:image and their dimensions come from the
  // `opengraph-image` and `twitter-image` file conventions in this directory,
  // so the declared size can never drift from the actual file.
  openGraph: {
    title: 'Bikal Shrestha | Spatial Data Analyst & Data Scientist',
    description: DESCRIPTION,
    url: '/',
    siteName: 'Bikal Shrestha',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bikal Shrestha | Spatial Data Analyst & Data Scientist',
    description: DESCRIPTION,
  },
}

// Tells the UA both palettes are supported, so form controls, scrollbars and
// the initial paint match the theme instead of defaulting to light.
export const viewport: Viewport = {
  colorScheme: 'light dark',
}

const personJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Bikal Shrestha',
  url: SITE_URL,
  image: `${SITE_URL}${profileImg.src}`,
  jobTitle: 'Spatial Data Analyst & Data Scientist',
  email: `mailto:${profile.email}`,
  description: DESCRIPTION,
  sameAs: [profile.github, profile.linkedin],
  alumniOf: [
    { '@type': 'CollegeOrUniversity', name: 'Clark University' },
    { '@type': 'CollegeOrUniversity', name: 'Coventry University' },
  ],
  knowsAbout: [
    'Geographic Information Science',
    'Remote Sensing',
    'Deep Learning',
    'Machine Learning',
    'Data Analytics',
    'Climate Modeling',
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // The inline script below sets data-theme and color-scheme on <html> before
  // React hydrates, so the server HTML deliberately disagrees with the DOM by
  // then. suppressHydrationWarning covers this element's own attributes only --
  // it does not reach any child -- which is exactly the disagreement we create.
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="bg-bg text-text-body antialiased">
        {/*
          Runs synchronously before the body paints, so a stored choice is
          applied on the first frame instead of flashing the other theme.
          Sets data-theme unconditionally (the toggle's label and icon read
          it) but color-scheme only when a choice was actually stored, so
          with no stored choice the CSS keeps following the OS.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{var t=localStorage.theme;" +
              "document.documentElement.dataset.theme=t||(matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light');" +
              "if(t)document.documentElement.style.colorScheme=t}catch(e){}",
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        <a
          href="#main-content"
          data-hide-when-menu-open
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-60 focus:rounded-md focus:border focus:border-accent focus:bg-surface focus:px-4 focus:py-2 focus:text-xs focus:text-accent"
        >
          Skip to content
        </a>
        <div className="max-w-5xl mx-auto flex min-h-screen">
          <Navbar />
          <main
            id="main-content"
            tabIndex={-1}
            className="flex-1 pt-20 pb-12 px-5 md:pt-12 md:px-10 min-w-0"
          >
            {children}
            <Footer />
          </main>
          <BackToTop />
        </div>
        {/*
          Desktop switch. Fixed so it stays reachable while scrolling, but
          width-capped and centred like the page container so it lands on the
          content's right edge rather than drifting into the empty margin on a
          wide screen. The wrapper ignores pointer events so it does not sit
          over the content it spans.
        */}
        <div className="pointer-events-none fixed inset-x-0 top-5 z-50 mx-auto hidden max-w-5xl justify-end px-10 md:flex">
          <ThemeToggle className="pointer-events-auto block" />
        </div>
      </body>
    </html>
  )
}
