import { beforeEach, describe, expect, it, vi } from 'vite-plus/test'

const sentry = vi.hoisted(() => ({
  init: vi.fn(),
  integration: vi.fn(() => ({ name: 'router-tracing' })),
  isInitialized: vi.fn(),
}))

vi.mock('@sentry/tanstackstart-react', () => ({
  init: sentry.init,
  isInitialized: sentry.isInitialized,
  tanstackRouterBrowserTracingIntegration: sentry.integration,
}))

import { createSentryClient } from './instrument-client'

describe('createSentryClient', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.unstubAllEnvs()
    sentry.isInitialized.mockReturnValue(false)
  })

  it('does not initialize Sentry without a DSN', () => {
    vi.stubEnv('VITE_SENTRY_DSN', '')

    createSentryClient({} as never)

    expect(sentry.init).not.toHaveBeenCalled()
    expect(sentry.integration).not.toHaveBeenCalled()
  })

  it('initializes router tracing when a DSN is configured', () => {
    vi.stubEnv('VITE_SENTRY_DSN', 'https://public@example.invalid/1')

    createSentryClient({} as never)

    expect(sentry.integration).toHaveBeenCalledOnce()
    expect(sentry.init).toHaveBeenCalledWith(
      expect.objectContaining({
        dsn: 'https://public@example.invalid/1',
        sendDefaultPii: false,
        tracesSampleRate: 0.05,
      }),
    )
  })
})
