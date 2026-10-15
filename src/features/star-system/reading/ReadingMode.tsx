import { useEffect } from 'react'
import { Link, useRouterState } from '@tanstack/react-router'
import { useReducedMotion, type HTMLMotionProps } from 'motion/react'
import * as motionElement from 'motion/react-m'

import { m } from '@/paraglide/messages.js'

import { worldIdSchema, worlds, type Locale, type WorldId } from '../data/worlds'
import { getWorldCopy } from '../i18n/world-copy'
import { getTransmission } from '../transmissions/content'
import {
  MissionLog,
  TransmissionDetails,
  TransmissionDownloads,
  TransmissionQuote,
} from '../transmissions/TransmissionContent'

type ReadingModeProps = {
  locale: Locale
  activeSection: WorldId
  /** True after an in-app switch from orbit view; a direct visit renders without an entrance. */
  isEntering: boolean
  onActiveSectionChange: (section: WorldId) => void
}

type RevealProps = Pick<HTMLMotionProps<'div'>, 'initial' | 'animate' | 'exit' | 'transition'>

/** Staggered fade-up that mirrors the orbit boot sequence, and a quick fade-out when leaving. */
function createReveal(isEntering: boolean, reduceMotion: boolean) {
  return (delay: number): RevealProps => ({
    initial: isEntering && !reduceMotion ? { opacity: 0, y: 22, filter: 'blur(6px)' } : false,
    animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
    exit: reduceMotion
      ? { opacity: 0, transition: { duration: 0 } }
      : {
          opacity: 0,
          y: -10,
          filter: 'blur(4px)',
          transition: { duration: 0.3, ease: [0.7, 0, 0.84, 0] },
        },
    transition: { duration: reduceMotion ? 0 : 0.9, delay, ease: [0.16, 1, 0.3, 1] },
  })
}

const signalBarHeights = [42, 78, 55, 92, 48, 84, 36, 68, 57, 88, 45, 73, 38, 82]

function formatIndex(index: number) {
  return String(index + 1).padStart(2, '0')
}

/** Document offset without transforms, so a section still sliding in lands at its final spot. */
function getLayoutTop(element: HTMLElement) {
  let top = -Number.parseFloat(getComputedStyle(element).scrollMarginTop || '0')
  for (
    let node: HTMLElement | null = element;
    node;
    node = node.offsetParent as HTMLElement | null
  ) {
    top += node.offsetTop
  }
  return top
}

/** Frozen version of the dialog's signal graph – same rhythm, no motion. */
function StaticSignalBars({ offset }: { offset: number }) {
  return (
    <div
      className="mt-6 flex h-7 items-end gap-[3px] overflow-hidden border-y border-[color-mix(in_srgb,var(--cyan)_22%,transparent)] py-1 max-[620px]:hidden"
      aria-hidden="true"
    >
      {signalBarHeights.map((_, index) => (
        <i
          className="block w-[3px] bg-[var(--cyan)] opacity-75"
          style={{
            height: `${signalBarHeights[(index + offset * 3) % signalBarHeights.length]}%`,
          }}
          key={index}
        />
      ))}
    </div>
  )
}

