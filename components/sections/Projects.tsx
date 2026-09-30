// components/sections/Projects.tsx
import SectionLabel from '@/components/ui/SectionLabel'
import { projects } from '@/data/portfolio'

type Project = (typeof projects)[number]

const GitHubIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="w-3.5 h-3.5">
    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.604-3.369-1.34-3.369-1.34-.454-1.154-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836a9.59 9.59 0 0 1 2.504.337c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
  </svg>
)

const ExternalIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true" className="w-3.5 h-3.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
  </svg>
)

/**
 * `projects` already arrives newest-first, so a single pass collects each run
 * of same-year entries. No sorting or date parsing here: the data module owns
 * the order, and this only has to notice where the year changes.
 */
function byYear(list: Project[]) {
  const groups: { year: string; items: Project[] }[] = []
  for (const project of list) {
    const year = project.date.slice(-4)
    const current = groups.at(-1)
    if (current?.year === year) current.items.push(project)
    else groups.push({ year, items: [project] })
  }
  return groups
}

function ProjectCard({ project }: { project: Project }) {
  // The card highlights on hover, so the whole card must be the target. A
  // stretched pseudo-element on the title link covers it without nesting
  // anchors; the footer links sit above it on z.
  const primary = project.demo ?? project.github

  return (
    <div className="group relative bg-surface border border-border-strong rounded-md p-4 transition-all hover:border-accent hover:bg-accent-bg focus-within:border-accent">
      <h4 className="text-text-strong text-base font-semibold mb-2">
        {primary ? (
          <a
            href={primary}
            target="_blank"
            rel="noopener noreferrer"
            className="after:absolute after:inset-0 after:rounded-md group-hover:text-accent transition-colors"
          >
            {project.title}
          </a>
        ) : (
          project.title
        )}
      </h4>
      <p className="text-text-faint text-xs mb-2">{project.date}</p>
      <p className="text-text-muted text-sm leading-relaxed mb-3 max-w-[68ch]">
        {project.description}
      </p>
      <div className="flex flex-wrap gap-2 mb-4">
        {project.technologies.map((tech) => (
          <span key={tech} className="bg-accent-bg text-accent text-[11px] px-2 py-0.5 rounded">
            {tech}
          </span>
        ))}
      </div>
      <div className="flex gap-4">
        {project.github && (
          <a
            href={project.github}
            target="_blank"
            rel="noopener noreferrer"
            className="relative z-10 inline-flex items-center gap-1.5 py-1.5 -my-1.5 text-xs text-text-muted hover:text-accent transition-colors"
          >
            <GitHubIcon />
            GitHub
          </a>
        )}
        {project.demo && (
          <a
            href={project.demo}
            target="_blank"
            rel="noopener noreferrer"
            className="relative z-10 inline-flex items-center gap-1.5 py-1.5 -my-1.5 text-xs text-text-muted hover:text-accent transition-colors"
          >
            <ExternalIcon />
            Live Demo
          </a>
        )}
      </div>
    </div>
  )
}

export default function Projects() {
  const groups = byYear(projects)

  return (
    <section id="projects" aria-labelledby="projects-heading" className="py-12 border-b border-border-subtle">
      <SectionLabel id="projects-heading">Projects</SectionLabel>
      <div className="flex flex-col gap-8">
        {groups.map(({ year, items }) => (
          <div key={year}>
            {/*
              Year rule: the heading keeps its intrinsic width and the hairline
              takes the rest, so nothing here depends on a fixed measurement.
            */}
            <div className="flex items-center gap-3 mb-4">
              <h3 className="text-xs font-semibold tracking-[2px] text-text-faint">
                {year}
              </h3>
              <span aria-hidden="true" className="h-px flex-1 bg-border-subtle" />
              <span className="text-[11px] text-text-faint">
                {items.length} {items.length === 1 ? 'project' : 'projects'}
              </span>
            </div>
            <div className="flex flex-col gap-4">
              {items.map((project) => (
                <ProjectCard key={project.title} project={project} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
