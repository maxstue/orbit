import { describe, expect, it } from 'vite-plus/test'

import { sanitizeSentryEvent, sanitizeUrl } from './privacy'

describe('observability privacy', () => {
  it('removes query strings and fragments without changing route paths', () => {
    expect(sanitizeUrl('https://orbit.example/de/workbench?token=secret#details')).toBe(
      'https://orbit.example/de/workbench',
    )
    expect(sanitizeUrl('/en/current?source=private')).toBe('/en/current')
  })

  it('removes identity, request payload, cookies, headers, and query data', () => {
    const event = sanitizeSentryEvent({
      user: { email: 'private@example.test' },
      request: {
        url: 'https://orbit.example/en?token=secret',
        cookies: { session: 'secret' },
        data: { freeText: 'private' },
        headers: { cookie: 'session=secret' },
        query_string: 'token=secret',
      },
    })

    expect(event).toEqual({ request: { url: 'https://orbit.example/en' } })
  })

  it('sanitizes breadcrumb URLs', () => {
    const event = sanitizeSentryEvent({
      breadcrumbs: [{ data: { url: '/de/comms?message=private' } }],
    })

    expect(event.breadcrumbs?.[0]?.data?.url).toBe('/de/comms')
  })
})
