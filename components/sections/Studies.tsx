// components/sections/Studies.tsx
import SectionLabel from '@/components/ui/SectionLabel'
import RecordTable, { type Row } from '@/components/ui/RecordTable'
import { ExternalIcon, GitHubIcon } from '@/components/ui/icons'
import { projects } from '@/data/portfolio'

type Study = (typeof projects)[number]

/** `projects` arrives newest-first, so one pass collects each run of a year. */
function byYear(list: Study[]) {
  const groups: { year: string; items: Study[] }[] = []
  for (const study of list) {
    const year = study.date.slice(-4)
    const current = groups.at(-1)
    if (current?.year === year) current.items.push(study)
    else groups.push({ year, items: [study] })
  }
  return groups
}

/** Only states what the data states; undefined fields are dropped. */
function recordRows(study: Study): Row[] {
  const rows: Row[] = []
  if (study.region) rows.push({ label: 'REGION', value: study.region })
  if (study.sensors?.length) rows.push({ label: 'SENSOR', value: study.sensors.join(' · ') })
  if (study.period) rows.push({ label: 'PERIOD', value: study.period })
  if (study.validation) rows.push({ label: 'CHECK', value: study.validation })
  return rows
}

function StudyEntry({ study }: { study: Study }) {
  const primary = study.demo ?? study.github

  return (
    <article className="group relative border-t border-border-subtle pt-5">
      <p className="font-mono text-xs text-text-faint">{study.date}</p>
      <h4 className="text-text-strong text-lg font-semibold mt-1">
        {primary ? (
          <a
            href={primary}
            target="_blank"
            rel="noopener noreferrer"
            className="after:absolute after:inset-0 group-hover:text-accent transition-colors"
          >
            {study.title}
          </a>
        ) : (
          study.title
        )}
      </h4>
      <p className="text-text-body mt-2">{study.description}</p>
      <div className="mt-4">
        <RecordTable rows={recordRows(study)} />
      </div>
      <div className="flex gap-4 mt-4">
        {study.github && (
          <a
            href={study.github}
            target="_blank"
            rel="noopener noreferrer"
            className="relative z-10 inline-flex items-center gap-1.5 py-1.5 -my-1.5 font-mono text-xs text-text-muted hover:text-accent transition-colors"
          >
            <GitHubIcon className="w-3.5 h-3.5" />
            CODE
          </a>
        )}
        {study.demo && (
          <a
            href={study.demo}
            target="_blank"
            rel="noopener noreferrer"
            className="relative z-10 inline-flex items-center gap-1.5 py-1.5 -my-1.5 font-mono text-xs text-text-muted hover:text-accent transition-colors"
          >
            <ExternalIcon className="w-3.5 h-3.5" />
            SITE
          </a>
        )}
      </div>
    </article>
  )
}

export default function Studies() {
  return (
    <section id="studies" aria-labelledby="studies-heading" className="py-12 border-b border-border-subtle">
      <SectionLabel id="studies-heading">Studies</SectionLabel>
      <div className="flex flex-col gap-10">
        {byYear(projects).map(({ year, items }) => (
          <div key={year}>
            <div className="flex items-center gap-3 mb-5">
              <h3 className="font-mono text-xs tracking-[2px] text-text-faint">{year}</h3>
              <span aria-hidden="true" className="h-px flex-1 bg-border-subtle" />
            </div>
            <div className="flex flex-col gap-8">
              {items.map((study) => (
                <StudyEntry key={study.title} study={study} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
