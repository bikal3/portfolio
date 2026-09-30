// components/sections/Projects.tsx
import SectionLabel from '@/components/ui/SectionLabel'
import { ExternalIcon, GitHubIcon } from '@/components/ui/icons'
import { projects } from '@/data/portfolio'

type Project = (typeof projects)[number]

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
            <GitHubIcon className="w-3.5 h-3.5" />
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
            <ExternalIcon className="w-3.5 h-3.5" />
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
