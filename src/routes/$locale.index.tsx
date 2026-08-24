import { createFileRoute } from '@tanstack/react-router'
import { ArrowUpRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { worlds } from '@/features/star-system/data/worlds'

export const Route = createFileRoute('/$locale/')({ component: FieldLog })

function FieldLog() {
  const { locale } = Route.useRouteContext()
  const copy =
    locale === 'de'
      ? {
          eyebrow: 'PERSÖNLICHES FELDLOG',
          title: 'Wähle einen Zielplaneten.',
          about: 'ÜBER DIESES SYSTEM',
          hint: 'ZIELE ANTIPPEN · ÜBERTRAGUNGEN FOLGEN IN PHASE 2',
        }
      : {
          eyebrow: 'PERSONAL FIELD LOG',
          title: 'Choose a destination.',
          about: 'ABOUT THIS SYSTEM',
          hint: 'TAP DESTINATIONS · TRANSMISSIONS ARRIVE IN PHASE 2',
        }

  return (
    <main className="field-log">
      <header className="site-header">
        <a className="wordmark" href={`/${locale}`} aria-label="Orbit home">
          max<span>_</span>
        </a>
        <Button variant="outline" size="sm" className="header-action">
          {copy.about}
          <ArrowUpRight aria-hidden="true" className="size-3.5" />
        </Button>
      </header>
      <section className="hero-copy" aria-labelledby="field-log-title">
        <p className="eyebrow">
          <span aria-hidden="true" />
          {copy.eyebrow}
        </p>
        <h1 id="field-log-title">{copy.title}</h1>
      </section>
      <section className="system-map" aria-label="Orbit destinations">
        <div className="system-core" aria-hidden="true">
          <span />
        </div>
        {[1, 2, 3, 4, 5].map((orbit) => (
          <div className={`orbit orbit-${orbit}`} key={orbit} aria-hidden="true" />
        ))}
        {worlds.map((world) => {
          const content = world.copy[locale]
          return (
            <Button
              key={world.id}
              variant="ghost"
              className={`world world-${world.id} world-${world.color} world-${world.size}`}
              aria-label={`${content.title}: ${content.description}`}
            >
              <span className="planet" aria-hidden="true">
                <span className="planet-shine" />
              </span>
              <span className="world-copy">
                <span>{world.signal}</span>
                <strong>{content.title}</strong>
                <small>{content.description}</small>
              </span>
            </Button>
          )
        })}
      </section>
      <footer className="site-footer">
        <span>ORBIT / 001</span>
        <span>{copy.hint}</span>
        <span>52.5200° N · 13.4050° E</span>
      </footer>
    </main>
  )
}
