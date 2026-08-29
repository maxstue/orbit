import { useEffect, useRef, useState } from 'react'
import { useHotkeys, type UseHotkeyDefinition } from '@tanstack/react-hotkeys'
import { useNavigate } from '@tanstack/react-router'
import { AnimatePresence, LazyMotion } from 'motion/react'
import { MonitorCog, MoonStar, Sun } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { updateObservabilityContext } from '@/lib/observability/context'
import { Errors } from '@/lib/observability/errors'
import { m } from '@/paraglide/messages.js'

import { getAdjacentWorld, worlds, type Locale, type WorldId } from './data/worlds'
import { LocalizedLink } from './i18n/LocalizedLink'
import { getWorldCopy } from './i18n/world-copy'
import { Planet } from './Planet'
import { TransmissionDialog } from './transmissions/TransmissionDialog'
import {
  createThemeCookie,
  readThemePreferenceFromCookie,
  resolveTheme,
  type ThemePreference,
} from './theme'

type FieldLogProps = { locale: Locale; selectedSignal?: WorldId }

const worldClasses: Record<Exclude<WorldId, 'home'>, string> = {
  current:
    'world-now top-[52%] left-[31%] max-[900px]:top-[55%] max-[900px]:left-[13%] max-[620px]:top-[62%] max-[620px]:left-[8%] max-[620px]:-m-[3px] max-[620px]:p-[3px]',
  workbench:
    'world-work top-[14%] left-[59%] max-[900px]:top-[39%] max-[900px]:left-[46%] max-[620px]:top-[46%] max-[620px]:left-[42%]',
  'side-quests':
    'world-quests top-[43%] right-[12%] max-[900px]:top-[58%] max-[900px]:right-[4%] max-[620px]:top-[64%] max-[620px]:right-[2%]',
  comms:
    'world-comms bottom-[7%] left-[54%] max-[900px]:left-[44%] max-[620px]:bottom-[4%] max-[620px]:left-[43%] max-[620px]:-m-[3px] max-[620px]:p-[3px]',
}

const loadMotionFeatures = () =>
  import('./transmissions/motion-features').then((module) => module.default)

const worldHotkeys = ['1', '2', '3', '4', '5'] as const

