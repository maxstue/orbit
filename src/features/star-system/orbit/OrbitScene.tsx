import { useEffect, useRef, useState } from 'react'
import { useHotkeys, type UseHotkeyDefinition } from '@tanstack/react-hotkeys'
import { Link, useNavigate } from '@tanstack/react-router'
import { AnimatePresence, useIsPresent, useReducedMotion } from 'motion/react'
import * as motionElement from 'motion/react-m'
import { BookOpenText } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Metrics } from '@/lib/observability/metrics'
import { m } from '@/paraglide/messages.js'

import { getAdjacentWorld, worlds, type Locale, type WorldId } from '../data/worlds'
import { getWorldCopy } from '../i18n/world-copy'
import { objectCursorStyles, type ObjectCursor } from '../object-cursor'
import { OrbitalCompanions, Planet } from '../Planet'
import { SpaceDebris } from '../SpaceDebris'
import { TransmissionDialog } from '../transmissions/TransmissionDialog'
import { loadReadingMode } from '../view'

type OrbitSceneProps = {
  locale: Locale
  selectedSignal?: WorldId
  isHydrated: boolean
  /** True when the scene mounts because the visitor switched views (not on first page load). */
  isEntering: boolean
  isThemeMenuOpen: boolean
  onCloseThemeMenu: (options: { restoreFocus: boolean }) => void
}

const orbitalWorlds: Record<
  Exclude<WorldId, 'home'>,
  {
    className: string
    duration: number
    startAngle: number
  }
> = {
  current: { className: 'world-now orbit-1', duration: 54, startAngle: 160 },
  workbench: { className: 'world-work orbit-2', duration: 88, startAngle: 275 },
  'side-quests': { className: 'world-quests orbit-3', duration: 126, startAngle: 8 },
  comms: { className: 'world-comms orbit-2', duration: 88, startAngle: 95 },
}

const worldHotkeys = ['1', '2', '3', '4', '5'] as const

function getOrbitSizeClass(className: string) {
  if (className.includes('orbit-1')) return 'size-[min(28vw,430px)] max-[900px]:size-[45vw]'
  if (className.includes('orbit-2')) return 'size-[min(52vw,780px)] max-[900px]:size-[78vw]'
  return 'size-[min(76vw,1120px)] max-[900px]:size-[115vw]'
}

