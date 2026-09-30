// data/portfolio.ts

// Only `projects` needs a declared type: without it, TypeScript infers a union
// where the entries missing `github` make `project.github` unreachable. The
// other two arrays have no optional fields, so inference is enough.
interface Project {
  title: string
  /** When the work was done, as 'MMM YYYY'. Required: a card with no date
      gives the reader no sense of recency. */
  date: string
  description: string
  technologies: string[]
  github?: string
  demo?: string
}

const PROJECTS: Project[] = [
  {
    title: 'Rasuwa Transboundary Flood',
    date: 'Aug 2026',
    description:
      'Multi-sensor change detection and a terrain-derived flood corridor for the 26 August 2026 Bhote Koshi–Trishuli glacial flood in Rasuwa, Nepal. Validated against the Humanitarian OpenStreetMap Team ground survey and published as a public information site.',
    technologies: ['Google Earth Engine', 'Sentinel-1/2', 'Python', 'React', 'SRTM', 'Cloudflare Pages'],
    github: 'https://github.com/bikal3/rasuwa-flood',
    demo: 'https://rasuwaflood.bikal3.com.np',
  },
  {
    title: 'BhumiScan: Earth-Embedding Search for Nepal',
    date: 'Jul 2026',
    description:
      'Country-scale visual search over Nepal’s landscape. Click any location (a glacial lake, a terraced hillside) and retrieve the most similar places nationwide from 22,676 Clay v1.5 Sentinel-2 embedding cells. Detects 2020→2025 land change scored by cloud-penetrating Sentinel-1 radar, so monsoon haze cannot fake a hotspot, with a cloud-free before/after imagery swipe. Scores 73.7% macro precision@10 against ESA WorldCover labels, a 5.9× lift over the random baseline, and runs entirely client-side with no backend or vector database.',
    technologies: ['Next.js', 'TypeScript', 'MapLibre GL', 'Clay v1.5', 'Sentinel-1/2', 'DuckDB', 'Python', 'Cloudflare R2'],
    demo: 'https://bhumiscan.bikal3.com.np/',
  },
  {
    title: 'Dual-Branch U-Net for Precipitation Downscaling',
    date: 'Jan 2026',
    description:
      'Enhances NASA IMERG precipitation estimates from 10 km to 250 m resolution over Hawaii using a dual-branch CNN that fuses satellite imagery with topographic data. Enables finer-grained rainfall mapping for hydrological and climate applications.',
    technologies: ['PyTorch', 'Python', 'NASA IMERG', 'Google Earth Engine', 'Jupyter', 'DEM'],
    github: 'https://github.com/bikal3/dual-branch-unet-precip',
    demo: 'https://bikal3.github.io/dual-branch-unet-precip/',
  },
  {
    title: 'California Wildfire Analysis Dashboard',
    date: 'Nov 2024',
    description:
      'Interactive dashboard covering 38 years (1984–2022) of California wildfire history derived from MTBS satellite imagery and climate records. Enables exploration of burn extent, severity trends, and climate correlations across the state.',
    technologies: ['Plotly', 'Leaflet', 'Pandas', 'Python', 'MTBS/USGS', 'Docker'],
    github: 'https://github.com/bikal3/mtbs_wildfires',
    demo: 'https://mtbs-wildfires.bikal3.com.np/',
  },
  {
    title: 'Peru Wildfire Dashboard',
    date: 'Mar 2025',
    description:
      'Interactive dashboard visualizing 24 years (2000–2024) of wildfire activity across Peru using 32,000+ NASA FIRMS hotspots and MODIS burned area data. Features layer toggles for protected areas and indigenous territories, temporal trend analysis, regional fire rankings, and land governance breakdowns.',
    technologies: ['Next.js', 'MapLibre GL', 'Recharts', 'Python', 'GeoPandas', 'scikit-learn', 'NASA FIRMS', 'MODIS'],
    github: 'https://github.com/bikal3/peru-wildfire',
    demo: 'https://bikal3.github.io/peru-wildfire/',
  },
  {
    title: 'Mapping Invasive Species: Hadwen Arboretum',
    date: 'Nov 2025',
    description:
      'Interactive web app presenting a GIS-based survey of invasive plants across 26 acres of the Hadwen Arboretum in Worcester, MA. Reveals that 42.6% of the arboretum contains at least one invasive species, with five-chapter narrative storytelling, species density maps, a threat index, and a management effort estimator.',
    technologies: ['Python', 'Flask', 'Chart.js', 'Jupyter', 'pandas', 'GIS', 'JavaScript'],
    github: 'https://github.com/bikal3/arboretum-invasive-species',
    demo: 'https://arboretum-invasive-species.onrender.com',
  },
  {
    title: 'MappingAfrica: Satellite Agricultural Field Segmentation',
    date: 'May 2025',
    description:
      'Implements semantic segmentation of farmland across Zambia using a UNet architecture trained on multi-spectral satellite imagery. Achieves 81.79% pixel accuracy and 43.31% mIoU on the MappingAfrica v2.0.0 dataset. Includes an interactive demo for running inference in the browser.',
    technologies: ['PyTorch', 'UNet', 'FastAPI', 'React', 'Vite', 'rasterio', 'NumPy'],
    github: 'https://github.com/bikal3/mappingafrica-unet',
    demo: 'https://bikal3.github.io/mappingafrica-unet/',
  },
  {
    title: 'Nepal GLOF Explorer',
    date: 'Dec 2023',
    description:
      'Maps glacial lake outburst flood (GLOF) hazard across the Nepal Himalaya, tracking 25 glacial lakes from 2000 to 2024. Combines ML-based risk classification with satellite change detection to support early warning and disaster preparedness.',
    technologies: ['scikit-learn', 'Google Earth Engine', 'Leaflet', 'Sentinel-2', 'Landsat', 'Python'],
    github: 'https://github.com/bikal3/himalaya-glof',
    demo: 'https://himalayaglof.bikal3.com.np/',
  },
]

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/**
 * 'Aug 2026' -> a comparable month number. Throws rather than sorting a typo
 * silently to the bottom: this runs at build time, so a bad date fails the
 * build instead of quietly reordering the page.
 */
