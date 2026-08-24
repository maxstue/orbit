import { m } from '@/paraglide/messages.js'

import type { Locale, WorldId } from '../data/worlds'

type WorldCopy = { label: string; title: string; description: string }

export function getWorldCopy(id: WorldId, locale: Locale): WorldCopy {
  const options = { locale }
  const copy: Record<WorldId, WorldCopy> = {
    home: {
      label: m.world_home_label({}, options),
      title: m.world_home_display_title({}, options),
      description: m.world_home_description({}, options),
    },
    current: {
      label: m.world_current_label({}, options),
      title: m.world_current_display_title({}, options),
      description: m.world_current_description({}, options),
    },
    workbench: {
      label: m.world_workbench_label({}, options),
      title: m.world_workbench_display_title({}, options),
      description: m.world_workbench_description({}, options),
    },
    'side-quests': {
      label: m.world_side_quests_label({}, options),
      title: m.world_side_quests_display_title({}, options),
      description: m.world_side_quests_description({}, options),
    },
    comms: {
      label: m.world_comms_label({}, options),
      title: m.world_comms_display_title({}, options),
      description: m.world_comms_description({}, options),
    },
  }

  return copy[id]
}
