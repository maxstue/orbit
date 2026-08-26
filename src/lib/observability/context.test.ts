import { beforeEach, describe, expect, it, vi } from 'vite-plus/test'

const sentry = vi.hoisted(() => ({
  isInitialized: vi.fn(),
  setTags: vi.fn(),
}))

vi.mock('@sentry/tanstackstart-react', () => ({
  isInitialized: sentry.isInitialized,
  setTags: sentry.setTags,
}))

import { updateObservabilityContext } from './context'

describe('updateObservabilityContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    sentry.isInitialized.mockReturnValue(true)
  })

  it('records route, locale, appearance, and reduced-motion state without user data', () => {
    updateObservabilityContext({
      locale: 'de',
      reducedMotion: true,
      selectedSignal: 'workbench',
      theme: 'day',
    })

    expect(sentry.setTags).toHaveBeenCalledWith({
      locale: 'de',
      reduced_motion: 'enabled',
      route: '/:locale/:signal',
      theme: 'day',
    })
  })

  it('uses the locale route and emits nothing when Sentry is disabled', () => {
    updateObservabilityContext({
      locale: 'en',
      reducedMotion: false,
      theme: 'system',
    })
    expect(sentry.setTags).toHaveBeenCalledWith({
      locale: 'en',
      reduced_motion: 'disabled',
      route: '/:locale',
      theme: 'system',
    })

    sentry.isInitialized.mockReturnValue(false)
    updateObservabilityContext({
      locale: 'en',
      reducedMotion: false,
      theme: 'night',
    })
    expect(sentry.setTags).toHaveBeenCalledTimes(1)
  })
})
