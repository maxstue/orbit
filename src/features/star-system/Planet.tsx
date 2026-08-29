import type { WorldId } from './data/worlds'

type PlanetProps = {
  worldId: WorldId
}

export function Planet({ worldId }: PlanetProps) {
  if (worldId === 'home') {
    return (
      <span
        className="planet planet-home relative grid size-[var(--planet-size,115px)] place-items-center overflow-visible rounded-full border border-[rgb(255_226_167_/_88%)] text-[var(--space)]"
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
      aria-hidden="true"
    >
      <i />
      <span
        className={`planet-details pointer-events-none absolute rounded-full border border-dashed border-[rgb(242_238_225_/_22%)] ${worldId === 'current' ? '-inset-[13px]' : worldId === 'comms' ? '-inset-[11px]' : '-inset-[18px]'}`}
      >
        <b className="absolute top-[10%] right-[5%] block size-2 rounded-full border border-[var(--paper)] bg-[var(--space)]" />
        {(worldId === 'side-quests' || worldId === 'workbench') && (
          <b className="absolute bottom-[4%] left-[9%] block size-[5px] rounded-full border border-[var(--paper)] bg-[var(--coral)]" />
        )}
      </span>
    </span>
  )
}
