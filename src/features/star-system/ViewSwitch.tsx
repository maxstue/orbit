import { Link } from '@tanstack/react-router'
import { BookOpenText, Orbit } from 'lucide-react'

import { m } from '@/paraglide/messages.js'

import type { Locale, WorldId } from './data/worlds'
import { loadOrbitScene, loadReadingMode, type ViewMode } from './view'

type ViewSwitchProps = {
  locale: Locale
  view: ViewMode
  /** Open transmission in orbit view; carried into reading mode as the section to jump to. */
  signal?: WorldId
}

// Warm the other view's chunk on intent so the switch animation never waits for the network.
const preloadOrbit = () => void loadOrbitScene()
const preloadReading = () => void loadReadingMode()

const exactView = { exact: true, includeSearch: true }

const segmentClassName =
  'flex min-h-11 items-center gap-[7px] px-3 font-mono text-[9px] tracking-[0.1em] text-[var(--dim)] no-underline transition-colors hover:text-[var(--paper)] aria-[current=page]:bg-[var(--lime)] aria-[current=page]:text-[var(--active-control-foreground)] [&_svg]:size-3.5 [&_svg]:shrink-0 [&_svg]:stroke-[1.6]'

export function ViewSwitch({ locale, view, signal }: ViewSwitchProps) {
  const options = { locale }

  return (
    <nav
      className="flex border border-[var(--line)] p-px"
      aria-label={m.view_switch_label({}, options)}
    >
      {/* Router links mark themselves with aria-current="page" when they match the current view. */}
      <Link
        {...(signal
          ? { to: '/$locale/$signal' as const, params: { locale, signal } }
          : { to: '/$locale' as const, params: { locale } })}
        activeOptions={exactView}
        resetScroll={false}
        className={segmentClassName}
        onPointerEnter={preloadOrbit}
        onFocus={preloadOrbit}
      >
        <Orbit aria-hidden="true" />
        <span className="max-[760px]:sr-only">{m.view_orbit({}, options)}</span>
      </Link>
      <Link
        to="/$locale"
        params={{ locale }}
        search={{ view: 'reading' }}
        hash={view === 'orbit' ? signal : undefined}
        activeOptions={exactView}
        resetScroll={false}
        hashScrollIntoView={false}
        className={segmentClassName}
        onPointerEnter={preloadReading}
        onFocus={preloadReading}
      >
        <BookOpenText aria-hidden="true" />
        <span className="max-[760px]:sr-only">{m.view_reading({}, options)}</span>
      </Link>
    </nav>
  )
}

export function LanguageSwitch({ locale, section }: { locale: Locale; section?: WorldId }) {
  return (
    <nav
      className="flex items-center font-mono text-[9px] tracking-[0.1em]"
      aria-label={m.language_switch_label({}, { locale })}
    >
      {(['de', 'en'] as const).map((language, index) => (
        <span className="flex items-center" key={language}>
          {index > 0 && (
            <span className="text-[var(--line)]" aria-hidden="true">
              /
            </span>
          )}
          <Link
            to="/$locale"
            params={{ locale: language }}
            search={{ view: 'reading' }}
            hash={section}
            hrefLang={language}
            lang={language}
            className="grid min-h-11 min-w-9 place-items-center text-[var(--dim)] no-underline transition-colors hover:text-[var(--paper)] aria-[current=page]:text-[var(--lime)]"
          >
            {language.toUpperCase()}
          </Link>
        </span>
      ))}
    </nav>
  )
}
