import { useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'

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

const worldClasses: Record<Exclude<WorldId, 'home'>, string> = {
  current: 'world-now',
  workbench: 'world-work',
  'side-quests': 'world-quests',
  comms: 'world-comms',
}

export function FieldLog({ locale, selectedSignal }: FieldLogProps) {
  const navigate = useNavigate()
  const german = locale === 'de'

  function openSignal(signal: WorldId) {
    void navigate({ to: '/$locale/$signal', params: { locale, signal } })
  }

  function closeTransmission() {
    void navigate({ to: '/$locale', params: { locale } })
  }

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) return

      if (event.key === 'Escape' && selectedSignal) {
        closeTransmission()
        return
      }

      const shortcut = getWorldByShortcut(event.key)
      if (shortcut) {
        openSignal(shortcut.id)
        return
      }

      if (selectedSignal && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
        const adjacent = getAdjacentWorld(selectedSignal, event.key === 'ArrowRight' ? 1 : -1)
        if (adjacent) openSignal(adjacent.id)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  })

  return (
    <main className="system booted">
      <div className="stars stars-a" aria-hidden="true" />
      <div className="stars stars-b" aria-hidden="true" />

      <header className="system-head">
        <LocalizedLink locale={locale} className="wordmark" aria-label="Orbit home">
          max<span>_</span>
        </LocalizedLink>
        <p className="system-status">
          <i aria-hidden="true" /> PERSONAL SYSTEM ONLINE <span>·</span> 49.0069° N / 8.4037° E
        </p>
        <button className="help" type="button" onClick={() => openSignal('home')}>
          ABOUT THIS SYSTEM <kbd>1</kbd>
        </button>
      </header>

      <section
        className="galaxy"
        aria-label={german ? 'Max persönliches Sonnensystem' : "Max's personal solar system"}
      >
        <div className="system-copy">
          <span>PERSONAL HOMEPAGE / LOCAL SYSTEM</span>
          <h1>
            {german ? 'Wähle einen' : 'Choose a'}{' '}
            <em>{german ? 'Zielplaneten.' : 'destination.'}</em>
          </h1>
          <p>
            {german
              ? 'Jeder Orbit trägt ein kleines Stück von mir. Anklicken, Signal öffnen und ein bisschen umsehen.'
              : 'Every orbit carries a small piece of me. Select a planet, open its signal, and look around.'}
          </p>
        </div>

        <div className="orbit orbit-1" aria-hidden="true" />
        <div className="orbit orbit-2" aria-hidden="true" />
        <div className="orbit orbit-3" aria-hidden="true" />

        <button
          className="sun"
          type="button"
          aria-label="Home Signal öffnen"
          onClick={() => openSignal('home')}
        >
          <span>M</span>
          <i aria-hidden="true" />
        </button>

        {worlds.slice(1).map((world, index) => {
          const copy = getWorldCopy(world.id, locale)
          return (
            <button
              className={`world ${worldClasses[world.id as Exclude<WorldId, 'home'>]}`}
              type="button"
              key={world.id}
              aria-label={`${copy.label}: ${copy.description}`}
              onClick={() => openSignal(world.id)}
            >
              <span className="planet">
                <i aria-hidden="true" />
              </span>
              <span className="world-label">
                <small>
                  {String(index + 2).padStart(2, '0')} · {copy.label}
                </small>
                <strong>{copy.title}</strong>
                <em>{german ? 'TRANSMISSION ÖFFNEN ↗' : 'OPEN TRANSMISSION ↗'}</em>
              </span>
              <kbd>{index + 2}</kbd>
            </button>
          )
        })}

        <div className="legend" aria-hidden="true">
          <span>
            <i /> NAVIGIERBAR
          </span>
          <span>
            <i className="live" /> LIVE SIGNAL
          </span>
          <small>{german ? 'TASTEN 1–5 · PLANETEN WÄHLEN' : 'KEYS 1–5 · SELECT PLANETS'}</small>
        </div>
      </section>

      <button
        className={`backdrop${selectedSignal ? ' visible' : ''}`}
        type="button"
        tabIndex={selectedSignal ? 0 : -1}
        aria-label={german ? 'Transmission schließen' : 'Close transmission'}
        onClick={closeTransmission}
      />

      {selectedSignal && (
        <TransmissionDialog
          locale={locale}
          signal={selectedSignal}
          onClose={closeTransmission}
          onSelect={openSignal}
        />
      )}

      <footer className="system-foot">
        <span>MAX.FIELD.LOG © 2026</span>
        <span>CURIOUS &amp; OPERATIONAL</span>
        <span>NO PRODUCTION SYSTEMS WERE HARMED</span>
      </footer>
    </main>
  )
}
