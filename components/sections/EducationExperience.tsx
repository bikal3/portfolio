// components/sections/EducationExperience.tsx
import SectionLabel from '@/components/ui/SectionLabel'
import { education, experience } from '@/data/portfolio'

export default function EducationExperience() {
  return (
    <>
      <section id="experience" aria-labelledby="experience-heading" className="py-12 border-b border-border-subtle">
        <SectionLabel id="experience-heading">Experience</SectionLabel>
        <div className="flex flex-col gap-5">
          {experience.map((item) => (
            <div key={item.role}>
              <h3 className="text-text-strong text-base font-semibold">{item.role}</h3>
              <p className="text-text-muted text-xs mt-0.5">{item.organization}</p>
              <p className="text-text-faint text-xs mt-0.5 mb-2">{item.dates}</p>
              <ul className="flex flex-col gap-1 max-w-[68ch]">
                {item.bullets.map((b) => (
                  <li key={b} className="flex gap-2 text-sm text-text-muted leading-relaxed">
                    <span className="text-accent mt-0.5 shrink-0">›</span>
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

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
    </>
  )
}
