import { useEffect, useRef } from 'react'
import { worlds, type Locale, type WorldId } from '../data/worlds'
import { useReducedMotion } from 'motion/react'
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

export function TransmissionDialog({ locale, signal, onClose, onSelect }: TransmissionDialogProps) {
  const reduceMotion = useReducedMotion()
  const dialogRef = useRef<HTMLElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const transmission = getTransmission(signal, locale)
  const activeIndex = worlds.findIndex((world) => world.id === signal)
  const previous = worlds[(activeIndex - 1 + worlds.length) % worlds.length]
  const next = worlds[(activeIndex + 1) % worlds.length]
  const options = { locale }
  const panelMotion = getTransmissionMotion(reduceMotion)

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
      className="transmission open fixed top-[4vh] right-[3vw] bottom-[4vh] z-25 grid w-[min(850px,89vw)] grid-rows-[64px_1fr_58px] overflow-hidden border border-[rgb(242_238_225_/_55%)] bg-[#151b1c] shadow-[0_0_0_7px_rgb(90_217_210_/_6%),-25px_25px_rgb(0_0_0_/_30%)] [backface-visibility:hidden] [contain:layout_paint] [will-change:transform,opacity] max-[900px]:w-[94vw] max-[620px]:inset-0 max-[620px]:h-svh max-[620px]:w-screen max-[620px]:grid-rows-[58px_1fr_58px] max-[620px]:border-0"
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

      <div
        className="relative z-2 grid grid-cols-[250px_1fr] gap-[45px] overflow-auto px-12 py-[50px] max-[900px]:grid-cols-[190px_1fr] max-[900px]:gap-[30px] max-[900px]:px-[30px] max-[900px]:py-[35px] max-[620px]:block max-[620px]:px-[23px] max-[620px]:py-7"
        tabIndex={0}
      >
        <div
          className="border-r border-[var(--line)] pr-[38px] max-[900px]:pr-[25px] max-[620px]:mb-[25px] max-[620px]:grid max-[620px]:grid-cols-[95px_1fr] max-[620px]:items-center max-[620px]:border-r-0 max-[620px]:border-b max-[620px]:pr-0 max-[620px]:pb-5"
          aria-hidden="true"
        >
          <div
            className={`signal-planet signal-planet-${signal} grid h-[190px] place-items-center bg-[radial-gradient(circle,rgb(90_217_210_/_12%),transparent_65%)] max-[620px]:h-[95px]`}
          >
            <Planet worldId={signal} />
          </div>
          <div className="my-2 mt-[22px] overflow-hidden font-mono text-[22px] tracking-[-4px] whitespace-nowrap text-[var(--cyan)] max-[620px]:m-0 max-[620px]:text-lg">
            ▂▅▃▇▂▆▁▅▃▇▂▆▁▃▇▅▂▆
          </div>
          <small className="font-mono text-[7px] tracking-[0.11em] text-[var(--dim)] max-[620px]:col-start-2">
            {m.signal_locked({}, options)}
          </small>
        </div>

        <article>
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
        </article>
      </div>

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
