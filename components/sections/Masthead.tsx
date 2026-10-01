// components/sections/Masthead.tsx
export default function Masthead() {
  return (
    <header className="py-12 border-b border-border-subtle">
      <p className="font-mono text-xs tracking-[2px] text-text-faint">
        27°43′N 85°19′E · KATHMANDU
      </p>
      <h1 className="text-text-strong text-4xl font-semibold mt-4 leading-tight">
        Bikal Shrestha
      </h1>
      <p className="text-text-muted mt-2">
        Spatial data · remote sensing · hazard mapping
      </p>
    </header>
  )
}
