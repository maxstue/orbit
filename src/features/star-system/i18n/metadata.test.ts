import { describe, expect, it } from 'vite-plus/test'

import { getLocalizedPath, getRouteMetadata } from './metadata'

describe('localized metadata', () => {
  it('keeps the signal when changing locale', () => {
    expect(getLocalizedPath('de', 'workbench')).toBe('/de/workbench')
    expect(getLocalizedPath('en', 'workbench')).toBe('/en/workbench')
  })

  it('uses a matching canonical and language alternates', () => {
    const metadata = getRouteMetadata('de', 'side-quests')

    expect(metadata.links).toContainEqual({ rel: 'canonical', href: '/de/side-quests' })
    expect(metadata.links).toContainEqual({
      rel: 'alternate',
      hrefLang: 'x-default',
      href: '/en/side-quests',
    })
  })

  it('provides localized titles and descriptions', () => {
    const english = getRouteMetadata('en', 'workbench')
    const german = getRouteMetadata('de', 'workbench')

    expect(english.meta[0]?.title).toBe('Workbench — Orbit')
    expect(german.meta[0]?.title).toBe('Werkbank — Orbit')
    expect(english.meta[1]?.content).not.toBe(german.meta[1]?.content)
  })
})
