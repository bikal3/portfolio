// components/sections/Publications.tsx
import SectionLabel from '@/components/ui/SectionLabel'
import { papers, thesis } from '@/data/publications'

/*
 * Both sections return null when their data is empty. No heading, no
 * placeholder, no "coming soon" — an empty Publications heading on an academic
 * page is worse than no section at all.
 */
export function PublicationList() {
  if (papers.length === 0) return null

  return (
    <section id="publications" aria-labelledby="publications-heading" className="py-12 border-b border-border-subtle">
      <SectionLabel id="publications-heading">Publications</SectionLabel>
      <ol className="flex flex-col gap-5">
        {papers.map((paper, i) => (
          <li key={paper.title} className="flex gap-3">
            <span className="font-mono text-xs text-text-faint pt-1.5">[{i + 1}]</span>
            <div>
              <p className="text-text-body">
                {paper.authors} ({paper.year}). {paper.url ? (
                  <a href={paper.url} target="_blank" rel="noopener noreferrer" className="text-text-strong hover:text-accent transition-colors">
                    {paper.title}
                  </a>
                ) : (
                  <span className="text-text-strong">{paper.title}</span>
                )}. <em>{paper.venue}</em>.
              </p>
              <p className="font-mono text-xs text-text-faint mt-1">
                {paper.status.toUpperCase()}{paper.doi ? ` · ${paper.doi}` : ''}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}

export function ThesisSection() {
  if (!thesis) return null

  return (
    <section id="thesis" aria-labelledby="thesis-heading" className="py-12 border-b border-border-subtle">
      <SectionLabel id="thesis-heading">Thesis</SectionLabel>
      <h3 className="text-text-strong text-lg font-semibold">
        {thesis.url ? (
          <a href={thesis.url} target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">
            {thesis.title}
          </a>
        ) : (
          thesis.title
        )}
      </h3>
      <p className="font-mono text-xs text-text-faint mt-2">
        {thesis.degree} · {thesis.institution} · {thesis.year}
        {thesis.advisor ? ` · advised by ${thesis.advisor}` : ''}
      </p>
    </section>
  )
}
