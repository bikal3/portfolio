// components/sections/PriorExperience.tsx
import SectionLabel from '@/components/ui/SectionLabel'
import { priorExperience } from '@/data/portfolio'

export default function PriorExperience() {
  return (
    <section id="experience" aria-labelledby="experience-heading" className="py-12 border-b border-border-subtle">
      <SectionLabel id="experience-heading">Prior experience</SectionLabel>
      <div className="flex flex-col gap-6">
        {priorExperience.map((item) => (
          <div key={item.role}>
            <h3 className="text-text-strong text-lg font-semibold">{item.role}</h3>
            <p className="font-mono text-xs text-text-faint mt-1">
              {item.organization} · {item.dates}
            </p>
            <ul className="flex flex-col gap-1.5 mt-3">
              {item.bullets.map((b) => (
                <li key={b} className="flex gap-2 text-text-body">
                  <span aria-hidden="true" className="text-accent shrink-0">›</span>
                  {b}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}
