// data/publications.ts

export interface Publication {
  authors: string
  year: string
  title: string
  venue: string
  status: 'published' | 'preprint' | 'in review'
  url?: string
  doi?: string
}

export interface Thesis {
  title: string
  degree: string
  institution: string
  year: string
  advisor?: string
  url?: string
}

/*
 * Empty on delivery, and that is deliberate. Publication metadata is the one
 * thing on an academic page that must never be invented, so the sections that
 * read these render nothing at all until real entries are pasted in. See
 * Publications.tsx: an empty list produces no heading and no placeholder.
 */
export const papers: Publication[] = []

export const thesis: Thesis | null = null
