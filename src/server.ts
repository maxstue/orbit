import * as Sentry from '@sentry/cloudflare'
import { wrapFetchWithSentry } from '@sentry/tanstackstart-react'
import handler from '@tanstack/react-start/server-entry'

import { readOptionalSetting, sentryTraceSampleRate } from '@/lib/observability/config'
import { sanitizeSentryEvent } from '@/lib/observability/privacy'

const applicationHandler = wrapFetchWithSentry({
  fetch(request) {
    return handler.fetch(request)
  },
})

type RuntimeEnv = Env & { SENTRY_DSN?: string }

const sentryHandler = Sentry.withSentry((env: RuntimeEnv) => {
  const dsn = readOptionalSetting(env.SENTRY_DSN)

  return {
    dsn,
    enabled: Boolean(dsn),
    dataCollection: {
      userInfo: false,
      httpBodies: [],
    },
    enableLogs: true,
    environment:
      readOptionalSetting(import.meta.env.VITE_SENTRY_ENVIRONMENT) ?? import.meta.env.MODE,
    release: readOptionalSetting(import.meta.env.VITE_SENTRY_RELEASE),
    sendDefaultPii: false,
    tracesSampleRate: sentryTraceSampleRate,
    beforeSend: sanitizeSentryEvent,
    beforeSendTransaction: sanitizeSentryEvent,
  }
}, applicationHandler)

export default sentryHandler
