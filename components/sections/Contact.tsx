// components/sections/Contact.tsx
import SectionLabel from '@/components/ui/SectionLabel'
import { profile } from '@/data/profile'

const LINKS = [
  { label: 'GitHub', href: profile.github },
  { label: 'LinkedIn', href: profile.linkedin },
] as const

export default function Contact() {
  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      className="py-12 border-t border-border-subtle"
    >
      <SectionLabel id="contact-heading">Contact</SectionLabel>
      <a
        href={`mailto:${profile.email}`}
        className="inline-block text-base font-semibold text-accent hover:underline"
      >
        {profile.email}
      </a>
      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1">
        {LINKS.map(({ label, href }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center py-1.5 text-sm text-text-muted hover:text-accent transition-colors"
          >
            {label}
          </a>
        ))}
        <a
          href={profile.cv}
          download
          className="inline-flex items-center py-1.5 text-sm text-text-muted hover:text-accent transition-colors"
        >
          Download CV
        </a>
      </div>
    </section>
  )
}
