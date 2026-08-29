import * as Sentry from '@sentry/tanstackstart-react'

import type { ObjectCursor } from '@/features/star-system/object-cursor'

type ObjectCursorAction = 'activated' | 'deactivated' | 'switched'
type ObjectCursorTrigger = 'escape' | 'object-click'

export const Metrics = {
  captureObjectCursor(
    object: ObjectCursor,
    action: ObjectCursorAction,
    trigger: ObjectCursorTrigger,
  ) {
    if (!Sentry.isInitialized()) return

    Sentry.metrics.count('orbit.easter_egg.object_cursor', 1, {
      attributes: { action, object, trigger },
    })
  },
} as const
