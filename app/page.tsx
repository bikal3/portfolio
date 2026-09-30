// app/page.tsx
import About from '@/components/sections/About'
import Projects from '@/components/sections/Projects'
import EducationExperience from '@/components/sections/EducationExperience'

export default function HomePage() {
  return (
    <>
      {/*
        The visible name lives in the sidebar, which is a nav landmark, so the
        document still needs a top-level heading for search engines and for
        screen-reader heading navigation.
      */}
      <h1 className="sr-only">
        Bikal Shrestha, Spatial Data Analyst and Data Scientist
      </h1>
      <Projects />
      <About />
      <EducationExperience />
    </>
  )
}
