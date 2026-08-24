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
    <main className="grid min-h-dvh place-items-center px-6 text-center">
      <div>
        <p className="eyebrow">Signal lost</p>
        <h1 className="mt-4 text-5xl font-semibold">Unknown coordinates.</h1>
        <a className="mt-8 inline-block underline underline-offset-4" href="/en">
          Return to Orbit
        </a>
      </div>
    </main>
  )
}
