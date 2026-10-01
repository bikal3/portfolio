// components/sections/Education.tsx
import SectionLabel from '@/components/ui/SectionLabel'
import { education } from '@/data/portfolio'

export default function Education() {
  return (
    <section id="education" aria-labelledby="education-heading" className="py-12">
      <SectionLabel id="education-heading">Education</SectionLabel>
      <div className="flex flex-col gap-4">
        {education.map((item) => (
          <div key={item.degree}>
            <h3 className="text-text-strong text-base font-semibold">{item.degree}</h3>
            <p className="text-text-muted text-xs mt-0.5">{item.institution}</p>
            <p className="text-text-faint text-xs mt-0.5">{item.dates}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