function monthKey(date: string): number {
  const [month, year] = date.split(' ')
  const index = MONTHS.indexOf(month)
  if (index < 0 || !/^\d{4}$/.test(year)) {
    throw new Error(`portfolio: project date must be 'MMM YYYY', got '${date}'`)
  }
  return Number(year) * 12 + index
}

// Sorted here, not in the component, so adding a project means appending to
// PROJECTS in any order and letting its date decide where it lands.
export const projects: Project[] = [...PROJECTS].sort(
  (a, b) => monthKey(b.date) - monthKey(a.date)
)

export const education = [
  {
    degree: 'MS in Geographic Information Science',
    institution: 'Clark University',
    dates: 'Aug 2024 – May 2026',
  },
  {
    degree: 'MS in Data Analytics',
    institution: 'Clark University',
    dates: '2021 – 2023',
  },
  {
    degree: 'BSc in Computer Science',
    institution: 'Coventry University',
    dates: '2016 – 2019',
  },
]

export const experience = [
  {
    role: 'Senior Lecturer',
    organization: 'Softwarica College of IT and E-commerce',
    dates: 'June 2026 – Present',
    bullets: [
      'Designed and delivered an 11-module lecture series spanning perceptrons and backpropagation through CNNs, transformers, and deep reinforcement learning',
      'Authored four hands-on PyTorch labs covering MNIST data pipelines, LSTM forecasting, CIFAR-10 image classification, and a Vision Transformer built from scratch',
      "Supervising and assessing individual master's capstone projects applying neural networks to real-world datasets",
    ],
  },
  {
    role: 'Data Analyst / Backend Developer',
    organization: 'Softwarica College of IT and E-commerce',
    dates: 'July 2020 – July 2021',
    bullets: [
      'Cleaned millions of records across 250 Moodle database tables using SQL and Tableau Prep',
      'Built executive, marketing, and performance dashboards in Tableau for institutional reporting',
      'Designed and shipped an Android app and REST APIs using Flutter and Node.js',
    ],
  },
  {
    role: 'Teaching Assistant',
    organization: 'Softwarica College of IT and E-commerce',
    dates: 'June 2019 – July 2020',
    bullets: [
      'Supervised ~40 undergraduate students per semester on independent research projects',
      'Mentored teams building hardware/software projects including an electric vehicle prototype',
    ],
  },
  {
    role: 'Staff Manager',
    organization: 'Hotel Pokhara Peace',
    dates: 'Jan 2017 – Sept 2019',
    bullets: [
      'Managed daily operations and staff coordination across departments',
      'Developed an internal web presence using HTML, CSS, and JavaScript',
    ],
  },
]
