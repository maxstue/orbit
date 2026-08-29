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
    <main className="grid min-h-dvh place-items-center bg-[radial-gradient(circle_at_50%_30%,#1b2525,var(--space)_68%)] p-6">
      <div className="w-[min(680px,100%)] border border-[var(--line)] p-[clamp(2rem,7vw,5rem)] [&>h1]:my-[1.2rem] [&>h1]:text-[clamp(3rem,9vw,6.5rem)] [&>h1]:leading-[0.88] [&>h1]:tracking-[-0.07em] [&>p]:text-[#a7adab] [&>a]:text-[#a7adab]">
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
