import { useEffect, useRef, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { AnimatePresence, LazyMotion } from 'motion/react'

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

const worldClasses: Record<Exclude<WorldId, 'home'>, string> = {
  current: 'world-now',
  workbench: 'world-work',
  'side-quests': 'world-quests',
  comms: 'world-comms',
}

const loadMotionFeatures = () =>
  import('./transmissions/motion-features').then((module) => module.default)

export function FieldLog({ locale, selectedSignal }: FieldLogProps) {
  const navigate = useNavigate()
  const options = { locale }
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false)
  const [isChangingLanguage, setIsChangingLanguage] = useState(false)
  const languageMenu = useRef<HTMLDivElement>(null)
  const languageTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const lastSelectedSignal = useRef<WorldId | undefined>(selectedSignal)

  if (selectedSignal) lastSelectedSignal.current = selectedSignal

  function openSignal(signal: WorldId) {
    void navigate({ to: '/$locale/$signal', params: { locale, signal } })
  }

  function closeTransmission() {
    void navigate({ to: '/$locale', params: { locale } })
  }

  function changeLanguage(nextLocale: Locale) {
    if (isChangingLanguage || nextLocale === locale) {
      setIsLanguageMenuOpen(false)
      return
    }

    setIsLanguageMenuOpen(false)
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
    if (!isLanguageMenuOpen) return

    function closeOnOutsideClick(event: PointerEvent) {
      if (event.target instanceof Node && !languageMenu.current?.contains(event.target)) {
        setIsLanguageMenuOpen(false)
      }
    }

    document.addEventListener('pointerdown', closeOnOutsideClick)
    return () => document.removeEventListener('pointerdown', closeOnOutsideClick)
  }, [isLanguageMenuOpen])

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) return

      if (event.key === 'Escape' && isLanguageMenuOpen) {
        setIsLanguageMenuOpen(false)
        return
      }

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
    <main className="system booted relative min-h-svh overflow-hidden bg-[radial-gradient(circle_at_52%_47%,#1b2525_0,#101617_26%,var(--space)_68%)] text-[var(--paper)]">
      <div className="stars stars-a" aria-hidden="true" />
      <div className="stars stars-b" aria-hidden="true" />

      <header className="relative z-5 grid h-19 grid-cols-[1fr_auto_1fr] items-center border-b border-[var(--line)] px-[3vw] max-[900px]:grid-cols-[1fr_auto] max-[620px]:h-16">
        <LocalizedLink
          locale={locale}
          className="font-mono text-[21px] font-black no-underline"
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
        <Button
          className="h-auto justify-self-end rounded-none px-0 py-0 font-mono text-[9px] tracking-[0.1em] hover:bg-transparent max-[620px]:text-[0]"
          variant="ghost"
          type="button"
          onClick={() => openSignal('home')}
        >
          {m.about_system({}, options)} <kbd>1</kbd>
        </Button>
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

        <div className="orbit orbit-1" aria-hidden="true" />
        <div className="orbit orbit-2" aria-hidden="true" />
        <div className="orbit orbit-3" aria-hidden="true" />

        <div
          ref={languageMenu}
          className="absolute top-[27%] right-[3vw] z-4 max-[900px]:top-[31%] max-[900px]:right-[4vw] max-[620px]:top-[36%]"
        >
          <Button
            className="language-ship group h-auto rounded-none bg-transparent p-0 text-left hover:bg-transparent"
            variant="ghost"
            type="button"
            disabled={isChangingLanguage}
            aria-label={m.language_ship_label({}, options)}
            aria-expanded={isLanguageMenuOpen}
            aria-controls="language-bubble"
            aria-busy={isChangingLanguage}
            onClick={() => setIsLanguageMenuOpen((open) => !open)}
          >
            <span className="ship-body" aria-hidden="true">
              <i className="ship-dome" />
              <i className="ship-beam" />
            </span>
            <span className="ml-3 flex min-w-32 flex-col gap-1 font-mono text-[8px] tracking-[0.12em]">
              <strong className="font-normal text-[var(--cyan)]">
                {isChangingLanguage
                  ? m.language_ship_processing({}, options)
                  : m.language_ship_ready({}, options)}
              </strong>
              <i className={`language-progress${isChangingLanguage ? ' active' : ''}`} />
            </span>
          </Button>

          {isLanguageMenuOpen && (
            <div
              id="language-bubble"
              className="language-bubble absolute top-[calc(100%+22px)] right-0 w-52 border border-[rgb(242_238_225_/_45%)] bg-[#151b1c] p-3 shadow-[8px_10px_0_rgb(0_0_0_/_30%)]"
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
                  className="flex h-9 w-full justify-between rounded-none border-t border-[var(--line)] px-2 font-mono text-[9px] tracking-[0.1em] hover:bg-[rgb(90_217_210_/_8%)]"
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
                    <small className="alien-decoder ml-2" aria-hidden="true">
                      <span className="alien-glyphs">⌁ ⋔ ⟟ ◬ ∷ ⌬</span>
                      <span className="alien-decoding">DECODING</span>
                    </small>
                  )}
                </Button>
              ))}
            </div>
          )}
        </div>

        <Button
          className={`sun${selectedSignal === 'home' ? ' signal-selected' : ''}`}
          data-signal="home"
          variant="ghost"
          type="button"
          aria-label={m.home_signal_label({}, options)}
          onClick={() => openSignal('home')}
        >
          <span>M</span>
          <i aria-hidden="true" />
        </Button>

        {worlds.slice(1).map((world, index) => {
          const copy = getWorldCopy(world.id, locale)
          return (
            <Button
              className={`world ${worldClasses[world.id as Exclude<WorldId, 'home'>]}${selectedSignal === world.id ? ' signal-selected' : ''}`}
              data-signal={world.id}
              variant="ghost"
              type="button"
              key={world.id}
              aria-label={`${copy.label}: ${copy.description}`}
              onClick={() => openSignal(world.id)}
            >
              <span className="planet">
                <i aria-hidden="true" />
                <span className="planet-details" aria-hidden="true">
                  <b />
                  {(world.id === 'side-quests' || world.id === 'workbench') && <b />}
                </span>
              </span>
              <span className="world-label">
                <small>
                  {String(index + 2).padStart(2, '0')} · {copy.label}
                </small>
                <strong>{copy.title}</strong>
                <em>{m.open_transmission({}, options)}</em>
              </span>
            </Button>
          )
        })}

        <div
          className="absolute bottom-[4vh] left-[4vw] flex items-center gap-6 font-mono text-[8px] tracking-[0.1em] text-[var(--dim)] max-[900px]:hidden"
          aria-hidden="true"
        >
          <span>
            <i /> {m.legend_navigable({}, options)}
          </span>
          <span>
            <i className="live" /> {m.legend_live({}, options)}
          </span>
          <small className="border-l border-[#3b4140] pl-6">{m.legend_hint({}, options)}</small>
        </div>
      </section>

      <Button
        className={`backdrop${selectedSignal ? ' visible' : ''}`}
        variant="ghost"
        type="button"
        tabIndex={selectedSignal ? 0 : -1}
        aria-label={m.close_transmission({}, options)}
        onClick={closeTransmission}
      />

      <LazyMotion features={loadMotionFeatures} strict>
        <AnimatePresence
          initial={false}
          onExitComplete={() => {
            const signal = lastSelectedSignal.current
            if (!signal) return
            document.querySelector<HTMLElement>(`[data-signal="${signal}"]`)?.focus()
          }}
        >
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
