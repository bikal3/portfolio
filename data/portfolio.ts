// data/portfolio.ts

// Figures captured from each live site by scripts/capture-figures.mjs.
import rasuwaFigure from './figures/rasuwa-transboundary-flood.webp'
import bhumiscanFigure from './figures/bhumiscan-earth-embedding-search-for-nepal.webp'
import precipFigure from './figures/dual-branch-u-net-for-precipitation-downscaling.webp'
import californiaFigure from './figures/california-wildfire-analysis-dashboard.webp'
import peruFigure from './figures/peru-wildfire-dashboard.webp'
import arboretumFigure from './figures/mapping-invasive-species-hadwen-arboretum.webp'
import mappingAfricaFigure from './figures/mappingafrica-satellite-agricultural-field-segmentation.webp'
import glofFigure from './figures/nepal-glof-explorer.webp'

// `projects` needs a declared type: without it, TypeScript infers a union
// where the entries missing `github` make `project.github` unreachable.
// `teaching` and `priorExperience` share one shape, so that shape is declared
// once as `Role`. `education` has no optional fields, so inference is enough.
interface Study {
  title: string
  /** When the work was done, as 'MMM YYYY'. Required: a card with no date
      gives the reader no sense of recency. Drives the newest-first sort. */
  date: string
  description: string
  /** Map-sheet record. Any field left undefined is omitted from the table
      rather than rendered blank: an academic reader reads a blank field as a
      gap in the work, so only state what is verifiable. */
  region?: string
  sensors?: string[]
  period?: string
  validation?: string
  github?: string
  demo?: string
  /** Screenshot of the live site, decorative. */
  figure?: import('next/image').StaticImageData
}

