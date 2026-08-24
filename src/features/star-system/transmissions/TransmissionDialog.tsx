import { worlds, type Locale, type WorldId } from '../data/worlds'
import { getWorldCopy } from '../i18n/world-copy'
import { getTransmission } from './content'

type TransmissionDialogProps = {
  locale: Locale
  signal: WorldId
  onClose: () => void
  onSelect: (signal: WorldId) => void
}

const planetClasses: Record<WorldId, string> = {
  home: 'world-home',
  current: 'world-now',
  workbench: 'world-work',
  'side-quests': 'world-quests',
  comms: 'world-comms',
}

export function TransmissionDialog({ locale, signal, onClose, onSelect }: TransmissionDialogProps) {
  const transmission = getTransmission(signal, locale)
  const activeIndex = worlds.findIndex((world) => world.id === signal)
  const previous = worlds[(activeIndex - 1 + worlds.length) % worlds.length]
  const next = worlds[(activeIndex + 1) % worlds.length]
  const german = locale === 'de'

  return (
    <aside
      className="transmission open"
      role="dialog"
      aria-modal="true"
      aria-labelledby="transmission-title"
    >
      <div className="scanline" aria-hidden="true" />
      <header className="transmission-head">
        <div>
          <i className="rx-dot" aria-hidden="true" /> INCOMING TRANSMISSION
        </div>
        <span>{transmission.channel}</span>
        <button
          type="button"
          onClick={onClose}
          aria-label={german ? 'Transmission schließen' : 'Close transmission'}
        >
          DISCONNECT <kbd>ESC</kbd>
        </button>
      </header>

      <div className="transmission-body">
        <div className="avatar-signal" aria-hidden="true">
          <div className={`signal-planet ${planetClasses[signal]}`}>
            <span />
          </div>
          <div className="wave">▂▅▃▇▂▆▁▅▃▇▂▆▁▃▇▅▂▆</div>
          <small>SIGNAL LOCKED · QUALITY 98%</small>
        </div>

        <article>
          <p className="channel-label">{transmission.kicker}</p>
          <h2 id="transmission-title">{transmission.title}</h2>
          <p className="lead">{transmission.lead}</p>
          <dl>
            {transmission.details.map((detail) => (
              <div key={detail.label}>
                <dt>{detail.label}</dt>
                <dd>{detail.href ? <a href={detail.href}>{detail.value}</a> : detail.value}</dd>
              </div>
            ))}
          </dl>
          <blockquote>{transmission.quote}</blockquote>
        </article>
      </div>

      <nav
        className="transmission-foot"
        aria-label={german ? 'Transmissionen navigieren' : 'Transmission navigation'}
      >
        <button type="button" onClick={() => onSelect(previous.id)}>
          ← PREVIOUS SIGNAL
        </button>
        <div>
          {worlds.map((world, index) => (
            <button
              className={world.id === signal ? 'active' : undefined}
              type="button"
              key={world.id}
              aria-label={`${getWorldCopy(world.id, locale).label} öffnen`}
              onClick={() => onSelect(world.id)}
            >
              {String(index + 1).padStart(2, '0')}
            </button>
          ))}
        </div>
        <button type="button" onClick={() => onSelect(next.id)}>
          NEXT SIGNAL →
        </button>
      </nav>
    </aside>
  )
}
