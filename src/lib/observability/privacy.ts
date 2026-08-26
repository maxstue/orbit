const relativeUrlOrigin = 'https://orbit.invalid'

type SanitizableEvent = {
  breadcrumbs?: Array<{ data?: Record<string, unknown> }>
  request?: {
    cookies?: unknown
    data?: unknown
    headers?: unknown
    query_string?: unknown
    url?: string
  }
  user?: unknown
}

export function sanitizeUrl(value: string) {
  try {
    const url = new URL(value, relativeUrlOrigin)
    return url.origin === relativeUrlOrigin ? url.pathname : `${url.origin}${url.pathname}`
  } catch {
    return value.split(/[?#]/, 1)[0]
  }
}

export function sanitizeSentryEvent<T extends SanitizableEvent>(event: T) {
  delete event.user

  if (event.request) {
    if (event.request.url) event.request.url = sanitizeUrl(event.request.url)
    delete event.request.cookies
    delete event.request.data
    delete event.request.headers
    delete event.request.query_string
  }

  for (const breadcrumb of event.breadcrumbs ?? []) {
    if (typeof breadcrumb.data?.url === 'string') {
      breadcrumb.data.url = sanitizeUrl(breadcrumb.data.url)
    }
  }

  return event
}
