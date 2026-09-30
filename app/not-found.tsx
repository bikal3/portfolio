// app/not-found.tsx
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex flex-col items-start justify-center min-h-[60vh] gap-4">
      <p className="text-[11px] text-accent font-semibold tracking-[2px] uppercase">
        404
      </p>
      <h1 className="text-3xl font-extrabold text-text-strong">Page not found</h1>
      <p className="text-text-muted text-sm max-w-sm">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="mt-2 text-xs text-accent border border-accent px-4 py-2 rounded-md hover:bg-accent-bg transition-colors"
      >
        ← Back home
      </Link>
    </div>
  )
}
