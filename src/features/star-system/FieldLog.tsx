import { Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react'
import { useHotkeys, type UseHotkeyDefinition } from '@tanstack/react-hotkeys'
import { useNavigate } from '@tanstack/react-router'
import { AnimatePresence, LazyMotion, useReducedMotion } from 'motion/react'
import * as motionElement from 'motion/react-m'
import { MonitorCog, MoonStar, Sun } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { updateObservabilityContext } from '@/lib/observability/context'
import { m } from '@/paraglide/messages.js'
import { Errors } from '@/lib/observability/errors'

import { worlds, type Locale, type WorldId } from './data/worlds'
import { LocalizedLink } from './i18n/LocalizedLink'
import {
  createThemeCookie,
  readThemePreferenceFromCookie,
  resolveTheme,
  type ThemePreference,
} from './theme'
import { loadOrbitScene, loadReadingMode, type ViewMode } from './view'
import { LanguageSwitch, ViewSwitch } from './ViewSwitch'

type FieldLogProps = { locale: Locale; selectedSignal?: WorldId; view?: ViewMode }

// Each view ships as its own chunk, so reading mode never downloads the planet system and vice versa.
const OrbitScene = lazy(() => loadOrbitScene().then((module) => ({ default: module.OrbitScene })))
const ReadingMode = lazy(() =>
  loadReadingMode().then((module) => ({ default: module.ReadingMode })),
)

const loadMotionFeatures = () =>
  import('./transmissions/motion-features').then((module) => module.default)

const worldHotkeys = ['1', '2', '3', '4', '5'] as const

function ThemeIcon({ preference }: { preference: ThemePreference }) {
  if (preference === 'system') return <MonitorCog aria-hidden="true" />
  if (preference === 'night') return <MoonStar aria-hidden="true" />
  return <Sun aria-hidden="true" />
}

// Mount shortcuts with their view so exit animations cannot retain competing registrations.
function ReadingShortcuts({
  locale,
  isThemeMenuOpen,
  onCloseThemeMenu,
}: {
  locale: Locale
  isThemeMenuOpen: boolean
  onCloseThemeMenu: (options: { restoreFocus: boolean }) => void
}) {
  const navigate = useNavigate()
  function jumpToSection(section: WorldId) {
    void navigate({
      to: '/$locale',
      params: { locale },
      search: { view: 'reading' },
      hash: section,
    })
  }

  useHotkeys(
    [
      {
        hotkey: 'Escape',
        callback: () => onCloseThemeMenu({ restoreFocus: true }),
        options: { enabled: isThemeMenuOpen },
      },
      ...worlds.map((world, index): UseHotkeyDefinition => ({
        hotkey: worldHotkeys[index]!,
        callback: () => jumpToSection(world.id),
      })),
    ],
    { ignoreInputs: true },
  )
  return null
}

export function FieldLog({ locale, selectedSignal, view = 'orbit' }: FieldLogProps) {
  const reduceMotion = useReducedMotion()
  const options = { locale }
  const isReading = view === 'reading'
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false)
  const [themePreference, setThemePreference] = useState<ThemePreference>('system')
  const [isHydrated, setIsHydrated] = useState(false)
  const [activeSection, setActiveSection] = useState<WorldId>(selectedSignal ?? 'home')
  const [previousView, setPreviousView] = useState(view)
  const [hasSwitchedView, setHasSwitchedView] = useState(false)
  const themeMenu = useRef<HTMLDivElement>(null)
  const themeMenuTrigger = useRef<HTMLButtonElement>(null)
  const hasLoadedTheme = useRef(false)

  // Entrance animations only play after an in-app switch; a direct visit renders the view at rest.
  if (view !== previousView) {
    setPreviousView(view)
    setHasSwitchedView(true)
  }

  const changeActiveSection = useCallback((section: WorldId) => setActiveSection(section), [])

  const closeThemeMenu = useCallback(({ restoreFocus = false } = {}) => {
    setIsThemeMenuOpen(false)
    if (restoreFocus) themeMenuTrigger.current?.focus()
  }, [])

  useEffect(() => setIsHydrated(true), [])

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
    if (!isThemeMenuOpen) return

    function closeOnOutsideClick(event: PointerEvent) {
      if (event.target instanceof Node && !themeMenu.current?.contains(event.target)) {
        closeThemeMenu()
      }
    }

    document.addEventListener('pointerdown', closeOnOutsideClick)
    return () => document.removeEventListener('pointerdown', closeOnOutsideClick)
  }, [isThemeMenuOpen, closeThemeMenu])

  return (
    <LazyMotion features={loadMotionFeatures} strict>
      <main
        className={`system booted relative min-h-svh bg-[radial-gradient(circle_at_52%_47%,#1b2525_0,#101617_26%,var(--space)_68%)] text-[var(--paper)] ${isReading ? 'reading flex flex-col' : 'overflow-hidden'}`}
      >
        <AnimatePresence initial={false}>
          {!isReading && (
            <motionElement.div
              key="stars"
              className="pointer-events-none absolute inset-0"
              aria-hidden="true"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.6, ease: 'easeOut' }}
            >
              <div className="stars-a absolute inset-0" />
              <div className="stars-b absolute inset-0 opacity-40" />
            </motionElement.div>
          )}
        </AnimatePresence>

        <motionElement.header
          className="relative z-5 grid h-19 grid-cols-[1fr_auto_1fr] items-center border-b border-[var(--line)] px-[3vw] max-[900px]:grid-cols-[1fr_auto] max-[620px]:h-16"
          initial={reduceMotion ? false : { opacity: 0, y: -10, filter: 'blur(4px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{
            duration: reduceMotion ? 0 : 1.02,
            delay: reduceMotion ? 0 : 0.26,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
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
          <div className="flex items-center justify-self-end gap-5 max-[620px]:gap-3">
            {/* View-specific controls sit left of the switch so it never shifts when toggling. */}
            {isReading && <LanguageSwitch locale={locale} section={activeSection} />}
            <ViewSwitch
              locale={locale}
              view={view}
              signal={isReading ? undefined : selectedSignal}
            />
            <div className="relative" ref={themeMenu}>
              <Button
                ref={themeMenuTrigger}
                className="h-auto min-h-11 min-w-11 gap-[7px] rounded-none px-0 py-0 font-mono text-[9px] tracking-[0.1em] hover:bg-transparent [&_svg]:size-3.5 [&_svg]:stroke-[1.6]"
                variant="ghost"
                type="button"
                aria-label={m.theme_switch_label({}, options)}
                disabled={!isHydrated}
                aria-expanded={isThemeMenuOpen}
                aria-controls="theme-menu"
                aria-haspopup="menu"
                title={m.theme_current({ theme: getThemeLabel(themePreference) }, options)}
                onClick={() => setIsThemeMenuOpen((open) => !open)}
              >
                <ThemeIcon preference={themePreference} />
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
                  <p className="px-2 pt-1 pb-2 font-mono text-[8px] tracking-[0.13em] text-[#a7adab]">
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
          </div>
        </motionElement.header>

        <AnimatePresence mode="wait" onExitComplete={() => window.scrollTo(0, 0)}>
          {isReading ? (
            <Suspense key="reading" fallback={null}>
              <ReadingShortcuts
                locale={locale}
                isThemeMenuOpen={isThemeMenuOpen}
                onCloseThemeMenu={closeThemeMenu}
              />
              <ReadingMode
                locale={locale}
                activeSection={activeSection}
                isEntering={hasSwitchedView}
                onActiveSectionChange={changeActiveSection}
              />
            </Suspense>
          ) : (
            <Suspense key="orbit" fallback={null}>
              <OrbitScene
                locale={locale}
                selectedSignal={selectedSignal}
                isHydrated={isHydrated}
                isEntering={hasSwitchedView}
                isThemeMenuOpen={isThemeMenuOpen}
                onCloseThemeMenu={closeThemeMenu}
              />
            </Suspense>
          )}
        </AnimatePresence>

        <motionElement.footer
          className={`${isReading ? 'relative mt-auto' : 'absolute right-0 bottom-0 left-0'} flex h-[30px] items-center justify-between border-t border-[var(--line)] px-[3vw] font-mono text-[7px] tracking-[0.1em] text-[#646b69] max-[620px]:[&>span:nth-child(n+2)]:hidden`}
          initial={reduceMotion ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: reduceMotion ? 0 : 0.98,
            delay: reduceMotion ? 0 : 0.37,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          <span>{m.footer_left({}, options)}</span>
          <span>{m.footer_center({}, options)}</span>
          <span>{m.footer_right({}, options)}</span>
        </motionElement.footer>
      </main>
    </LazyMotion>
  )
}
