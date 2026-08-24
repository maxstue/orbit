import { createFileRoute } from '@tanstack/react-router'

import { worlds } from '@/features/star-system/data/worlds'

export const Route = createFileRoute('/sitemap.xml')({
  server: {
    handlers: {
      GET: ({ request }) => {
        const origin = new URL(request.url).origin
        const paths = ['en', 'de'].flatMap((locale) => [
          `/${locale}`,
          ...worlds.map((world) => `/${locale}/${world.id}`),
        ])
        const urls = paths.map((path) => `<url><loc>${origin}${path}</loc></url>`).join('')
        const body = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`

        return new Response(body, {
          headers: { 'content-type': 'application/xml; charset=utf-8' },
        })
      },
    },
  },
})
