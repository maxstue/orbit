import { describe, expect, it } from 'vite-plus/test'

import { worlds } from '../data/worlds'
import { getLocalizedPath, getRouteMetadata, socialPreviewUrl } from './metadata'

describe('localized metadata', () => {
  it.each([
    ['en', undefined, '/en'],
    ['de', undefined, '/de'],
    ['en', 'workbench', '/en/workbench'],
    ['de', 'workbench', '/de/workbench'],
  ] as const)('builds the expected localized path for %s/%s', (locale, signal, expectedPath) => {
    expect(getLocalizedPath(locale, signal)).toBe(expectedPath)
  })

  it.each(['en', 'de'] as const)(
    'keeps canonical and alternates aligned for every %s route',
    (locale) => {
      for (const signal of [undefined, ...worlds.map((world) => world.id)]) {
        const metadata = getRouteMetadata(locale, signal)

        expect(metadata.links).toContainEqual({
          rel: 'canonical',
          href: getLocalizedPath(locale, signal),
        })
        expect(metadata.links).toContainEqual({
          rel: 'alternate',
          hrefLang: 'en',
          href: getLocalizedPath('en', signal),
        })
        expect(metadata.links).toContainEqual({
          rel: 'alternate',
          hrefLang: 'de',
          href: getLocalizedPath('de', signal),
        })
        expect(metadata.links).toContainEqual({
          rel: 'alternate',
          hrefLang: 'x-default',
          href: getLocalizedPath('en', signal),
        })
      }
    },
  )

  it('provides localized titles and descriptions', () => {
    const english = getRouteMetadata('en', 'workbench')
    const german = getRouteMetadata('de', 'workbench')

    expect(english.meta[0]?.title).toBe('Workbench — Orbit')
    expect(german.meta[0]?.title).toBe('Werkbank — Orbit')
    expect(english.meta[1]?.content).not.toBe(german.meta[1]?.content)
  })

  it.each(['en', 'de'] as const)('uses the matching Open Graph locale for %s', (locale) => {
    expect(getRouteMetadata(locale).meta).toContainEqual({
      property: 'og:locale',
      content: locale === 'de' ? 'de_DE' : 'en_US',
    })
  })

  it('supplies an absolute social-preview image for Open Graph and Twitter cards', () => {
    const metadata = getRouteMetadata('en', 'home').meta

    expect(metadata).toContainEqual({ property: 'og:image', content: socialPreviewUrl })
    expect(metadata).toContainEqual({ name: 'twitter:image', content: socialPreviewUrl })
  })
})
