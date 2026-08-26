import * as Sentry from '@sentry/tanstackstart-react'

import type { Locale, WorldId } from '@/features/star-system/data/worlds'
import type { ThemePreference } from '@/features/star-system/theme'

type ObservabilityContext = {
  locale: Locale
  reducedMotion: boolean
  selectedSignal?: WorldId
  theme: ThemePreference
}

export function updateObservabilityContext(context: ObservabilityContext) {
  if (!Sentry.isInitialized()) return

  Sentry.setTags({
    locale: context.locale,
    reduced_motion: context.reducedMotion ? 'enabled' : 'disabled',
    route: context.selectedSignal ? '/:locale/:signal' : '/:locale',
    theme: context.theme,
  })
}
