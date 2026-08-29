import { useEffect, useRef, useState } from 'react'
import { worlds, type Locale, type WorldId } from '../data/worlds'
import { AnimatePresence, useReducedMotion } from 'motion/react'
import * as motionElement from 'motion/react-m'
import { getWorldCopy } from '../i18n/world-copy'
import { Planet } from '../Planet'
import { getTransmission } from './content'
import { getTransmissionMotion } from './transmission-motion'
import { Button } from '@/components/ui/button'
import { m } from '@/paraglide/messages.js'

type TransmissionDialogProps = {
  locale: Locale
  signal: WorldId
  onClose: () => void
  onSelect: (signal: WorldId) => void
}

const signalGraphHeights = [42, 78, 55, 92, 48, 84, 36, 68, 57, 88, 45, 73, 38, 82, 62, 94, 51, 76]

function SignalGraph({
  loading,
  loadingFrame = 0,
  reduceMotion,
}: {
  loading?: boolean
  loadingFrame?: number
  reduceMotion: boolean
}) {
  return (
    <div
      className={`my-2 mt-[22px] flex h-8 items-end gap-1 overflow-hidden border-y border-[color-mix(in_srgb,var(--cyan)_22%,transparent)] py-1 transition-opacity max-[620px]:m-0 ${loading ? 'opacity-85' : 'opacity-100'}`}
      aria-hidden="true"
    >
      {signalGraphHeights.map((height, index) => (
        <motionElement.i
          className="block w-1 origin-bottom bg-[var(--cyan)] shadow-[0_0_8px_rgb(90_217_210_/_38%)]"
          style={{
            height: `${height}%`,
            transform: loading
              ? `scaleY(${0.32 + (Math.sin((loadingFrame + index * 1.7) * 0.55) + 1) * 0.29})`
              : undefined,
          }}
          key={index}
          animate={
            reduceMotion || loading
              ? undefined
              : {
                  scaleY: [0.18 + (index % 3) * 0.12, 1, 0.32 + (index % 4) * 0.12],
                  opacity: [0.35, 1, 0.5],
                }
          }
          transition={{
            delay: index * 0.045,
            duration: 0.75 + (index % 5) * 0.11,
            ease: 'easeInOut',
            repeat: Infinity,
            repeatType: 'mirror',
          }}
        />
      ))}
    </div>
  )
}

