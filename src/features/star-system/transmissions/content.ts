import { m } from '@/paraglide/messages.js'

import type { Locale, WorldId } from '../data/worlds'

export type Transmission = {
  channel: string
  title: string
  kicker: string
  lead: string
  details: { label: string; value: string; href?: string }[]
  downloads?: { label: string; href: string }[]
  missionLog?: {
    period: string
    status: string
    title: string
    organization: string
    summary: string
    tags: string[]
    current?: boolean
  }[]
  portrait?: { src: string; alt: string }
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
      downloads: [
        {
          label: m.resume_download_de({}, options),
          href: '/downloads/Maximilian-Stuempfl-Lebenslauf-DE.pdf',
        },
        {
          label: m.resume_download_en({}, options),
          href: '/downloads/Maximilian-Stuempfl-Resume-EN.pdf',
        },
      ],
      portrait: {
        src: '/images/maximilian-stuempfl.jpg',
        alt: m.home_portrait_alt({}, options),
      },
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
      details: [],
      missionLog: [
        {
          period: m.workbench_mission_current_period({}, options),
          status: m.workbench_mission_current_status({}, options),
          title: m.workbench_mission_current_title({}, options),
          organization: m.workbench_mission_current_org({}, options),
          summary: m.workbench_mission_current_summary({}, options),
          tags: ['React', 'TypeScript', '.NET', 'Azure'],
          current: true,
        },
        {
          period: m.workbench_mission_exxeta_period({}, options),
          status: m.workbench_mission_exxeta_status({}, options),
          title: m.workbench_mission_exxeta_title({}, options),
          organization: m.workbench_mission_exxeta_org({}, options),
          summary: m.workbench_mission_exxeta_summary({}, options),
          tags: ['C#', 'Solid.js', 'PostgreSQL', 'Docker'],
        },
        {
          period: m.workbench_mission_early_period({}, options),
          status: m.workbench_mission_early_status({}, options),
          title: m.workbench_mission_early_title({}, options),
          organization: m.workbench_mission_early_org({}, options),
          summary: m.workbench_mission_early_summary({}, options),
          tags: ['Angular', 'PHP', 'MariaDB', 'Big Data'],
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
          href: 'mailto:dev@justmax.xyz',
        },
        {
          label: m.comms_detail_two_label({}, options),
          value: m.comms_detail_two_value({}, options),
          href: 'https://github.com/maxstue',
        },
        {
          label: m.comms_detail_three_label({}, options),
          value: m.comms_detail_three_value({}, options),
          href: 'https://www.linkedin.com/in/maximilian-st%C3%BCmpfl-ba2832205/',
        },
      ],
      quote: m.comms_quote({}, options),
    },
  }

  return transmissions[id]
}
