import {
  HeadContent,
  Scripts,
  createRootRoute,
  useRouterState,
  type ErrorComponentProps,
} from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { getCookie } from '@tanstack/react-start/server'
import { useEffect } from 'react'

import {
  isThemePreference,
  themeCookieName,
  type ThemePreference,
} from '@/features/star-system/theme'
import { Errors } from '@/lib/observability/errors'

import appCss from '../styles.css?url'

const getThemePreference = createServerFn({ method: 'GET' }).handler(() => {
  const preference = getCookie(themeCookieName)
  return isThemePreference(preference) ? preference : 'system'
})

function createThemeBootstrap(preference: ThemePreference) {
  return `(()=>{const p=${JSON.stringify(preference)};const v=p==='system'&&matchMedia('(prefers-color-scheme: light)').matches?'day':p==='system'?'night':p;document.documentElement.dataset.theme=v;document.documentElement.style.colorScheme=v==='day'?'light':'dark'})()`
}

export const Route = createRootRoute({
  loader: () => getThemePreference(),
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        name: 'theme-color',
        content: '#0c1011',
      },
    ],
    links: [
      {
        rel: 'icon',
        type: 'image/svg+xml',
        href: '/favicon.svg',
      },
      {
        rel: 'manifest',
        href: '/site.webmanifest',
      },
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),
  errorComponent: RootError,
  shellComponent: RootDocument,
})

function RootError({ error, reset }: ErrorComponentProps) {
  useEffect(() => Errors.captureRouteError(error), [error])

  return (
    <main className="protocol-error">
      <div className="protocol-error-card">
        <p className="eyebrow">SIGNAL INTERRUPTION</p>
        <h1>Orbit could not establish this connection.</h1>
        <p>Retry the transmission or return to the English field log.</p>
        <button className="protocol-return" type="button" onClick={reset}>
          Retry transmission
        </button>
        <a className="protocol-return" href="/en">
          Return to Orbit
        </a>
      </div>
    </main>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  const themePreference = Route.useLoaderData()
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  const locale = pathname.startsWith('/de') ? 'de' : 'en'

  return (
    <html
      lang={locale}
      data-theme={themePreference === 'day' ? 'day' : 'night'}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: createThemeBootstrap(themePreference) }} />
        <HeadContent />
      </head>
      <body className="min-h-dvh bg-background text-foreground antialiased">
        {children}

        <Scripts />
      </body>
    </html>
  )
}
