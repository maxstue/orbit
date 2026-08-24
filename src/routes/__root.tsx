import { HeadContent, Scripts, createRootRoute, useRouterState } from '@tanstack/react-router'

import appCss from '../styles.css?url'

export const Route = createRootRoute({
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
        title: 'Orbit — Max Field Log',
      },
      {
        name: 'description',
        content: 'A personal field log for work, experiments, and side quests.',
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
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  const locale = pathname.startsWith('/de') ? 'de' : 'en'

  return (
    <html lang={locale} className="dark">
      <head>
        <HeadContent />
      </head>
      <body className="min-h-dvh bg-background text-foreground antialiased">
        {children}

        <Scripts />
      </body>
    </html>
  )
}
