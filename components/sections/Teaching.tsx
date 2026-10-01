// components/sections/Teaching.tsx
import SectionLabel from '@/components/ui/SectionLabel'
import { teaching } from '@/data/portfolio'

export default function Teaching() {
  return (
    <section id="teaching" aria-labelledby="teaching-heading" className="py-12 border-b border-border-subtle">
      <SectionLabel id="teaching-heading">Teaching</SectionLabel>
      <div className="flex flex-col gap-6">
        {teaching.map((item) => (
          <div key={item.role}>
            <h3 className="text-text-strong text-lg font-semibold">{item.role}</h3>
            <p className="font-mono text-xs text-text-faint mt-1">
              {item.organization} · {item.dates}
            </p>
            <ul className="flex flex-col gap-1.5 mt-3">
              {item.bullets.map((b) => (
                <li key={b} className="flex gap-2 text-text-body">
                  <span className="text-accent shrink-0">›</span>
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
