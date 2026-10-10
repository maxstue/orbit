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
      cookies: false,
      httpHeaders: { request: false, response: false },
      httpBodies: [],
      urlQueryParams: false,
      genAI: { inputs: false, outputs: false },
      databaseQueryData: false,
      queues: false,
      graphQL: { document: false, variables: false },
    },
    environment:
      readOptionalSetting(import.meta.env.VITE_SENTRY_ENVIRONMENT) ?? import.meta.env.MODE,
    integrations: [Sentry.tanstackRouterBrowserTracingIntegration(router)],
    release: readOptionalSetting(import.meta.env.VITE_SENTRY_RELEASE),
    tracesSampleRate: sentryTraceSampleRate,
    // Keep transaction sanitization active with Sentry 11.
    traceLifecycle: 'static',
    beforeSend: sanitizeSentryEvent,
    beforeSendTransaction: sanitizeSentryEvent,
  })
}
