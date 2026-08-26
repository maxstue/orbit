import * as Sentry from '@sentry/tanstackstart-react'

type UiDegradation = 'motion-init'

function captureTechnicalError(error: unknown, source: string) {
  if (!Sentry.isInitialized()) return

  Sentry.captureException(error, { tags: { source } })
  Sentry.metrics.count('orbit.technical_error', 1, { attributes: { source } })
}

export const Errors = {
  captureHydrationError(error: unknown) {
    captureTechnicalError(error, 'hydration')
  },

  captureRouteError(error: unknown) {
    captureTechnicalError(error, 'router-error-boundary')
  },

  captureUiDegradation(feature: UiDegradation, error: unknown) {
    captureTechnicalError(error, `ui-degradation:${feature}`)
  },
} as const
