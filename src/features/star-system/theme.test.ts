import { describe, expect, it } from 'vite-plus/test'

import { getNextThemePreference, isThemePreference, resolveTheme } from './theme'

describe('theme preferences', () => {
  it('resolves the system preference from the light color-scheme query', () => {
    expect(resolveTheme('system', true)).toBe('day')
    expect(resolveTheme('system', false)).toBe('night')
  })

  it('does not override an explicit preference', () => {
    expect(resolveTheme('night', true)).toBe('night')
    expect(resolveTheme('day', false)).toBe('day')
  })

  it('cycles through system, night, and day', () => {
    expect(getNextThemePreference('system')).toBe('night')
    expect(getNextThemePreference('night')).toBe('day')
    expect(getNextThemePreference('day')).toBe('system')
  })

  it('rejects invalid stored values', () => {
    expect(isThemePreference('day')).toBe(true)
    expect(isThemePreference('sepia')).toBe(false)
    expect(isThemePreference(null)).toBe(false)
  })
})
