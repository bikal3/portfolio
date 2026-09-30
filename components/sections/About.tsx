// components/sections/About.tsx
import SectionLabel from '@/components/ui/SectionLabel'

const SKILLS = [
  {
    label: 'Languages',
    items: ['Python', 'R', 'SQL', 'JavaScript', 'Node.js'],
  },
  {
    label: 'Deep Learning',
    items: ['PyTorch', 'UNet', 'CNN', 'Transfer Learning', 'Semantic Segmentation'],
  },
  {
    label: 'Machine Learning',
    items: ['scikit-learn', 'Random Forest', 'DBSCAN', 'Clustering', 'Regression', 'Model Evaluation'],
  },
  {
    label: 'Data & Visualization',
    items: ['Pandas', 'NumPy', 'Streamlit', 'Plotly', 'Tableau', 'Chart.js', 'Recharts'],
  },
  {
    label: 'GIS & Remote Sensing',
    items: ['Google Earth Engine', 'QGIS', 'ArcGIS', 'TerrSet', 'Sentinel-2', 'Landsat', 'NASA IMERG', 'GDAL', 'MapLibre GL'],
  },
  {
    label: 'Research Areas',
    items: ['Climate Modeling', 'Hazard Mapping', 'Wildfire Analysis', 'Precipitation Downscaling', 'Land Cover Classification'],
  },
]

export default function About() {
  return (
    <section id="about" aria-labelledby="about-heading" className="py-12 border-b border-border-subtle">
      <SectionLabel id="about-heading">About</SectionLabel>
      <div className="space-y-4 max-w-[68ch] text-sm text-text-body leading-relaxed mb-10">
        <p>
          I&rsquo;m Bikal Shrestha, a spatial data analyst and data scientist with
          dual master&rsquo;s degrees in Geographic Information Science and Data
          Analytics from Clark University. My research sits at the intersection
          of deep learning, machine learning, remote sensing, and environmental science,
          using satellite data to study the systems that shape our planet.
        </p>
        <p>
          My recent work spans precipitation downscaling with deep learning,
          wildfire trend analysis across three decades of satellite imagery, and
          glacial lake outburst flood hazard mapping in the Nepal Himalaya. I
          am drawn to problems where geospatial data can inform real decisions
          about climate risk, land use, and disaster preparedness.
        </p>
        <p>
          I specialize in building end-to-end pipelines, from raw satellite
          imagery ingested through Google Earth Engine to interactive dashboards
          deployed for public use. I care about reproducibility and making
          complex geospatial research legible to broader audiences, whether
          through clean visualizations or well-documented open-source code.
        </p>
        <p>
          Before academia I spent several years as a data analyst and backend
          developer, building dashboards, cleaning large datasets, and shipping
          production APIs. That engineering background informs how I approach
          research: with an emphasis on clean code, automated workflows, and
          outputs that actually work outside a notebook.
        </p>
      </div>

      <h3 className="text-xs text-text-faint font-semibold tracking-[2px] uppercase mb-5">
        Skills
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {SKILLS.map(({ label, items }) => (
          <div key={label}>
            <p className="text-xs text-accent font-semibold mb-2">{label}</p>
            <div className="flex flex-wrap gap-1.5">
              {items.map((item) => (
                <span
                  key={item}
                  className="text-xs text-text-muted bg-surface border border-border-strong px-2 py-0.5 rounded"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