function SectionIndex({
  locale,
  activeSection,
  variant,
  reveal,
}: {
  locale: Locale
  activeSection: WorldId
  variant: 'sidebar' | 'bar'
  reveal: RevealProps
}) {
  const options = { locale }

  if (variant === 'bar') {
    const activeCopy = getWorldCopy(activeSection, locale)
    return (
      <motionElement.nav
        {...reveal}
        className="sticky top-0 z-10 -mx-[3vw] mb-10 hidden items-center justify-between gap-4 border-b border-[var(--line)] bg-[color-mix(in_srgb,var(--space)_92%,transparent)] px-[3vw] py-2 backdrop-blur-sm max-[900px]:flex"
        aria-label={m.reading_index_navigation({}, options)}
      >
        <ol className="flex gap-[7px]">
          {worlds.map((world, index) => (
            <li key={world.id}>
              <a
                href={`#${world.id}`}
                className="grid size-10 place-items-center border border-[#59605e] font-mono text-[9px] text-[var(--dim)] no-underline transition-colors aria-[current=location]:border-[var(--lime)] aria-[current=location]:bg-[var(--lime)] aria-[current=location]:text-[var(--active-control-foreground)]"
                aria-current={world.id === activeSection ? 'location' : undefined}
                aria-label={getWorldCopy(world.id, locale).label}
              >
                {formatIndex(index)}
              </a>
            </li>
          ))}
        </ol>
        <span
          className="truncate font-mono text-[9px] tracking-[0.12em] text-[var(--dim)]"
          aria-hidden="true"
        >
          {activeCopy.title}
        </span>
      </motionElement.nav>
    )
  }

  return (
    <motionElement.nav
      {...reveal}
      className="sticky top-10 self-start max-[900px]:hidden"
      aria-label={m.reading_index_navigation({}, options)}
    >
      <p className="mb-4 font-mono text-[9px] font-bold tracking-[0.15em] text-[var(--dim)]">
        {m.reading_index_label({}, options)}
      </p>
      <ol className="border-t border-[var(--line)]">
        {worlds.map((world, index) => {
          const copy = getWorldCopy(world.id, locale)
          return (
            <li className="border-b border-[var(--line)]" key={world.id}>
              <a
                href={`#${world.id}`}
                className="group grid min-h-15 grid-cols-[40px_1fr] items-center gap-3.5 py-2.5 no-underline"
                aria-current={world.id === activeSection ? 'location' : undefined}
              >
                <span
                  className="grid size-10 place-items-center border border-[#59605e] font-mono text-[9px] text-[var(--dim)] transition-colors group-hover:border-[var(--cyan)] group-hover:text-[var(--cyan)] group-aria-[current=location]:border-[var(--lime)] group-aria-[current=location]:bg-[var(--lime)] group-aria-[current=location]:text-[var(--active-control-foreground)]"
                  aria-hidden="true"
                >
                  {formatIndex(index)}
                </span>
                <span className="flex flex-col gap-1">
                  <strong className="text-sm font-normal tracking-[-0.01em]">{copy.label}</strong>
                  <small className="font-mono text-[8px] tracking-[0.12em] text-[var(--dim)] transition-colors group-aria-[current=location]:text-[var(--cyan)]">
                    {copy.title}
                  </small>
                </span>
              </a>
            </li>
          )
        })}
      </ol>
      <p className="mt-6 flex items-center gap-2 font-mono text-[8px] tracking-[0.12em] text-[var(--dim)]">
        <i
          className="inline-block size-[7px] rounded-full bg-[var(--lime)] shadow-[0_0_0_5px_rgb(220_239_104_/_10%)]"
          aria-hidden="true"
        />
        {m.signal_locked({}, options)}
      </p>
    </motionElement.nav>
  )
}

