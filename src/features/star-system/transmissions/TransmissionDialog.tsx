import { ArrowLeft, ArrowRight, X } from 'lucide-react'

import { LocalizedLink } from '../i18n/LocalizedLink'
import { getWorldCopy } from '../i18n/world-copy'
import { getAdjacentWorld, type Locale, type WorldId } from '../data/worlds'
import { getTransmission } from './content'
import { m } from '@/paraglide/messages.js'

type TransmissionDialogProps = {
  locale: Locale
  signal: WorldId
}

export function TransmissionDialog({ locale, signal }: TransmissionDialogProps) {
  const transmission = getTransmission(signal, locale)
  const previous = getAdjacentWorld(signal, -1)
  const next = getAdjacentWorld(signal, 1)
  const options = { locale }

  return (
    <aside
      className="transmission"
      role="dialog"
      aria-modal="true"
      aria-labelledby="transmission-title"
    >
      <header className="transmission-header">
        <span>SIGNAL LOCKED · {signal.toUpperCase()}</span>
        <LocalizedLink
          locale={locale}
          className="icon-link"
          aria-label={m.close_transmission({}, options)}
        >
          <X aria-hidden="true" />
        </LocalizedLink>
      </header>
      <article className="transmission-body">
        <p className="transmission-kicker">{transmission.kicker}</p>
        <h2 id="transmission-title">{transmission.title}</h2>
        <p className="transmission-lead">{transmission.lead}</p>
        {transmission.sections.map((section) => (
          <section key={section.heading}>
            <h3>{section.heading}</h3>
            <p>{section.body}</p>
            {section.links && (
              <div className="transmission-links">
                {section.links.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    target={link.external ? '_blank' : undefined}
                    rel={link.external ? 'noreferrer noopener' : undefined}
                  >
                    {link.label}
                    {link.external && <span aria-hidden="true">↗</span>}
                  </a>
                ))}
              </div>
            )}
          </section>
        ))}
      </article>
      <nav className="transmission-nav" aria-label={m.transmission_navigation({}, options)}>
        <LocalizedLink
          locale={locale}
          signal={previous?.id}
          aria-label={m.previous_signal({}, options)}
        >
          <ArrowLeft aria-hidden="true" />
          <span>{previous && getWorldCopy(previous.id, locale).title}</span>
        </LocalizedLink>
        <span>{String(signalIndex(signal)).padStart(2, '0')} / 05</span>
        <LocalizedLink locale={locale} signal={next?.id} aria-label={m.next_signal({}, options)}>
          <span>{next && getWorldCopy(next.id, locale).title}</span>
          <ArrowRight aria-hidden="true" />
        </LocalizedLink>
      </nav>
    </aside>
  )
}

function signalIndex(signal: WorldId) {
  const order: WorldId[] = ['home', 'current', 'workbench', 'side-quests', 'comms']
  return order.indexOf(signal) + 1
}
