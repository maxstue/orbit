import { Outlet, createFileRoute, notFound } from '@tanstack/react-router'

import { localeSchema } from '@/features/star-system/data/worlds'

export const Route = createFileRoute('/$locale')({
  beforeLoad: ({ params }) => {
    const locale = localeSchema.safeParse(params.locale)
    if (!locale.success) throw notFound()
    return { locale: locale.data }
  },
  component: Outlet,
  notFoundComponent: LocaleNotFound,
})

function LocaleNotFound() {
  return (
    <main className="protocol-error">
      <div className="protocol-error-card">
        <p className="eyebrow">LINGUA RELAY · 404</p>
        <h1>Translation protocol unavailable.</h1>
        <p>These coordinates do not map to a supported language. Continue in English or German.</p>
        <nav aria-label="Available languages">
          <a href="/en">English</a>
          <a href="/de">Deutsch</a>
        </nav>
        <a className="protocol-return" href="/en">
          Return to Orbit
        </a>
      </div>
    </main>
  )
}