function OrbitIntro({ locale }: { locale: Locale }) {
  const reduceMotion = useReducedMotion()
  const options = { locale }
  return (
    <motionElement.div
      className="absolute top-[7vh] left-[5vw] z-4 max-w-[390px] max-[900px]:top-[4vh] max-[900px]:left-[7vw]"
      initial={reduceMotion ? false : { opacity: 0, x: -12, filter: 'blur(4px)' }}
      animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
      transition={{
        duration: reduceMotion ? 0 : 1.05,
        delay: reduceMotion ? 0 : 0.28,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      <span className="font-mono text-[9px] font-bold tracking-[0.15em] text-[var(--dim)]">
        {m.field_log({}, options)}
      </span>
      <h1 className="my-[18px] mb-[22px] text-[clamp(3rem,5.2vw,6rem)] leading-[0.86] tracking-[-0.065em] max-[900px]:text-[12vw] max-[620px]:text-[15vw]">
        {m.choose_destination_prefix({}, options)}{' '}
        <em className="text-[var(--coral)] not-italic">
          {m.choose_destination_accent({}, options)}
        </em>
      </h1>
      <p className="max-w-[350px] font-mono text-xs leading-[1.55] text-[#a7adab] max-[620px]:max-w-[78vw]">
        {m.field_intro({}, options)}
      </p>
    </motionElement.div>
  )
}

function OrbitLegend({ locale }: { locale: Locale }) {
  const reduceMotion = useReducedMotion()
  const options = { locale }
  return (
    <motionElement.div
      className="absolute bottom-[4vh] left-[4vw] flex items-center gap-6 font-mono text-[8px] tracking-[0.1em] text-[var(--dim)] max-[900px]:hidden"
      aria-hidden="true"
      initial={reduceMotion ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: reduceMotion ? 0 : 0.98,
        delay: reduceMotion ? 0 : 0.34,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      <span>
        <i className="mr-[7px] inline-block size-[7px] rounded-full bg-[var(--paper)]" />{' '}
        {m.legend_navigable({}, options)}
      </span>
      <span>
        <i className="mr-[7px] inline-block size-[7px] rounded-full bg-[var(--lime)]" />{' '}
        {m.legend_live({}, options)}
      </span>
      <small className="border-l border-[#3b4140] pl-6">{m.legend_hint({}, options)}</small>
    </motionElement.div>
  )
}

/** Planets, debris, the language ship and the transmission dialog – only loaded in orbit view. */
export function OrbitScene({
  locale,
  selectedSignal,
  isHydrated,
  isEntering,
  isThemeMenuOpen,
  onCloseThemeMenu,
}: OrbitSceneProps) {
  const navigate = useNavigate()
  const reduceMotion = useReducedMotion()
  // While the scene leaves for reading mode, close the dialog so it plays its own exit.
  const isPresent = useIsPresent()
  const activeSignal = isPresent ? selectedSignal : undefined
  const options = { locale }
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false)
  const [isChangingLanguage, setIsChangingLanguage] = useState(false)
  const [objectCursor, setObjectCursor] = useState<ObjectCursor>()
  const languageMenu = useRef<HTMLDivElement>(null)
  const languageMenuTrigger = useRef<HTMLButtonElement>(null)
  const languageTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const previouslySelectedSignal = useRef<WorldId | undefined>(selectedSignal)

  function toggleObjectCursor(cursor: ObjectCursor) {
    if (objectCursor === cursor) {
      Metrics.captureObjectCursor(cursor, 'deactivated', 'object-click')
      setObjectCursor(undefined)
      return
    }

    Metrics.captureObjectCursor(cursor, objectCursor ? 'switched' : 'activated', 'object-click')
    setObjectCursor(cursor)
  }

  function openSignal(signal: WorldId) {
    void navigate({
      to: '/$locale/$signal',
      params: { locale, signal },
      resetScroll: false,
    })
  }

  function closeTransmission() {
    void navigate({
      to: '/$locale',
      params: { locale },
      resetScroll: false,
    })
  }

  function closeLanguageMenu({ restoreFocus = false } = {}) {
    setIsLanguageMenuOpen(false)
    if (restoreFocus) languageMenuTrigger.current?.focus()
  }

  function changeLanguage(nextLocale: Locale) {
    if (isChangingLanguage || nextLocale === locale) {
      closeLanguageMenu()
      return
    }

    closeLanguageMenu()
    setIsChangingLanguage(true)

    languageTimer.current = setTimeout(() => {
      if (selectedSignal) {
        void navigate({
          to: '/$locale/$signal',
          params: { locale: nextLocale, signal: selectedSignal },
        })
      } else {
        void navigate({ to: '/$locale', params: { locale: nextLocale } })
      }
      setIsChangingLanguage(false)
    }, 950)
  }

  useEffect(() => () => clearTimeout(languageTimer.current), [])

  useEffect(() => {
    if (objectCursor) {
      const cursor = objectCursorStyles[objectCursor]
      document.documentElement.dataset.orbitCursor = objectCursor
      document.documentElement.style.cursor = cursor
      document.body.style.cursor = cursor
    } else {
      delete document.documentElement.dataset.orbitCursor
      document.documentElement.style.removeProperty('cursor')
      document.body.style.removeProperty('cursor')
    }

    return () => {
      delete document.documentElement.dataset.orbitCursor
      document.documentElement.style.removeProperty('cursor')
      document.body.style.removeProperty('cursor')
    }
  }, [objectCursor])

  useEffect(() => {
    if (selectedSignal) previouslySelectedSignal.current = selectedSignal
  }, [selectedSignal])

  useEffect(() => {
    if (!isLanguageMenuOpen) return

    function closeOnOutsideClick(event: PointerEvent) {
      if (event.target instanceof Node && !languageMenu.current?.contains(event.target)) {
        closeLanguageMenu()
      }
    }

    document.addEventListener('pointerdown', closeOnOutsideClick)
    return () => document.removeEventListener('pointerdown', closeOnOutsideClick)
  }, [isLanguageMenuOpen])

  useHotkeys(
    [
      {
        hotkey: 'Escape',
        callback: () => {
          if (objectCursor) {
            Metrics.captureObjectCursor(objectCursor, 'deactivated', 'escape')
            setObjectCursor(undefined)
            return
          }

          if (isLanguageMenuOpen) {
            closeLanguageMenu({ restoreFocus: true })
            return
          }

          if (isThemeMenuOpen) {
            onCloseThemeMenu({ restoreFocus: true })
            return
          }

          if (selectedSignal) closeTransmission()
        },
        options: {
          enabled:
            isLanguageMenuOpen ||
            isThemeMenuOpen ||
            Boolean(selectedSignal) ||
            Boolean(objectCursor),
        },
      },
      ...worlds.map((world, index): UseHotkeyDefinition => ({
        hotkey: worldHotkeys[index]!,
        callback: () => openSignal(world.id),
      })),
      {
        hotkey: 'ArrowLeft',
        callback: () => {
          if (!selectedSignal) return
          const adjacent = getAdjacentWorld(selectedSignal, -1)
          if (adjacent) openSignal(adjacent.id)
        },
        options: { enabled: Boolean(selectedSignal) },
      },
      {
        hotkey: 'ArrowRight',
        callback: () => {
          if (!selectedSignal) return
          const adjacent = getAdjacentWorld(selectedSignal, 1)
          if (adjacent) openSignal(adjacent.id)
        },
        options: { enabled: Boolean(selectedSignal) },
      },
    ],
    { ignoreInputs: true, enabled: isPresent },
  )

  return (
    <>
      <motionElement.div
        className="pointer-events-none absolute inset-0 z-1"
        exit={{ opacity: 0, transition: { duration: reduceMotion ? 0 : 0.3 } }}
      >
        <SpaceDebris onObjectCursorChange={toggleObjectCursor} />
      </motionElement.div>

      <motionElement.section
        className="relative isolate mx-auto h-[calc(100svh-76px)] w-full max-w-[1600px] max-[620px]:h-[calc(100svh-64px)]"
        aria-label={m.galaxy_label({}, options)}
        initial={reduceMotion ? false : { opacity: 0, scale: 0.68, filter: 'blur(10px)', y: 18 }}
        animate={{ opacity: 1, scale: 1, filter: 'blur(0px)', y: 0 }}
        exit={{
          opacity: 0,
          scale: 0.86,
          filter: 'blur(10px)',
          y: 10,
          transition: { duration: reduceMotion ? 0 : 0.45, ease: [0.7, 0, 0.84, 0] },
        }}
        transition={{
          duration: reduceMotion ? 0 : 1.35,
          ease: [0.16, 1, 0.3, 1],
        }}
      >
        <OrbitIntro locale={locale} />

        <div
          className="orbit orbit-1 absolute top-[52%] left-[59%] -z-1 size-[min(28vw,430px)] -translate-1/2 rounded-full border border-[rgb(242_238_225_/_16%)] max-[900px]:top-[61%] max-[900px]:left-[52%] max-[900px]:size-[45vw]"
          aria-hidden="true"
        />
        <div
          className="orbit orbit-2 absolute top-[52%] left-[59%] -z-1 size-[min(52vw,780px)] -translate-1/2 rounded-full border border-[rgb(242_238_225_/_16%)] max-[900px]:top-[61%] max-[900px]:left-[52%] max-[900px]:size-[78vw]"
          aria-hidden="true"
        />
        <div
          className="orbit orbit-3 absolute top-[52%] left-[59%] -z-1 size-[min(76vw,1120px)] -translate-1/2 rounded-full border border-[rgb(242_238_225_/_16%)] max-[900px]:top-[61%] max-[900px]:left-[52%] max-[900px]:size-[115vw]"
          aria-hidden="true"
        />

        <motionElement.div
          ref={languageMenu}
          className="absolute top-[27%] right-[3vw] z-4 max-[900px]:top-[31%] max-[900px]:right-[4vw] max-[620px]:top-[36%]"
          initial={reduceMotion ? false : { opacity: 0, scale: 0.9, filter: 'blur(3px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          transition={{
            duration: reduceMotion ? 0 : 1,
            delay: reduceMotion ? 0 : 0.32,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          <Button
            ref={languageMenuTrigger}
            className="language-ship group h-auto min-h-11 min-w-11 rounded-none bg-transparent p-0 text-left hover:bg-transparent"
            variant="ghost"
            type="button"
            disabled={!isHydrated || isChangingLanguage}
            aria-label={`${isChangingLanguage ? m.language_ship_processing({}, options) : m.language_ship_ready({}, options)} — ${m.language_ship_label({}, options)}`}
            aria-expanded={isLanguageMenuOpen}
            aria-controls="language-bubble"
            aria-haspopup="menu"
            aria-busy={isChangingLanguage}
            onClick={() => setIsLanguageMenuOpen((open) => !open)}
          >
            <span
              className="ship-body relative block h-6 w-[76px] rounded-[50%] border border-[var(--cyan)] bg-[#273839] transition-all duration-250"
              aria-hidden="true"
            >
              <i className="ship-dome absolute bottom-[13px] left-1/2 h-[21px] w-[31px] -translate-x-1/2 rounded-t-[30px] border border-b-0 border-[var(--cyan)] bg-[rgb(90_217_210_/_14%)]" />
              <i className="ship-beam absolute top-[23px] left-1/2 h-0 w-[42px] -translate-x-1/2 border-x-[12px] border-b-[42px] border-x-transparent border-b-transparent opacity-0 transition-all duration-250" />
            </span>
            <span className="ml-3 flex min-w-32 flex-col gap-1 font-mono text-[8px] tracking-[0.12em]">
              <strong className="font-normal text-[var(--cyan)]">
                {isChangingLanguage
                  ? m.language_ship_processing({}, options)
                  : m.language_ship_ready({}, options)}
              </strong>
              <i
                className={`language-progress block h-0.5 w-full overflow-hidden bg-[rgb(242_238_225_/_14%)]${isChangingLanguage ? ' active' : ''}`}
              />
            </span>
          </Button>

          {isLanguageMenuOpen && (
            <div
              id="language-bubble"
              className="language-bubble absolute top-[calc(100%+22px)] left-[38px] w-52 -translate-x-1/2 border border-[rgb(242_238_225_/_45%)] bg-[#151b1c] p-3 shadow-[8px_10px_0_rgb(0_0_0_/_30%)]"
              role="menu"
              aria-label={m.language_choose({}, options)}
            >
              <p className="mb-2 font-mono text-[8px] tracking-[0.13em] text-[var(--dim)]">
                {m.language_choose({}, options)}
              </p>
              <p className="mb-3 border-l-2 border-[var(--coral)] pl-2 font-mono text-[7px] leading-relaxed text-[#a7adab]">
                {m.language_alien_note({}, options)}
              </p>
              {(['de', 'en'] as const).map((language) => (
                <Button
                  className="flex min-h-11 w-full justify-between rounded-none border-t border-[var(--line)] px-2 font-mono text-[9px] tracking-[0.1em] hover:bg-[rgb(90_217_210_/_8%)]"
                  variant="ghost"
                  type="button"
                  role="menuitemradio"
                  aria-checked={locale === language}
                  key={language}
                  onClick={() => changeLanguage(language)}
                >
                  <span>
                    {language === 'de'
                      ? m.language_german({}, options)
                      : m.language_english({}, options)}
                  </span>
                  {locale === language ? (
                    <small className="ml-2 text-right text-[7px] text-[var(--lime)]">
                      {m.language_current({}, options)}
                    </small>
                  ) : (
                    <small
                      className="alien-decoder relative ml-2 h-[18px] w-[76px] overflow-hidden border border-[rgb(90_217_210_/_28%)] text-[var(--cyan)] shadow-[inset_0_0_8px_rgb(90_217_210_/_7%)]"
                      aria-hidden="true"
                    >
                      <span className="alien-glyphs absolute inset-0 grid place-items-center font-mono text-[7px] tracking-[0.05em] whitespace-nowrap">
                        ⌁ ⋔ ⟟ ◬ ∷ ⌬
                      </span>
                      <span className="alien-decoding absolute inset-0 grid place-items-center font-mono text-[7px] tracking-[0.05em] whitespace-nowrap text-[var(--lime)] opacity-0">
                        DECODING
                      </span>
                    </small>
                  )}
                </Button>
              ))}
            </div>
          )}
        </motionElement.div>

        <Button
          className={`sun absolute top-[52%] left-[59%] z-3 grid size-[115px] -translate-1/2 place-items-center rounded-full border-0 bg-transparent p-0 transition-transform duration-250 [--planet-size:115px] hover:scale-[1.08] hover:bg-transparent focus-visible:scale-[1.08] max-[900px]:top-[61%] max-[900px]:left-[52%] max-[900px]:size-[85px] max-[900px]:[--planet-size:85px] max-[620px]:top-[67%] max-[620px]:size-[72px] max-[620px]:[--planet-size:72px]${activeSignal === 'home' ? ' signal-selected' : ''}`}
          data-signal="home"
          variant="ghost"
          type="button"
          aria-label={m.home_signal_label({}, options)}
          onClick={() => openSignal('home')}
        >
          <Planet worldId="home" />
        </Button>

        {worlds.slice(1).map((world, index) => {
          const copy = getWorldCopy(world.id, locale)
          const orbit = orbitalWorlds[world.id as Exclude<WorldId, 'home'>]
          const orbitRotation = reduceMotion
            ? orbit.startAngle
            : [orbit.startAngle, orbit.startAngle + 360]
          const planetRotation = reduceMotion
            ? -orbit.startAngle
            : [-orbit.startAngle, -orbit.startAngle - 360]
          const orbitTransition = reduceMotion
            ? undefined
            : { duration: orbit.duration, ease: 'linear' as const, repeat: Infinity }
          const orbitSizeClass = getOrbitSizeClass(orbit.className)

          return (
            <div
              className={`pointer-events-none absolute top-[52%] left-[59%] -translate-1/2 max-[900px]:top-[61%] max-[900px]:left-[52%] max-[620px]:top-[67%] ${orbitSizeClass}`}
              key={world.id}
              aria-hidden="false"
            >
              <motionElement.div
                className="absolute inset-0"
                initial={{ rotate: orbit.startAngle }}
                animate={{ rotate: orbitRotation }}
                transition={orbitTransition}
              >
                <div className="pointer-events-auto absolute top-1/2 left-full -translate-1/2">
                  <motionElement.div
                    initial={{ rotate: -orbit.startAngle }}
                    animate={{ rotate: planetRotation }}
                    transition={orbitTransition}
                  >
                    <Button
                      className={`world group relative z-3 h-auto rounded-none border-0 bg-transparent p-0 text-left hover:bg-transparent [@media(pointer:coarse)]:min-h-11 [@media(pointer:coarse)]:min-w-11 ${orbit.className.split(' ')[0]}${activeSignal === world.id ? ' signal-selected' : ''}`}
                      data-signal={world.id}
                      variant="ghost"
                      type="button"
                      aria-label={`${copy.label}: ${copy.description} — ${String(index + 2).padStart(2, '0')} · ${copy.label} ${copy.title} ${m.open_transmission({}, options)}`}
                      onClick={() => openSignal(world.id)}
                    >
                      <Planet worldId={world.id} showCompanions={false} />
                      <motionElement.span
                        className={`world-label pointer-events-none absolute top-1/2 flex w-[210px] -translate-y-1/2 flex-col gap-1 max-[900px]:hidden ${world.id === 'comms' ? 'right-[calc(100%+23px)] text-right' : 'left-[calc(100%+24px)]'}`}
                        initial={
                          reduceMotion ? false : { opacity: 0, x: world.id === 'comms' ? 8 : -8 }
                        }
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          duration: reduceMotion ? 0 : 0.96,
                          delay: reduceMotion ? 0 : 0.3 + index * 0.02,
                          ease: [0.16, 1, 0.3, 1],
                        }}
                      >
                        <small className="font-mono text-[8px] tracking-[0.12em] text-[var(--dim)]">
                          {String(index + 2).padStart(2, '0')} · {copy.label}
                        </small>{' '}
                        <strong className="text-[15px]">{copy.title}</strong>{' '}
                        <em className="-translate-x-1.5 font-mono text-[8px] tracking-[0.12em] text-[var(--cyan)] not-italic opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100">
                          {m.open_transmission({}, options)}
                        </em>
                      </motionElement.span>
                    </Button>
                    <OrbitalCompanions
                      worldId={world.id}
                      onObjectCursorChange={isHydrated ? toggleObjectCursor : undefined}
                      satelliteLabel={
                        locale === 'de' ? 'Satelliten-Cursor verwenden' : 'Use satellite cursor'
                      }
                    />
                  </motionElement.div>
                </div>
              </motionElement.div>
            </div>
          )
        })}

        <OrbitLegend locale={locale} />
      </motionElement.section>

      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {activeSignal
          ? m.transmission_opened({ signal: getWorldCopy(activeSignal, locale).label }, options)
          : ''}
      </p>

      <Button
        className={`backdrop fixed inset-0 z-20 h-auto rounded-none border-0 bg-[rgb(2_5_6_/_76%)] transition-opacity duration-[240ms] hover:bg-[rgb(2_5_6_/_76%)] ${activeSignal ? 'visible pointer-events-auto opacity-100' : 'invisible pointer-events-none opacity-0'}`}
        variant="ghost"
        type="button"
        tabIndex={-1}
        aria-label={m.close_transmission({}, options)}
        onClick={closeTransmission}
      />

      <AnimatePresence
        initial={isEntering}
        onExitComplete={() => {
          if (selectedSignal || !isPresent) return
          const signal = previouslySelectedSignal.current
          document.querySelector<HTMLElement>(`[data-signal="${signal}"]`)?.focus()
        }}
      >
        {activeSignal && (
          <TransmissionDialog
            key="transmission"
            locale={locale}
            signal={activeSignal}
            onClose={closeTransmission}
            onSelect={openSignal}
            headerAction={
              <Link
                to="/$locale"
                params={{ locale }}
                search={{ view: 'reading' }}
                hash={activeSignal}
                resetScroll={false}
                hashScrollIntoView={false}
                className="inline-flex min-h-11 min-w-11 items-center justify-center gap-[7px] text-[var(--cyan)] no-underline transition-colors hover:text-[var(--paper)] [&_svg]:size-3.5 [&_svg]:shrink-0 [&_svg]:stroke-[1.6]"
                onPointerEnter={() => void loadReadingMode()}
                onFocus={() => void loadReadingMode()}
              >
                <BookOpenText aria-hidden="true" />
                <span className="max-[620px]:sr-only">{m.view_reading({}, options)}</span>
              </Link>
            }
          />
        )}
      </AnimatePresence>
    </>
  )
}