function TransmissionSection({
  locale,
  worldId,
  index,
}: {
  locale: Locale
  worldId: WorldId
  index: number
}) {
  const options = { locale }
  const transmission = getTransmission(worldId, locale)
  const copy = getWorldCopy(worldId, locale)
  const titleId = `reading-${worldId}-title`

  return (
    <section
      id={worldId}
      tabIndex={-1}
      className="transmission relative scroll-mt-10 border border-[color-mix(in_srgb,var(--paper)_34%,transparent)] bg-[var(--transmission-background)] shadow-[0_0_0_7px_rgb(90_217_210_/_4%)] outline-none focus-visible:outline-2 focus-visible:outline-offset-6 focus-visible:outline-[var(--lime)] max-[900px]:scroll-mt-20"
      aria-labelledby={titleId}
      data-reading-section={worldId}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(to_bottom,transparent_0_3px,var(--paper)_4px)] opacity-[0.035]"
        aria-hidden="true"
      />
      <header className="relative grid h-14 grid-cols-[1fr_auto] items-center gap-4 border-b border-[var(--line)] px-[22px] font-mono text-[9px] tracking-[0.12em] max-[620px]:px-[15px]">
        <span className="text-[var(--cyan)]">
          <i
            className="mr-2 inline-block size-[7px] rounded-full bg-[var(--coral)]"
            aria-hidden="true"
          />{' '}
          {transmission.channel}
        </span>
        <span className="text-[var(--dim)]">
          {m.reading_signal_count(
            { current: formatIndex(index), total: String(worlds.length).padStart(2, '0') },
            options,
          )}
        </span>
      </header>

      <div className="relative grid grid-cols-[150px_minmax(0,1fr)] gap-11 px-12 py-12 max-[1100px]:grid-cols-[120px_minmax(0,1fr)] max-[1100px]:gap-8 max-[1100px]:px-9 max-[620px]:block max-[620px]:px-[22px] max-[620px]:py-8">
        <div className="sticky top-10 self-start border-r border-[var(--line)] pr-8 max-[1100px]:pr-6 max-[620px]:static max-[620px]:mb-7 max-[620px]:flex max-[620px]:items-center max-[620px]:gap-5 max-[620px]:border-r-0 max-[620px]:border-b max-[620px]:pr-0 max-[620px]:pb-5">
          {transmission.portrait && (
            <div className="relative mb-6 size-[92px] shrink-0 overflow-hidden rounded-full border border-[rgb(255_226_167_/_88%)] bg-[var(--space)] shadow-[0_0_0_6px_rgb(90_217_210_/_8%)] max-[620px]:mb-0 max-[620px]:size-16">
              <img
                className="h-full w-full object-cover object-[50%_24%] grayscale contrast-110 saturate-0"
                src={transmission.portrait.src}
                alt={transmission.portrait.alt}
              />
              <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,color-mix(in_srgb,var(--cyan)_22%,transparent),transparent_45%,color-mix(in_srgb,var(--coral)_13%,transparent))] mix-blend-color" />
            </div>
          )}
          <div aria-hidden="true">
            <p className="font-mono text-[44px] leading-[0.8] font-bold tracking-[-0.08em] text-[var(--paper)] max-[620px]:text-[32px]">
              {formatIndex(index)}
            </p>
            <p className="mt-3 font-mono text-[9px] tracking-[0.14em] text-[var(--dim)] uppercase">
              {copy.label}
            </p>
          </div>
          <StaticSignalBars offset={index} />
        </div>

        <div className="max-w-[640px]">
          <p className="font-mono text-[10px] tracking-[0.15em] text-[var(--coral)]">
            {transmission.kicker}
          </p>
          <h2
            className="my-5 mb-7 text-[clamp(2.2rem,3.6vw,3.9rem)] leading-[0.9] tracking-[-0.06em] max-[620px]:text-[10vw]"
            id={titleId}
          >
            {transmission.title}
          </h2>
          <p className="text-[17px] leading-[1.65] text-[#c7c7bd] max-[620px]:text-base">
            {transmission.lead}
          </p>
          <TransmissionDetails details={transmission.details} comfortable />
          {transmission.missionLog && (
            <MissionLog missions={transmission.missionLog} locale={locale} comfortable />
          )}
          {transmission.downloads && (
            <TransmissionDownloads downloads={transmission.downloads} comfortable />
          )}
          <TransmissionQuote quote={transmission.quote} comfortable />
        </div>
      </div>
    </section>
  )
}

