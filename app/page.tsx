// app/page.tsx
import About from '@/components/sections/About'
import Studies from '@/components/sections/Studies'
import EducationExperience from '@/components/sections/EducationExperience'
import Contact from '@/components/sections/Contact'

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
      <About />
      <Studies />
      <EducationExperience />
      <Contact />
    </>
  )
}
