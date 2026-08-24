import { useEffect } from 'react'
import { ArrowUpRight, Languages } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'

import { Button } from '@/components/ui/button'
import { m } from '@/paraglide/messages.js'

import {
  getAdjacentWorld,
  getWorldByShortcut,
  worlds,
  type Locale,
  type WorldId,
} from './data/worlds'
import { LocalizedLink } from './i18n/LocalizedLink'
import { getWorldCopy } from './i18n/world-copy'
import { TransmissionDialog } from './transmissions/TransmissionDialog'

type FieldLogProps = { locale: Locale; selectedSignal?: WorldId }

export function FieldLog({ locale, selectedSignal }: FieldLogProps) {
  const navigate = useNavigate()
  const otherLocale = locale === 'de' ? 'en' : 'de'
  const options = { locale }

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) return

      if (event.key === 'Escape' && selectedSignal) {
        void navigate({ to: '/$locale', params: { locale } })
        return
      }

      const shortcut = getWorldByShortcut(event.key)
      if (shortcut) {
        void navigate({ to: '/$locale/$signal', params: { locale, signal: shortcut.id } })
        return
      }

      if (selectedSignal && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
        const adjacent = getAdjacentWorld(selectedSignal, event.key === 'ArrowRight' ? 1 : -1)
        if (adjacent) {
          void navigate({ to: '/$locale/$signal', params: { locale, signal: adjacent.id } })
        }
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [locale, navigate, selectedSignal])

  return (
    <main className={`field-log${selectedSignal ? ' has-transmission' : ''}`}>
      <header className="site-header">
        <LocalizedLink locale={locale} className="wordmark" aria-label="Orbit home">
          max<span>_</span>
        </LocalizedLink>
        <div className="header-actions">
          <LocalizedLink
            locale={otherLocale}
            signal={selectedSignal}
            className="language-link"
            aria-label={otherLocale === 'de' ? 'Auf Deutsch wechseln' : 'Switch to English'}
          >
            <Languages aria-hidden="true" />
            {otherLocale === 'de' ? 'Deutsch' : 'English'}
          </LocalizedLink>
          <Button variant="outline" size="sm" className="header-action">
            {m.about_system({}, options)}
            <ArrowUpRight aria-hidden="true" className="size-3.5" />
          </Button>
        </div>
      </header>
      <section className="hero-copy" aria-labelledby="field-log-title">
        <p className="eyebrow">
          <span aria-hidden="true" />
          {m.field_log({}, options)}
        </p>
        <h1 id="field-log-title">{m.choose_destination({}, options)}</h1>
      </section>
      <section className="system-map" aria-label={m.orbit_destinations({}, options)}>
        <div className="system-core" aria-hidden="true">
          <span />
        </div>
        {[1, 2, 3, 4, 5].map((orbit) => (
          <div className={`orbit orbit-${orbit}`} key={orbit} aria-hidden="true" />
        ))}
        {worlds.map((world, index) => {
          const content = getWorldCopy(world.id, locale)
          return (
            <LocalizedLink
              key={world.id}
              locale={locale}
              signal={world.id}
              className={`world world-${world.id} world-${world.color} world-${world.size}${selectedSignal === world.id ? ' is-selected' : ''}`}
              aria-label={`${index + 1}. ${content.title}: ${content.description}`}
            >
              <span className="planet" aria-hidden="true">
                <span className="planet-shine" />
              </span>
              <span className="world-copy">
                <span>
                  {index + 1} · {world.signal}
                </span>
                <strong>{content.title}</strong>
                <small>{content.description}</small>
              </span>
            </LocalizedLink>
          )
        })}
      </section>
      {selectedSignal && <TransmissionDialog locale={locale} signal={selectedSignal} />}
      <footer className="site-footer">
        <span>ORBIT / 002</span>
        <span>{m.navigation_hint({}, options)}</span>
        <span>52.5200° N · 13.4050° E</span>
      </footer>
    </main>
  )
}
