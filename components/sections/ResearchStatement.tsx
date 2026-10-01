// components/sections/ResearchStatement.tsx
import SectionLabel from '@/components/ui/SectionLabel'

export default function ResearchStatement() {
  return (
    <section id="research" aria-labelledby="research-heading" className="py-12 border-b border-border-subtle">
      <SectionLabel id="research-heading">Research</SectionLabel>
      <div className="space-y-4 text-text-body">
        <p>
          I&rsquo;m a spatial data analyst with dual master&rsquo;s degrees in
          Geographic Information Science and Data Analytics from Clark
          University. My research sits at the intersection of deep learning,
          remote sensing and environmental science, using satellite data to
          study the systems that shape our planet.
        </p>
        <p>
          Recent work spans precipitation downscaling with deep learning,
          wildfire trend analysis across three decades of satellite imagery, and
          glacial lake outburst flood hazard mapping in the Nepal Himalaya. I am
          drawn to problems where geospatial data can inform real decisions
          about climate risk, land use and disaster preparedness.
        </p>
        <p>
          I build end-to-end pipelines, from raw imagery ingested through Google
          Earth Engine to interactive tools deployed for public use, and I care
          about reproducibility and validating results against ground truth.
        </p>
      </div>
    </section>
  )
}
