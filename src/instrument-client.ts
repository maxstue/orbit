import * as Sentry from '@sentry/tanstackstart-react'

import { readOptionalSetting, sentryTraceSampleRate } from '@/lib/observability/config'
import { sanitizeSentryEvent } from '@/lib/observability/privacy'

type TanStackRouter = Parameters<typeof Sentry.tanstackRouterBrowserTracingIntegration>[0]

export function createSentryClient(router: TanStackRouter) {
  const dsn = readOptionalSetting(import.meta.env.VITE_SENTRY_DSN)
  if (!dsn || Sentry.isInitialized()) return

  Sentry.init({
    dsn,
    dataCollection: {
      userInfo: false,
      httpBodies: [],
    },
    enableLogs: true,
    environment:
      readOptionalSetting(import.meta.env.VITE_SENTRY_ENVIRONMENT) ?? import.meta.env.MODE,
    integrations: [Sentry.tanstackRouterBrowserTracingIntegration(router)],
    release: readOptionalSetting(import.meta.env.VITE_SENTRY_RELEASE),
    sendDefaultPii: false,
    tracesSampleRate: sentryTraceSampleRate,
    beforeSend: sanitizeSentryEvent,
    beforeSendTransaction: sanitizeSentryEvent,
  })
}
