import { m } from '@/paraglide/messages.js'

import { getTransmission } from '../transmissions/content'
import type { Locale, WorldId } from '../data/worlds'

export const siteOrigin = 'https://me.justmax.xyz'
export const socialPreviewUrl = `${siteOrigin}/social-preview.png`

export function getLocalizedPath(locale: Locale, signal?: WorldId) {
  return `/${locale}${signal ? `/${signal}` : ''}`
}

export function getRouteMetadata(locale: Locale, signal?: WorldId) {
  const options = { locale }
  const path = getLocalizedPath(locale, signal)
  const transmission = signal ? getTransmission(signal, locale) : undefined
  const signalTitle = signal
    ? {
        home: m.world_home_title({}, options),
        current: m.world_current_title({}, options),
        workbench: m.world_workbench_title({}, options),
        'side-quests': m.world_side_quests_title({}, options),
        comms: m.world_comms_title({}, options),
      }[signal]
    : undefined
  const title = signalTitle ? `${signalTitle} — Orbit` : m.meta_home_title({}, options)
  const description = transmission?.lead ?? m.meta_home_description({}, options)

  return {
    meta: [
      { title },
      { name: 'description', content: description },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:type', content: 'website' },
      { property: 'og:locale', content: locale === 'de' ? 'de_DE' : 'en_US' },
      { property: 'og:url', content: `${siteOrigin}${path}` },
      { property: 'og:image', content: socialPreviewUrl },
      { property: 'og:image:width', content: '1731' },
      { property: 'og:image:height', content: '909' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image', content: socialPreviewUrl },
    ],
    links: [
      { rel: 'canonical', href: path },
      { rel: 'alternate', hrefLang: 'en', href: getLocalizedPath('en', signal) },
      { rel: 'alternate', hrefLang: 'de', href: getLocalizedPath('de', signal) },
      { rel: 'alternate', hrefLang: 'x-default', href: getLocalizedPath('en', signal) },
    ],
  }
}
