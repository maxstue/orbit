import { beforeEach, describe, expect, it, vi } from 'vite-plus/test'

const sentry = vi.hoisted(() => ({
  count: vi.fn(),
  isInitialized: vi.fn(),
}))

vi.mock('@sentry/tanstackstart-react', () => ({
  isInitialized: sentry.isInitialized,
  metrics: { count: sentry.count },
}))

import { Metrics } from './metrics'

describe('Metrics', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    sentry.isInitialized.mockReturnValue(true)
  })

  it('counts an Easter egg interaction with low-cardinality attributes', () => {
    Metrics.captureObjectCursor('satellite', 'activated', 'object-click')

    expect(sentry.count).toHaveBeenCalledWith('orbit.easter_egg.object_cursor', 1, {
      attributes: {
        action: 'activated',
        object: 'satellite',
        trigger: 'object-click',
      },
    })
  })

  it('does not emit before Sentry initializes', () => {
    sentry.isInitialized.mockReturnValue(false)

    Metrics.captureObjectCursor('meteor', 'activated', 'object-click')

    expect(sentry.count).not.toHaveBeenCalled()
  })
})
