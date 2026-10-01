// app/page.tsx
import Masthead from '@/components/sections/Masthead'
import ResearchStatement from '@/components/sections/ResearchStatement'
import { PublicationList, ThesisSection } from '@/components/sections/Publications'
import Studies from '@/components/sections/Studies'
import Teaching from '@/components/sections/Teaching'
import PriorExperience from '@/components/sections/PriorExperience'
import Education from '@/components/sections/Education'
import Contact from '@/components/sections/Contact'

export default function HomePage() {
  return (
    <>
      <Masthead />
      <ResearchStatement />
      <PublicationList />
      <ThesisSection />
      <Studies />
      <Teaching />
      <PriorExperience />
      <Education />
      <Contact />
    </>
  )
}
