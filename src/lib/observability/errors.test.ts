import { beforeEach, describe, expect, it, vi } from 'vite-plus/test'

const sentry = vi.hoisted(() => ({
  captureException: vi.fn(),
  count: vi.fn(),
  isInitialized: vi.fn(),
}))

vi.mock('@sentry/tanstackstart-react', () => ({
  captureException: sentry.captureException,
  isInitialized: sentry.isInitialized,
  metrics: { count: sentry.count },
}))

import { Errors } from './errors'

describe('Errors', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    sentry.isInitialized.mockReturnValue(true)
  })

  it.each([
    ['captureHydrationError', 'hydration'],
    ['captureRouteError', 'router-error-boundary'],
  ] as const)('captures %s with a stable low-cardinality source', (method, source) => {
    const error = new Error('controlled')

    Errors[method](error)

    expect(sentry.captureException).toHaveBeenCalledWith(error, { tags: { source } })
    expect(sentry.count).toHaveBeenCalledWith('orbit.technical_error', 1, {
      attributes: { source },
    })
  })

  it('does not emit before Sentry initializes', () => {
    sentry.isInitialized.mockReturnValue(false)

    Errors.captureRouteError(new Error('controlled'))

    expect(sentry.captureException).not.toHaveBeenCalled()
    expect(sentry.count).not.toHaveBeenCalled()
  })
})