export function ReadingMode({
  locale,
  activeSection,
  isEntering,
  onActiveSectionChange,
}: ReadingModeProps) {
  const options = { locale }
  const reveal = createReveal(isEntering, Boolean(useReducedMotion()))
  const hash = useRouterState({ select: (state) => state.location.hash })

  // Arriving from orbit view: the router could not scroll yet because this view mounts after the exit.
  useEffect(() => {
    const section = worldIdSchema.safeParse(window.location.hash.slice(1)).data
    const element = section && document.getElementById(section)
    if (element) window.scrollTo({ top: getLayoutTop(element), behavior: 'instant' })
    else onActiveSectionChange('home')
  }, [onActiveSectionChange])

  // Move focus with the hash so keyboard and screen reader users land in the chosen transmission.
  useEffect(() => {
    const section = worldIdSchema.safeParse(hash).data
    if (!section) return
    onActiveSectionChange(section)
    document.getElementById(section)?.focus({ preventScroll: true })
  }, [hash, onActiveSectionChange])

  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-reading-section]'))
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting)
        const section = worldIdSchema.safeParse(visible?.target.id).data
        if (section) onActiveSectionChange(section)
      },
      { rootMargin: '-30% 0px -60% 0px' },
    )
    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [onActiveSectionChange])

  return (
    <div className="relative mx-auto grid w-full max-w-[1240px] grid-cols-[230px_minmax(0,1fr)] gap-[clamp(2.5rem,5vw,5rem)] px-[3vw] pt-[clamp(2.5rem,8vh,5.5rem)] pb-24 max-[900px]:block max-[900px]:pt-8">
      <SectionIndex
        locale={locale}
        activeSection={activeSection}
        variant="sidebar"
        reveal={reveal(0.12)}
      />

      <div className="min-w-0">
        <motionElement.div
          {...reveal(0)}
          className="mb-[clamp(2.5rem,7vh,4.5rem)] max-w-[620px] max-[900px]:mb-8"
        >
          <span className="font-mono text-[9px] font-bold tracking-[0.15em] text-[var(--dim)]">
            {m.reading_kicker({}, options)}
          </span>
          <h1 className="my-[18px] mb-[22px] text-[clamp(3rem,5.2vw,6rem)] leading-[0.86] tracking-[-0.065em] max-[900px]:text-[12vw] max-[620px]:text-[14vw]">
            {m.reading_title_prefix({}, options)}{' '}
            <em className="text-[var(--coral)] not-italic">
              {m.reading_title_accent({}, options)}
            </em>
          </h1>
          <p className="max-w-[440px] font-mono text-xs leading-[1.6] text-[#a7adab]">
            {m.reading_intro({}, options)}
          </p>
        </motionElement.div>

        <SectionIndex
          locale={locale}
          activeSection={activeSection}
          variant="bar"
          reveal={reveal(0.08)}
        />

        <ol className="list-none p-0">
          {worlds.map((world, index) => (
            <motionElement.li {...reveal(0.18 + index * 0.08)} key={world.id}>
              {index > 0 && (
                <div
                  className="ml-[25px] h-14 w-px border-l border-dashed border-[color-mix(in_srgb,var(--cyan)_45%,transparent)] max-[620px]:ml-[18px] max-[620px]:h-10"
                  aria-hidden="true"
                />
              )}
              <TransmissionSection locale={locale} worldId={world.id} index={index} />
            </motionElement.li>
          ))}
        </ol>

        <motionElement.div {...reveal(0.6)}>
          <div className="mt-14 flex items-center gap-4 font-mono text-[9px] tracking-[0.15em] text-[var(--dim)]">
            <span className="h-px flex-1 bg-[var(--line)]" />
            {m.reading_end({}, options)}
            <span className="h-px flex-1 bg-[var(--line)]" />
          </div>
          <div className="mt-6 flex justify-center">
            <Link
              to="/$locale"
              params={{ locale }}
              activeOptions={{ exact: true, includeSearch: true }}
              resetScroll={false}
              className="inline-flex min-h-12 items-center border border-[var(--cyan)] px-5 font-mono text-[10px] tracking-[0.1em] text-[var(--cyan)] no-underline transition-colors hover:bg-[var(--cyan)] hover:text-[var(--space)]"
            >
              {m.reading_back_to_orbit({}, options)}
            </Link>
          </div>
        </motionElement.div>
      </div>
    </div>
  )
}
