import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vite-plus/test'

function readCatalog(locale: 'en' | 'de') {
  const path = new URL(`../../../../messages/${locale}.json`, import.meta.url)
  return JSON.parse(readFileSync(path, 'utf8')) as Record<string, string>
}

describe('message catalogs', () => {
  it('contain identical translation keys', () => {
    const englishKeys = Object.keys(readCatalog('en')).sort()
    const germanKeys = Object.keys(readCatalog('de')).sort()

    expect(germanKeys).toEqual(englishKeys)
  })

  it('contain no empty translations', () => {
    for (const catalog of [readCatalog('en'), readCatalog('de')]) {
      expect(Object.values(catalog).every((message) => message.trim().length > 0)).toBe(true)
    }
  })
})
