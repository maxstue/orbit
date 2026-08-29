import { useReducedMotion } from 'motion/react'
import * as motionElement from 'motion/react-m'

import type { WorldId } from './data/worlds'

type PlanetProps = {
  viewTransitionName?: string
  worldId: WorldId
}

type Companion = {
  duration: number
  kind: 'moon' | 'satellite'
  orbitClassName: string
  startAngle: number
  visualClassName?: string
}

const companionsByWorld: Partial<Record<WorldId, Companion[]>> = {
  current: [
    {
      duration: 11,
      kind: 'moon',
      orbitClassName: 'size-[calc(100%+34px)]',
      startAngle: 28,
      visualClassName: 'size-[7px] bg-[#d8d4c7]',
    },
  ],
  workbench: [
    {
      duration: 15,
      kind: 'satellite',
      orbitClassName: 'size-[calc(100%+46px)]',
      startAngle: 215,
    },
  ],
  'side-quests': [
    {
      duration: 13,
      kind: 'moon',
      orbitClassName: 'size-[calc(100%+38px)]',
      startAngle: 65,
      visualClassName: 'size-2 bg-[#c2bde9]',
    },
    {
      duration: 21,
      kind: 'moon',
      orbitClassName: 'size-[calc(100%+58px)]',
      startAngle: 238,
      visualClassName: 'size-[5px] bg-[#8d87c8]',
    },
  ],
  comms: [
    {
      duration: 9,
      kind: 'moon',
      orbitClassName: 'size-[calc(100%+30px)]',
      startAngle: 145,
      visualClassName: 'size-1.5 bg-[#f2eee1]',
    },
  ],
}

function OrbitalCompanions({ worldId }: { worldId: WorldId }) {
  const reduceMotion = useReducedMotion()
  const companions = companionsByWorld[worldId] ?? []

  return companions.map((companion, index) => {
    const rotation = reduceMotion
      ? companion.startAngle
      : [companion.startAngle, companion.startAngle + 360]

    return (
      <span
        className={`pointer-events-none absolute top-1/2 left-1/2 z-4 -translate-1/2 ${companion.orbitClassName}`}
        key={`${companion.kind}-${index}`}
      >
        <motionElement.span
          className="absolute inset-0 block rounded-full border border-dashed border-[rgb(242_238_225_/_12%)]"
          animate={{ rotate: rotation }}
          transition={
            reduceMotion
              ? undefined
              : { duration: companion.duration, ease: 'linear', repeat: Infinity }
          }
        >
          <span className="absolute top-1/2 -right-px -translate-y-1/2">
            {companion.kind === 'satellite' ? (
              <span className="relative block h-[7px] w-3 rounded-[2px] border border-[var(--paper)] bg-[#263536] shadow-[0_0_9px_rgb(90_217_210_/_35%)] before:absolute before:top-1/2 before:right-full before:h-1 before:w-2 before:-translate-y-1/2 before:border before:border-[var(--cyan)] before:bg-[rgb(90_217_210_/_28%)] after:absolute after:top-1/2 after:left-full after:h-1 after:w-2 after:-translate-y-1/2 after:border after:border-[var(--cyan)] after:bg-[rgb(90_217_210_/_28%)]" />
            ) : (
              <span
                className={`block rounded-full border border-[rgb(242_238_225_/_65%)] shadow-[inset_-2px_-2px_rgb(0_0_0_/_20%),0_0_8px_rgb(242_238_225_/_18%)] ${companion.visualClassName}`}
              />
            )}
          </span>
        </motionElement.span>
      </span>
    )
  })
}

export function Planet({ viewTransitionName = 'none', worldId }: PlanetProps) {
  if (worldId === 'home') {
    return (
      <span
        className="planet planet-home relative grid size-[var(--planet-size,115px)] place-items-center overflow-visible rounded-full border border-[rgb(255_226_167_/_88%)] text-[var(--space)]"
        style={{ viewTransitionName }}
        aria-hidden="true"
      >
        <span className="planet-monogram relative z-2 rotate-[-7deg] text-[3.65rem] leading-none font-black text-[var(--space)] opacity-[0.88] max-[900px]:text-[3.5rem] max-[620px]:text-5xl">
          M
        </span>
        <i className="planet-marker absolute -top-[5px] -right-[7px] z-3 size-[11px] rounded-full border-2 border-[var(--paper)] bg-[var(--lime)]" />
      </span>
    )
  }

  return (
    <span
      className={`planet planet-${worldId} relative block rounded-full transition-[transform,box-shadow] duration-[280ms]`}
      style={{ viewTransitionName }}
      aria-hidden="true"
    >
      <i />
      <span
        className={`planet-details pointer-events-none absolute rounded-full border border-dashed border-[rgb(242_238_225_/_22%)] ${worldId === 'current' ? '-inset-[13px]' : worldId === 'comms' ? '-inset-[11px]' : '-inset-[18px]'}`}
      />
      <OrbitalCompanions worldId={worldId} />
    </span>
  )
}
