// app/page.tsx
import Masthead from '@/components/sections/Masthead'
import ResearchStatement from '@/components/sections/ResearchStatement'
import { PublicationList, ThesisSection } from '@/components/sections/Publications'
import Studies from '@/components/sections/Studies'
import EducationExperience from '@/components/sections/EducationExperience'
import Contact from '@/components/sections/Contact'

export default function HomePage() {
  return (
    <>
      <Masthead />
      <ResearchStatement />
      <PublicationList />
      <ThesisSection />
      <Studies />
      <EducationExperience />
      <Contact />
    </>
  )
}
