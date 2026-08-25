import { HeadContent, Scripts, createRootRoute, useRouterState } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { getCookie } from '@tanstack/react-start/server'

import {
  isThemePreference,
  themeCookieName,
  type ThemePreference,
} from '@/features/star-system/theme'

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
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),
  shellComponent: RootDocument,
})

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