export function TransmissionDialog({ locale, signal, onClose, onSelect }: TransmissionDialogProps) {
  const reduceMotion = useReducedMotion()
  const dialogRef = useRef<HTMLElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const [isTuning, setIsTuning] = useState(true)
  const [tuningFrame, setTuningFrame] = useState(0)
  const transmission = getTransmission(signal, locale)
  const activeIndex = worlds.findIndex((world) => world.id === signal)
  const previous = worlds[(activeIndex - 1 + worlds.length) % worlds.length]
  const next = worlds[(activeIndex + 1) % worlds.length]
  const options = { locale }
  const panelMotion = getTransmissionMotion(reduceMotion)
  const tuningCopy =
    locale === 'de'
      ? { label: 'SIGNAL WIRD SYNCHRONISIERT', phase: 'TRÄGERWELLE WIRD DEKODIERT' }
      : { label: 'ACQUIRING SIGNAL', phase: 'DECODING CARRIER WAVE' }

  useEffect(() => {
    setIsTuning(true)
    setTuningFrame(0)
    const timer = window.setTimeout(() => setIsTuning(false), reduceMotion ? 150 : 800)
    const ticker = reduceMotion
      ? undefined
      : window.setInterval(() => setTuningFrame((frame) => Math.min(frame + 1, 10)), 80)
    return () => {
      window.clearTimeout(timer)
      if (ticker !== undefined) window.clearInterval(ticker)
    }
  }, [reduceMotion, signal])

  useEffect(() => {
    closeButtonRef.current?.focus()
  }, [])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    function trapFocus(event: KeyboardEvent) {
      if (event.key !== 'Tab') return

      const focusable = Array.from(
        dialog?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      )
      const first = focusable[0]
      const last = focusable.at(-1)
      if (!first || !last) return

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    dialog.addEventListener('keydown', trapFocus)
    return () => dialog.removeEventListener('keydown', trapFocus)
  }, [])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    const activeDialog: HTMLElement = dialog

    function keepFocusInDialog(event: FocusEvent) {
      if (event.target instanceof Node && !activeDialog.contains(event.target)) {
        closeButtonRef.current?.focus()
      }
    }

    document.addEventListener('focusin', keepFocusInDialog)
    return () => document.removeEventListener('focusin', keepFocusInDialog)
  }, [])

  return (
    <motionElement.aside
      ref={dialogRef}
      className="transmission open fixed top-[4vh] right-[3vw] bottom-[4vh] z-25 grid w-[min(850px,89vw)] grid-rows-[64px_1fr_58px] overflow-hidden border border-[rgb(242_238_225_/_55%)] bg-[var(--transmission-background)] shadow-[0_0_0_7px_rgb(90_217_210_/_6%),-25px_25px_rgb(0_0_0_/_30%)] [backface-visibility:hidden] [contain:layout_paint] [will-change:transform,opacity] max-[900px]:w-[94vw] max-[620px]:inset-0 max-[620px]:h-svh max-[620px]:w-screen max-[620px]:grid-rows-[58px_1fr_58px] max-[620px]:border-0"
      role="dialog"
      aria-modal="true"
      aria-labelledby="transmission-title"
      aria-describedby="transmission-lead"
      initial={panelMotion.initial}
      animate={panelMotion.animate}
      exit={panelMotion.exit}
      transition={panelMotion.transition}
    >
      <div
        className="pointer-events-none absolute inset-0 z-4 bg-[repeating-linear-gradient(to_bottom,transparent_0_3px,var(--paper)_4px)] opacity-[0.055]"
        aria-hidden="true"
      />
      <AnimatePresence initial={false}>
        {isTuning && (
          <motionElement.div
            className="pointer-events-none absolute top-16 right-0 bottom-[58px] left-0 z-6 grid grid-cols-[250px_1fr] gap-[45px] overflow-hidden bg-[var(--transmission-background)] px-12 py-[50px] max-[900px]:grid-cols-[190px_1fr] max-[900px]:gap-[30px] max-[900px]:px-[30px] max-[900px]:py-[35px] max-[620px]:top-[58px] max-[620px]:block max-[620px]:px-[23px] max-[620px]:py-7"
            role="status"
            aria-live="polite"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: reduceMotion ? 1 : [0.72, 1, 0.86, 1] }}
            exit={{ opacity: 0 }}
            transition={{
              duration: reduceMotion ? 0 : 0.38,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            {!reduceMotion && (
              <motionElement.div
                className="absolute inset-y-0 z-2 w-[46%] bg-[linear-gradient(90deg,transparent,color-mix(in_srgb,var(--cyan)_28%,transparent),color-mix(in_srgb,var(--paper)_14%,transparent),transparent)] opacity-80 mix-blend-screen blur-sm transition-[left] duration-100 ease-linear"
                aria-hidden="true"
                style={{ left: `${-42 + tuningFrame * 15}%` }}
              />
            )}
            <div
              className="border-r border-[var(--line)] pr-[38px] max-[900px]:pr-[25px] max-[620px]:mb-[25px] max-[620px]:grid max-[620px]:grid-cols-[95px_1fr] max-[620px]:items-center max-[620px]:border-r-0 max-[620px]:border-b max-[620px]:pr-0 max-[620px]:pb-5"
              aria-hidden="true"
            >
              <div className="grid h-[190px] place-items-center max-[620px]:h-[95px]">
                <div className="relative grid size-[132px] place-items-center rounded-full border border-dashed border-[color-mix(in_srgb,var(--cyan)_42%,transparent)] max-[620px]:size-[74px]">
                  <div
                    className={`signal-planet signal-planet-${signal} absolute inset-0 z-0 grid place-items-center opacity-25 saturate-50`}
                  >
                    <Planet worldId={signal} />
                  </div>
                  <div className="absolute inset-[13%] z-1 rounded-full border border-[color-mix(in_srgb,var(--cyan)_24%,transparent)]" />
                  <div className="absolute top-1/2 left-1/2 z-1 h-px w-[76%] -translate-1/2 bg-[color-mix(in_srgb,var(--cyan)_22%,transparent)]" />
                  <div className="absolute top-1/2 left-1/2 z-1 h-[76%] w-px -translate-1/2 bg-[color-mix(in_srgb,var(--cyan)_22%,transparent)]" />
                  <div
                    className="absolute inset-0 z-2 rounded-full transition-transform duration-100 ease-linear"
                    style={{ transform: `rotate(${reduceMotion ? 0 : tuningFrame * 12}deg)` }}
                  >
                    <div className="absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,transparent_0_82%,color-mix(in_srgb,var(--cyan)_30%,transparent)_92%,transparent_100%)]" />
                    <i className="absolute top-0 left-1/2 h-1/2 w-px -translate-x-1/2 bg-[linear-gradient(to_bottom,var(--cyan),transparent)] shadow-[0_0_7px_var(--cyan)]" />
                    <i className="absolute top-[-3px] left-1/2 size-1.5 -translate-x-1/2 rounded-full bg-[var(--lime)] shadow-[0_0_9px_var(--lime)]" />
                  </div>
                </div>
              </div>
              <SignalGraph
                loading
                loadingFrame={tuningFrame}
                reduceMotion={Boolean(reduceMotion)}
              />
              <small className="font-mono text-[7px] tracking-[0.11em] text-[var(--dim)] max-[620px]:col-start-2">
                SIGNAL SEARCH // {String(activeIndex + 1).padStart(2, '0')}
              </small>
            </div>

            <motionElement.div
              aria-hidden="true"
              animate={reduceMotion ? undefined : { opacity: [0.62, 0.9, 0.7, 1] }}
              transition={{
                delay: 0.12,
                duration: 1.2,
                ease: 'easeInOut',
                repeat: Infinity,
                repeatType: 'mirror',
              }}
            >
              <div className="mb-5 h-2 w-28 bg-[color-mix(in_srgb,var(--coral)_38%,transparent)]" />
              <div className="mb-3 h-10 w-[82%] bg-[color-mix(in_srgb,var(--paper)_16%,transparent)] max-[620px]:h-7" />
              <div className="mb-8 h-10 w-[58%] bg-[color-mix(in_srgb,var(--paper)_11%,transparent)] max-[620px]:h-7" />

              <div className="space-y-3">
                <div className="h-2.5 w-full bg-[color-mix(in_srgb,var(--paper)_16%,transparent)]" />
                <div className="h-2.5 w-[92%] bg-[color-mix(in_srgb,var(--paper)_13%,transparent)]" />
                <div className="h-2.5 w-[68%] bg-[color-mix(in_srgb,var(--paper)_10%,transparent)]" />
              </div>

              <div className="mt-[35px] border-t border-[var(--line)]">
                {[74, 88, 62, 80].map((width, index) => (
                  <div
                    className="grid grid-cols-[110px_1fr] gap-4 border-b border-[var(--line)] py-3.5 max-[620px]:grid-cols-[90px_1fr]"
                    key={index}
                  >
                    <div className="h-2 w-14 bg-[color-mix(in_srgb,var(--dim)_28%,transparent)]" />
                    <div
                      className="h-2 bg-[color-mix(in_srgb,var(--cyan)_24%,transparent)]"
                      style={{ width: `${width}%` }}
                    />
                  </div>
                ))}
              </div>

              <div className="mt-7 border-l-[3px] border-[color-mix(in_srgb,var(--coral)_38%,transparent)] py-1 pl-[18px]">
                <div className="h-2.5 w-[76%] bg-[color-mix(in_srgb,var(--paper)_14%,transparent)]" />
              </div>
              <p className="mt-6 font-mono text-[7px] tracking-[0.13em] text-[var(--cyan)]">
                {tuningCopy.label} // {tuningCopy.phase}
              </p>
            </motionElement.div>
          </motionElement.div>
        )}
      </AnimatePresence>
      <header className="relative z-5 grid grid-cols-[1fr_auto_1fr] items-center border-b border-[var(--line)] px-[22px] font-mono text-[8px] tracking-[0.12em] max-[620px]:grid-cols-[1fr_auto] max-[620px]:px-[15px]">
        <div>
          <i
            className="mr-2 inline-block size-[7px] rounded-full bg-[var(--coral)]"
            aria-hidden="true"
          />{' '}
          {m.incoming_transmission({}, options)}
        </div>
        <span className="text-[var(--cyan)] max-[620px]:hidden">{transmission.channel}</span>
        <Button
          ref={closeButtonRef}
          className="h-auto min-h-11 min-w-11 justify-self-end rounded-none px-0 py-0 text-[inherit] tracking-[inherit] hover:bg-transparent max-[620px]:text-[0]"
          variant="ghost"
          type="button"
          onClick={onClose}
          aria-label={m.close_transmission({}, options)}
        >
          {m.disconnect({}, options)}{' '}
          <kbd className="ml-[9px] border p-[4px_7px] font-mono text-[8px] shadow-[2px_2px]">
            ESC
          </kbd>
        </Button>
      </header>

      <motionElement.div
        className="relative z-2 grid grid-cols-[250px_1fr] gap-[45px] overflow-auto px-12 py-[50px] max-[900px]:grid-cols-[190px_1fr] max-[900px]:gap-[30px] max-[900px]:px-[30px] max-[900px]:py-[35px] max-[620px]:block max-[620px]:px-[23px] max-[620px]:py-7"
        tabIndex={0}
        animate={{
          opacity: isTuning ? 0 : 1,
          scale: isTuning && !reduceMotion ? 0.99 : 1,
          filter: isTuning && !reduceMotion ? 'blur(2px)' : 'blur(0px)',
        }}
        transition={{
          duration: reduceMotion ? 0 : 0.38,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        <motionElement.div
          className="border-r border-[var(--line)] pr-[38px] max-[900px]:pr-[25px] max-[620px]:mb-[25px] max-[620px]:grid max-[620px]:grid-cols-[95px_1fr] max-[620px]:items-center max-[620px]:border-r-0 max-[620px]:border-b max-[620px]:pr-0 max-[620px]:pb-5"
          aria-hidden="true"
        >
          <motionElement.div
            className={`signal-planet signal-planet-${signal} grid h-[190px] place-items-center bg-[radial-gradient(circle,rgb(90_217_210_/_12%),transparent_65%)] max-[620px]:h-[95px]`}
            animate={
              reduceMotion
                ? undefined
                : {
                    y: [0, -3, 0, 2, 0],
                    rotate: signal === 'home' ? [-1.5, 1.5, -1.5] : [0, 360],
                  }
            }
            transition={{
              y: { duration: 7, ease: 'easeInOut', repeat: Infinity },
              rotate: {
                duration: signal === 'home' ? 9 : 36,
                ease: signal === 'home' ? 'easeInOut' : 'linear',
                repeat: Infinity,
              },
            }}
          >
            <Planet worldId={signal} />
          </motionElement.div>
          <SignalGraph reduceMotion={Boolean(reduceMotion)} />
          <small className="font-mono text-[7px] tracking-[0.11em] text-[var(--dim)] max-[620px]:col-start-2">
            {m.signal_locked({}, options)}
          </small>
        </motionElement.div>

        <motionElement.article
          animate={{
            y: isTuning && !reduceMotion ? 6 : 0,
            filter: isTuning && !reduceMotion ? 'blur(1.5px)' : 'blur(0px)',
          }}
          transition={{
            duration: reduceMotion ? 0 : 0.38,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <p className="font-mono text-[8px] tracking-[0.15em] text-[var(--coral)]">
            {transmission.kicker}
          </p>
          <h2
            className="my-5 mb-[27px] text-[clamp(2.5rem,4vw,4.7rem)] leading-[0.88] tracking-[-0.06em] max-[620px]:text-[11vw]"
            id="transmission-title"
          >
            {transmission.title}
          </h2>
          <p className="text-[15px] leading-[1.6] text-[#c7c7bd]" id="transmission-lead">
            {transmission.lead}
          </p>
          <dl className="my-[30px] mt-[35px] border-t border-[var(--line)]">
            {transmission.details.map((detail) => (
              <div
                className="grid grid-cols-[110px_1fr] gap-4 border-b border-[var(--line)] py-3.5 max-[620px]:grid-cols-[90px_1fr]"
                key={detail.label}
              >
                <dt className="font-mono text-[8px] tracking-[0.1em] text-[var(--dim)] uppercase">
                  {detail.label}
                </dt>
                <dd className="m-0 font-mono text-xs leading-[1.4]">
                  {detail.href ? (
                    <a
                      className="text-[var(--lime)]"
                      href={detail.href}
                      target={detail.href.startsWith('http') ? '_blank' : undefined}
                      rel={detail.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    >
                      {detail.value}
                    </a>
                  ) : (
                    detail.value
                  )}
                </dd>
              </div>
            ))}
          </dl>
          <blockquote className="mt-[25px] border-l-[3px] border-[var(--coral)] py-1.5 pl-[18px] font-mono text-sm leading-[1.5] font-bold text-[var(--paper)]">
            {transmission.quote}
          </blockquote>
        </motionElement.article>
      </motionElement.div>

      <nav
        className="relative z-5 grid grid-cols-[1fr_auto_1fr] items-center border-t border-[var(--line)] px-[22px] max-[620px]:px-3"
        aria-label={m.transmission_navigation({}, options)}
      >
        <Button
          className="h-auto min-h-11 min-w-11 justify-self-start rounded-none px-0 py-0 font-mono text-[8px] tracking-[0.1em] hover:bg-transparent"
          variant="ghost"
          type="button"
          aria-label={m.previous_signal({}, options)}
          onClick={() => onSelect(previous.id)}
        >
          <span className="max-[620px]:hidden">{m.previous_signal({}, options)}</span>
          <span className="hidden text-lg max-[620px]:inline" aria-hidden="true">
            ←
          </span>
        </Button>
        <div className="flex gap-[7px]">
          {worlds.map((world, index) => (
            <Button
              className="size-11 rounded-none border border-[#59605e] bg-transparent p-0 font-mono text-[8px] text-[var(--dim)] hover:bg-transparent data-[active=true]:border-[var(--lime)] data-[active=true]:bg-[var(--lime)] data-[active=true]:text-[var(--active-control-foreground)] max-[620px]:size-10"
              variant="outline"
              data-active={world.id === signal}
              type="button"
              key={world.id}
              aria-label={`${getWorldCopy(world.id, locale).label} ${m.open_signal_suffix({}, options)}`}
              aria-current={world.id === signal ? 'page' : undefined}
              onClick={() => onSelect(world.id)}
            >
              {String(index + 1).padStart(2, '0')}
            </Button>
          ))}
        </div>
        <Button
          className="h-auto min-h-11 min-w-11 justify-self-end rounded-none px-0 py-0 font-mono text-[8px] tracking-[0.1em] hover:bg-transparent"
          variant="ghost"
          type="button"
          aria-label={m.next_signal({}, options)}
          onClick={() => onSelect(next.id)}
        >
          <span className="max-[620px]:hidden">{m.next_signal({}, options)}</span>
          <span className="hidden text-lg max-[620px]:inline" aria-hidden="true">
            →
          </span>
        </Button>
      </nav>
    </motionElement.aside>
  )
}
