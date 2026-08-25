import { HeadContent, Scripts, createRootRoute, useRouterState } from '@tanstack/react-router'

import appCss from '../styles.css?url'

const themeBootstrap = `(()=>{try{const p=localStorage.getItem('orbit-theme');const v=p==='day'||p==='night'?p:matchMedia('(prefers-color-scheme: light)').matches?'day':'night';document.documentElement.dataset.theme=v;document.documentElement.style.colorScheme=v==='day'?'light':'dark'}catch{}})()`

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
    <html lang={locale} data-theme="night" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
        <HeadContent />
      </head>
      <body className="min-h-dvh bg-background text-foreground antialiased">
        {children}

        <Scripts />
      </body>
    </html>
  )
}
