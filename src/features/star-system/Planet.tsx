import type { WorldId } from './data/worlds'

type PlanetProps = {
  worldId: WorldId
}

export function Planet({ worldId }: PlanetProps) {
  if (worldId === 'home') {
    return (
      <span className="planet planet-home" aria-hidden="true">
        <span className="planet-monogram">M</span>
        <i className="planet-marker" />
      </span>
    )
  }

  return (
    <span className={`planet planet-${worldId}`} aria-hidden="true">
      <i />
      <span className="planet-details">
        <b />
        {(worldId === 'side-quests' || worldId === 'workbench') && <b />}
      </span>
    </span>
  )
}
