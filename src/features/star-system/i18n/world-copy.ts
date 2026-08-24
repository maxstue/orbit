import { m } from '@/paraglide/messages.js'

import type { Locale, WorldId } from '../data/worlds'

export function getWorldCopy(id: WorldId, locale: Locale) {
  const options = { locale }
  const copy: Record<WorldId, { title: string; description: string }> = {
    home: {
      title: m.world_home_title({}, options),
      description: m.world_home_description({}, options),
    },
    current: {
      title: m.world_current_title({}, options),
      description: m.world_current_description({}, options),
    },
    workbench: {
      title: m.world_workbench_title({}, options),
      description: m.world_workbench_description({}, options),
    },
    'side-quests': {
      title: m.world_side_quests_title({}, options),
      description: m.world_side_quests_description({}, options),
    },
    comms: {
      title: m.world_comms_title({}, options),
      description: m.world_comms_description({}, options),
    },
  }
  return copy[id]
}