const PROJECTS: Study[] = [
  {
    title: 'Rasuwa Transboundary Flood',
    figure: rasuwaFigure,
    date: 'Aug 2026',
    region: 'Bhote Koshi valley, Rasuwa',
    sensors: ['Sentinel-1 GRD', 'Sentinel-2 L2A', 'SRTM GL1 (30 m)'],
    period: 'Aug 2026',
    validation: 'HOT ground survey',
    description:
      'Multi-sensor change detection and a terrain-derived flood corridor for the 26 August 2026 Bhote Koshi–Trishuli glacial flood in Rasuwa, Nepal. Validated against the Humanitarian OpenStreetMap Team ground survey and published as a public information site.',
    github: 'https://github.com/bikal3/rasuwa-flood',
    demo: 'https://rasuwaflood.bikal3.com.np',
  },
  {
    title: 'BhumiScan: Earth-Embedding Search for Nepal',
    figure: bhumiscanFigure,
    date: 'Jul 2026',
    region: 'Nepal',
    sensors: ['Sentinel-1', 'Sentinel-2'],
    period: '2020–2025',
    validation: '73.7% macro precision@10 (ESA WorldCover labels)',
    description:
      'Country-scale visual search over Nepal’s landscape. Click any location (a glacial lake, a terraced hillside) and retrieve the most similar places nationwide from 22,676 Clay v1.5 Sentinel-2 embedding cells. Detects 2020→2025 land change scored by cloud-penetrating Sentinel-1 radar, so monsoon haze cannot fake a hotspot, with a cloud-free before/after imagery swipe. Scores 73.7% macro precision@10 against ESA WorldCover labels, a 5.9× lift over the random baseline, and runs entirely client-side with no backend or vector database.',
    demo: 'https://bhumiscan.bikal3.com.np/',
  },
  {
    title: 'Dual-Branch U-Net for Precipitation Downscaling',
    figure: precipFigure,
    date: 'Jan 2026',
    region: 'Big Island of Hawaiʻi',
    sensors: ['NASA IMERG Early Run V07B', 'GOES-17 BCM', 'SRTM DEM (30 m)', 'HCDP rain gauges (~165)'],
    period: '2020–Jun 2021',
    description:
      'Enhances NASA IMERG precipitation estimates from 10 km to 250 m resolution over Hawaii using a dual-branch CNN that fuses satellite imagery with topographic data. Enables finer-grained rainfall mapping for hydrological and climate applications.',
    github: 'https://github.com/bikal3/dual-branch-unet-precip',
    demo: 'https://bikal3.github.io/dual-branch-unet-precip/',
  },
  {
    title: 'California Wildfire Analysis Dashboard',
    figure: californiaFigure,
    date: 'Nov 2024',
    region: 'California',
    sensors: ['MTBS (USGS)', 'ERA5 (via Open-Meteo)'],
    period: '1984–2022',
    description:
      'Interactive dashboard covering 38 years (1984–2022) of California wildfire history derived from MTBS satellite imagery and climate records. Enables exploration of burn extent, severity trends, and climate correlations across the state.',
    github: 'https://github.com/bikal3/mtbs_wildfires',
    demo: 'https://mtbs-wildfires.bikal3.com.np/',
  },
  {
    title: 'Peru Wildfire Dashboard',
    figure: peruFigure,
    date: 'Mar 2025',
    region: 'Peru',
    sensors: ['NASA FIRMS (MODIS Terra/Aqua)', 'MODIS MCD64A1', 'Sentinel-2 10 m LULC 2024'],
    period: '2000–2024',
    description:
      'Interactive dashboard visualizing 24 years (2000–2024) of wildfire activity across Peru using 32,000+ NASA FIRMS hotspots and MODIS burned area data. Features layer toggles for protected areas and indigenous territories, temporal trend analysis, regional fire rankings, and land governance breakdowns.',
    github: 'https://github.com/bikal3/peru-wildfire',
    demo: 'https://bikal3.github.io/peru-wildfire/',
  },
  {
    title: 'Mapping Invasive Species: Hadwen Arboretum',
    figure: arboretumFigure,
    date: 'Nov 2025',
    region: 'Hadwen Arboretum, Worcester, MA',
    description:
      'Interactive web app presenting a GIS-based survey of invasive plants across 26 acres of the Hadwen Arboretum in Worcester, MA. Reveals that 42.6% of the arboretum contains at least one invasive species, with five-chapter narrative storytelling, species density maps, a threat index, and a management effort estimator.',
    github: 'https://github.com/bikal3/arboretum-invasive-species',
    demo: 'https://arboretum-invasive-species.onrender.com',
  },
  {
    title: 'MappingAfrica: Satellite Agricultural Field Segmentation',
    figure: mappingAfricaFigure,
    date: 'May 2025',
    region: 'Zambia',
    validation: '81.79% pixel accuracy, 43.31% mIoU (n=50 test split)',
    description:
      'Implements semantic segmentation of farmland across Zambia using a UNet architecture trained on multi-spectral satellite imagery. Achieves 81.79% pixel accuracy and 43.31% mIoU on the MappingAfrica v2.0.0 dataset. Includes an interactive demo for running inference in the browser.',
    github: 'https://github.com/bikal3/mappingafrica-unet',
    demo: 'https://bikal3.github.io/mappingafrica-unet/',
  },
  {
    title: 'Nepal GLOF Explorer',
    figure: glofFigure,
    date: 'Dec 2023',
    region: 'Nepal Himalaya',
    description:
      'Maps glacial lake outburst flood (GLOF) hazard across the Nepal Himalaya, tracking 25 glacial lakes from 2000 to 2024. Combines ML-based risk classification with satellite change detection to support early warning and disaster preparedness.',
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
export const projects: Study[] = [...PROJECTS].sort(
  (a, b) => monthKey(b.date) - monthKey(a.date)
)

// Years only, and the same granularity for all three: the months for the
// older two degrees are not on record here, and a CV list that states them
// for one entry and not the others reads as missing data rather than as a
// difference in precision. The CV PDF carries the exact dates.
export const education = [
  {
    degree: 'MS in Geographic Information Science',
    institution: 'Clark University',
    dates: '2024 – 2026',
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

interface Role {
  role: string
  organization: string
  dates: string
  bullets: string[]
}

export const teaching: Role[] = [
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
    role: 'Teaching Assistant',
    organization: 'Softwarica College of IT and E-commerce',
    dates: 'June 2019 – July 2020',
    bullets: [
      'Supervised ~40 undergraduate students per semester on independent research projects',
      'Mentored teams building hardware/software projects including an electric vehicle prototype',
    ],
  },
]

export const priorExperience: Role[] = [
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
    role: 'Staff Manager',
    organization: 'Hotel Pokhara Peace',
    dates: 'Jan 2017 – Sept 2019',
    bullets: [
      'Managed daily operations and staff coordination across departments',
      'Developed an internal web presence using HTML, CSS, and JavaScript',
    ],
  },
]