export function FieldLog({ locale, selectedSignal }: FieldLogProps) {
  const navigate = useNavigate()
  const options = { locale }
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false)
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false)
  const [isChangingLanguage, setIsChangingLanguage] = useState(false)
  const [themePreference, setThemePreference] = useState<ThemePreference>('system')
  const languageMenu = useRef<HTMLDivElement>(null)
  const themeMenu = useRef<HTMLDivElement>(null)
  const languageMenuTrigger = useRef<HTMLButtonElement>(null)
  const themeMenuTrigger = useRef<HTMLButtonElement>(null)
  const languageTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const focusTimer = useRef<number | undefined>(undefined)
  const previouslySelectedSignal = useRef<WorldId | undefined>(selectedSignal)
  const hasLoadedTheme = useRef(false)

  function openSignal(signal: WorldId) {
    void navigate({ to: '/$locale/$signal', params: { locale, signal } })
  }

  function closeTransmission() {
    void navigate({ to: '/$locale', params: { locale } })
  }

  function closeLanguageMenu({ restoreFocus = false } = {}) {
    setIsLanguageMenuOpen(false)
    if (restoreFocus) languageMenuTrigger.current?.focus()
  }

  function closeThemeMenu({ restoreFocus = false } = {}) {
    setIsThemeMenuOpen(false)
    if (restoreFocus) themeMenuTrigger.current?.focus()
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
    const closingSignal = previouslySelectedSignal.current
    previouslySelectedSignal.current = selectedSignal

    if (selectedSignal || !closingSignal) return

    focusTimer.current = window.setTimeout(() => {
      document.querySelector<HTMLElement>(`[data-signal="${closingSignal}"]`)?.focus()
    }, 260)

    return () => clearTimeout(focusTimer.current)
  }, [selectedSignal])

  useEffect(() => {
    const preloadMotion = () => {
      void loadMotionFeatures().catch((error: unknown) =>
        Errors.captureUiDegradation('motion-init', error),
      )
    }
    const idleCallback = window.requestIdleCallback?.(preloadMotion)
    if (idleCallback === undefined) {
      const timer = window.setTimeout(preloadMotion, 250)
      return () => window.clearTimeout(timer)
    }
    return () => window.cancelIdleCallback(idleCallback)
  }, [])

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const updateContext = () =>
      updateObservabilityContext({
        locale,
        reducedMotion: reducedMotion.matches,
        selectedSignal,
        theme: themePreference,
      })

    updateContext()
    reducedMotion.addEventListener('change', updateContext)
    return () => reducedMotion.removeEventListener('change', updateContext)
  }, [locale, selectedSignal, themePreference])

  useEffect(() => {
    if (!hasLoadedTheme.current) {
      hasLoadedTheme.current = true
      const storedPreference = readThemePreferenceFromCookie(document.cookie)
      if (storedPreference && storedPreference !== themePreference) {
        setThemePreference(storedPreference)
        return
      }
    }

    const colorScheme = window.matchMedia('(prefers-color-scheme: light)')

    function applyTheme() {
      const theme = resolveTheme(themePreference, colorScheme.matches)
      document.documentElement.dataset.theme = theme
      document.documentElement.style.colorScheme = theme === 'day' ? 'light' : 'dark'
    }

    applyTheme()
    colorScheme.addEventListener('change', applyTheme)
    return () => colorScheme.removeEventListener('change', applyTheme)
  }, [themePreference])

  function getThemeLabel(preference: ThemePreference) {
    if (preference === 'day') return m.theme_day({}, options)
    if (preference === 'night') return m.theme_night({}, options)
    return m.theme_system({}, options)
  }

  function changeTheme(nextPreference: ThemePreference) {
    document.cookie = createThemeCookie(nextPreference)
    setThemePreference(nextPreference)
    closeThemeMenu({ restoreFocus: true })
  }

  useEffect(() => {
    if (!isLanguageMenuOpen && !isThemeMenuOpen) return

    function closeOnOutsideClick(event: PointerEvent) {
      if (event.target instanceof Node && !languageMenu.current?.contains(event.target)) {
        closeLanguageMenu()
      }
      if (event.target instanceof Node && !themeMenu.current?.contains(event.target)) {
        closeThemeMenu()
      }
    }

    document.addEventListener('pointerdown', closeOnOutsideClick)
    return () => document.removeEventListener('pointerdown', closeOnOutsideClick)
  }, [isLanguageMenuOpen, isThemeMenuOpen])

  useHotkeys(
    [
      {
        hotkey: 'Escape',
        callback: () => {
          if (isLanguageMenuOpen) {
            closeLanguageMenu({ restoreFocus: true })
            return
          }

          if (isThemeMenuOpen) {
            closeThemeMenu({ restoreFocus: true })
            return
          }

          if (selectedSignal) closeTransmission()
        },
        options: {
          enabled: isLanguageMenuOpen || isThemeMenuOpen || Boolean(selectedSignal),
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
    { ignoreInputs: true },
  )

  return (
    <main className="system booted relative min-h-svh overflow-hidden bg-[radial-gradient(circle_at_52%_47%,#1b2525_0,#101617_26%,var(--space)_68%)] text-[var(--paper)]">
      <div className="stars-a pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="stars-b pointer-events-none absolute inset-0 opacity-40" aria-hidden="true" />

      <header className="relative z-5 grid h-19 grid-cols-[1fr_auto_1fr] items-center border-b border-[var(--line)] px-[3vw] max-[900px]:grid-cols-[1fr_auto] max-[620px]:h-16">
        <LocalizedLink
          locale={locale}
          className="font-mono text-[21px] font-black no-underline [&>span]:text-[var(--coral)]"
          aria-label="Orbit home"
        >
          max<span>_</span>
        </LocalizedLink>
        <p className="font-mono text-[9px] tracking-[0.12em] text-[var(--dim)] max-[900px]:hidden">
          <i
            className="mr-[9px] inline-block size-[7px] rounded-full bg-[var(--lime)] shadow-[0_0_0_5px_rgb(220_239_104_/_10%)]"
            aria-hidden="true"
          />{' '}
          {m.system_status({}, options)}
        </p>
        <div className="flex items-center justify-self-end gap-5">
          <div className="relative" ref={themeMenu}>
            <Button
              ref={themeMenuTrigger}
              className="h-auto min-h-11 min-w-11 gap-[7px] rounded-none px-0 py-0 font-mono text-[9px] tracking-[0.1em] hover:bg-transparent [&_svg]:size-3.5 [&_svg]:stroke-[1.6]"
              variant="ghost"
              type="button"
              aria-label={m.theme_switch_label({}, options)}
              aria-expanded={isThemeMenuOpen}
              aria-controls="theme-menu"
              aria-haspopup="menu"
              title={m.theme_current({ theme: getThemeLabel(themePreference) }, options)}
              onClick={() => setIsThemeMenuOpen((open) => !open)}
            >
              {themePreference === 'system' ? (
                <MonitorCog aria-hidden="true" />
              ) : themePreference === 'night' ? (
                <MoonStar aria-hidden="true" />
              ) : (
                <Sun aria-hidden="true" />
              )}
              <span className="max-[760px]:hidden">{getThemeLabel(themePreference)}</span>
              <span aria-hidden="true">⌄</span>
            </Button>
            {isThemeMenuOpen && (
              <div
                id="theme-menu"
                className="theme-menu absolute top-[calc(100%+18px)] right-0 z-10 w-44 border border-[var(--line)] bg-[var(--space)] p-2 shadow-[7px_8px_0_rgb(0_0_0_/_18%)]"
                role="menu"
                aria-label={m.theme_choose({}, options)}
              >
                <p className="px-2 pt-1 pb-2 font-mono text-[8px] tracking-[0.13em] text-[var(--dim)]">
                  {m.theme_choose({}, options)}
                </p>
                {(['system', 'night', 'day'] as const).map((preference) => (
                  <Button
                    className="flex min-h-11 w-full justify-between rounded-none border-t border-[var(--line)] px-2 font-mono text-[9px] tracking-[0.1em] hover:bg-[rgb(90_217_210_/_8%)]"
                    variant="ghost"
                    type="button"
                    role="menuitemradio"
                    aria-checked={themePreference === preference}
                    key={preference}
                    onClick={() => changeTheme(preference)}
                  >
                    {getThemeLabel(preference)}
                    {themePreference === preference && (
                      <small className="text-[7px] text-[var(--lime)]">
                        {m.theme_active({}, options)}
                      </small>
                    )}
                  </Button>
                ))}
              </div>
            )}
          </div>
          <Button
            className="h-auto min-h-11 rounded-none px-0 py-0 font-mono text-[9px] tracking-[0.1em] hover:bg-transparent max-[620px]:min-w-11 max-[620px]:text-[0]"
            variant="ghost"
            type="button"
            onClick={() => openSignal('home')}
          >
            {m.about_system({}, options)}{' '}
            <kbd className="ml-[9px] border p-[4px_7px] font-mono text-[8px] shadow-[2px_2px]">
              1
            </kbd>
          </Button>
        </div>
      </header>

      <section
        className="relative isolate mx-auto h-[calc(100svh-76px)] w-full max-w-[1600px] max-[620px]:h-[calc(100svh-64px)]"
        aria-label={m.galaxy_label({}, options)}
      >
        <div className="absolute top-[7vh] left-[5vw] z-4 max-w-[390px] max-[900px]:top-[4vh] max-[900px]:left-[7vw]">
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
        </div>

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

        <div
          ref={languageMenu}
          className="absolute top-[27%] right-[3vw] z-4 max-[900px]:top-[31%] max-[900px]:right-[4vw] max-[620px]:top-[36%]"
        >
          <Button
            ref={languageMenuTrigger}
            className="language-ship group h-auto rounded-none bg-transparent p-0 text-left hover:bg-transparent"
            variant="ghost"
            type="button"
            disabled={isChangingLanguage}
            aria-label={m.language_ship_label({}, options)}
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
        </div>

        <Button
          className={`sun absolute top-[52%] left-[59%] z-3 grid size-[115px] -translate-1/2 place-items-center rounded-full border-0 bg-transparent p-0 transition-transform duration-250 [--planet-size:115px] hover:scale-[1.08] hover:bg-transparent focus-visible:scale-[1.08] max-[900px]:top-[61%] max-[900px]:left-[52%] max-[900px]:size-[85px] max-[900px]:[--planet-size:85px] max-[620px]:top-[67%] max-[620px]:size-[72px] max-[620px]:[--planet-size:72px]${selectedSignal === 'home' ? ' signal-selected' : ''}`}
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
          return (
            <Button
              className={`world group absolute z-3 h-auto rounded-none border-0 bg-transparent p-0 text-left hover:bg-transparent [@media(pointer:coarse)]:min-h-11 [@media(pointer:coarse)]:min-w-11 ${worldClasses[world.id as Exclude<WorldId, 'home'>]}${selectedSignal === world.id ? ' signal-selected' : ''}`}
              data-signal={world.id}
              variant="ghost"
              type="button"
              key={world.id}
              aria-label={`${copy.label}: ${copy.description}`}
              onClick={() => openSignal(world.id)}
            >
              <Planet worldId={world.id} />
              <span
                className={`world-label pointer-events-none absolute top-1/2 flex w-[210px] -translate-y-1/2 flex-col gap-1 max-[900px]:hidden ${world.id === 'comms' ? 'right-[calc(100%+23px)] text-right' : 'left-[calc(100%+24px)]'}`}
              >
                <small className="font-mono text-[8px] tracking-[0.12em] text-[var(--dim)]">
                  {String(index + 2).padStart(2, '0')} · {copy.label}
                </small>
                <strong className="text-[15px]">{copy.title}</strong>
                <em className="-translate-x-1.5 font-mono text-[8px] tracking-[0.12em] text-[var(--cyan)] not-italic opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100">
                  {m.open_transmission({}, options)}
                </em>
              </span>
            </Button>
          )
        })}

        <div
          className="absolute bottom-[4vh] left-[4vw] flex items-center gap-6 font-mono text-[8px] tracking-[0.1em] text-[var(--dim)] max-[900px]:hidden"
          aria-hidden="true"
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
        </div>
      </section>

      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {selectedSignal
          ? m.transmission_opened({ signal: getWorldCopy(selectedSignal, locale).label }, options)
          : ''}
      </p>

      <Button
        className={`backdrop fixed inset-0 z-20 h-auto rounded-none border-0 bg-[rgb(2_5_6_/_76%)] transition-opacity duration-[240ms] hover:bg-[rgb(2_5_6_/_76%)] ${selectedSignal ? 'visible pointer-events-auto opacity-100' : 'invisible pointer-events-none opacity-0'}`}
        variant="ghost"
        type="button"
        tabIndex={-1}
        aria-label={m.close_transmission({}, options)}
        onClick={closeTransmission}
      />

      <LazyMotion features={loadMotionFeatures} strict>
        <AnimatePresence initial={false}>
          {selectedSignal && (
            <TransmissionDialog
              key="transmission"
              locale={locale}
              signal={selectedSignal}
              onClose={closeTransmission}
              onSelect={openSignal}
            />
          )}
        </AnimatePresence>
      </LazyMotion>

      <footer className="absolute right-0 bottom-0 left-0 flex h-[30px] items-center justify-between border-t border-[var(--line)] px-[3vw] font-mono text-[7px] tracking-[0.1em] text-[#646b69] max-[620px]:[&>span:nth-child(n+2)]:hidden">
        <span>{m.footer_left({}, options)}</span>
        <span>{m.footer_center({}, options)}</span>
        <span>{m.footer_right({}, options)}</span>
      </footer>
    </main>
  )
}
