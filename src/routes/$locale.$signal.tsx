import { createFileRoute, notFound } from '@tanstack/react-router'

import { localeSchema, worldIdSchema } from '@/features/star-system/data/worlds'
import { getRouteMetadata } from '@/features/star-system/i18n/metadata'
import { m } from '@/paraglide/messages.js'

export const Route = createFileRoute('/$locale/$signal')({
  beforeLoad: ({ params }) => {
    const signal = worldIdSchema.safeParse(params.signal)
    if (!signal.success) throw notFound()
    return { signal: signal.data }
  },
  head: ({ params }) => {
    const locale = localeSchema.catch('en').parse(params.locale)
    const signal = worldIdSchema.catch('home').parse(params.signal)
    return getRouteMetadata(locale, signal)
  },
  component: EmptyRoute,
  notFoundComponent: SignalNotFound,
})

function EmptyRoute() {
  return null
}

function SignalNotFound() {
  const { locale } = Route.useRouteContext()
  const options = { locale }
  return (
    <main className="protocol-error">
      <div className="protocol-error-card">
        <p className="eyebrow">SIGNAL LOST · 404</p>
        <h1>{m.unknown_transmission_title({}, options)}</h1>
        <p>{m.unknown_transmission_body({}, options)}</p>
        <a className="protocol-return" href={`/${locale}`}>
          {m.return_to_orbit({}, options)}
        </a>
      </div>
    </main>
  )
}
