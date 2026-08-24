import { m } from '@/paraglide/messages.js'

import type { Locale, WorldId } from '../data/worlds'

export type Transmission = {
  channel: string
  title: string
  kicker: string
  lead: string
  details: { label: string; value: string; href?: string }[]
  quote: string
}

export function getTransmission(id: WorldId, locale: Locale): Transmission {
  const options = { locale }
  const transmissions: Record<WorldId, Transmission> = {
    home: {
      channel: m.home_channel({}, options),
      kicker: m.home_kicker({}, options),
      title: m.home_title({}, options),
      lead: m.home_lead({}, options),
      details: [
        {
          label: m.home_detail_one_label({}, options),
          value: m.home_detail_one_value({}, options),
        },
        {
          label: m.home_detail_two_label({}, options),
          value: m.home_detail_two_value({}, options),
        },
        {
          label: m.home_detail_three_label({}, options),
          value: m.home_detail_three_value({}, options),
        },
      ],
      quote: m.home_quote({}, options),
    },
    current: {
      channel: m.current_channel({}, options),
      kicker: m.current_kicker({}, options),
      title: m.current_title({}, options),
      lead: m.current_lead({}, options),
      details: [
        {
          label: m.current_detail_one_label({}, options),
          value: m.current_detail_one_value({}, options),
        },
        {
          label: m.current_detail_two_label({}, options),
          value: m.current_detail_two_value({}, options),
        },
        {
          label: m.current_detail_three_label({}, options),
          value: m.current_detail_three_value({}, options),
        },
      ],
      quote: m.current_quote({}, options),
    },
    workbench: {
      channel: m.workbench_channel({}, options),
      kicker: m.workbench_kicker({}, options),
      title: m.workbench_title({}, options),
      lead: m.workbench_lead({}, options),
      details: [
        {
          label: m.workbench_detail_one_label({}, options),
          value: m.workbench_detail_one_value({}, options),
        },
        {
          label: m.workbench_detail_two_label({}, options),
          value: m.workbench_detail_two_value({}, options),
        },
        {
          label: m.workbench_detail_three_label({}, options),
          value: m.workbench_detail_three_value({}, options),
        },
      ],
      quote: m.workbench_quote({}, options),
    },
    'side-quests': {
      channel: m.side_quests_channel({}, options),
      kicker: m.side_quests_kicker({}, options),
      title: m.side_quests_title({}, options),
      lead: m.side_quests_lead({}, options),
      details: [
        {
          label: m.side_quests_detail_one_label({}, options),
          value: m.side_quests_detail_one_value({}, options),
        },
        {
          label: m.side_quests_detail_two_label({}, options),
          value: m.side_quests_detail_two_value({}, options),
        },
        {
          label: m.side_quests_detail_three_label({}, options),
          value: m.side_quests_detail_three_value({}, options),
        },
        {
          label: m.side_quests_detail_four_label({}, options),
          value: m.side_quests_detail_four_value({}, options),
        },
      ],
      quote: m.side_quests_quote({}, options),
    },
    comms: {
      channel: m.comms_channel({}, options),
      kicker: m.comms_kicker({}, options),
      title: m.comms_title({}, options),
      lead: m.comms_lead({}, options),
      details: [
        {
          label: m.comms_detail_one_label({}, options),
          value: m.comms_detail_one_value({}, options),
          href: 'mailto:max@example.com',
        },
        {
          label: m.comms_detail_two_label({}, options),
          value: m.comms_detail_two_value({}, options),
        },
        {
          label: m.comms_detail_three_label({}, options),
          value: m.comms_detail_three_value({}, options),
        },
      ],
      quote: m.comms_quote({}, options),
    },
  }

  return transmissions[id]
}
