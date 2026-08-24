import { m } from '@/paraglide/messages.js'

import type { Locale, WorldId } from '../data/worlds'

export type Transmission = {
  title: string
  kicker: string
  lead: string
  sections: {
    heading: string
    body: string
    links?: { label: string; href: string; external?: boolean }[]
  }[]
}

export function getTransmission(id: WorldId, locale: Locale): Transmission {
  const options = { locale }
  const transmissions: Record<WorldId, Transmission> = {
    home: {
      title: m.home_title({}, options),
      kicker: m.home_kicker({}, options),
      lead: m.home_lead({}, options),
      sections: [
        {
          heading: m.home_section_one_title({}, options),
          body: m.home_section_one_body({}, options),
        },
        {
          heading: m.home_section_two_title({}, options),
          body: m.home_section_two_body({}, options),
        },
      ],
    },
    current: {
      title: m.current_title({}, options),
      kicker: m.current_kicker({}, options),
      lead: m.current_lead({}, options),
      sections: [
        {
          heading: m.current_section_one_title({}, options),
          body: m.current_section_one_body({}, options),
        },
        {
          heading: m.current_section_two_title({}, options),
          body: m.current_section_two_body({}, options),
        },
      ],
    },
    workbench: {
      title: m.workbench_title({}, options),
      kicker: m.workbench_kicker({}, options),
      lead: m.workbench_lead({}, options),
      sections: [
        {
          heading: m.workbench_section_one_title({}, options),
          body: m.workbench_section_one_body({}, options),
        },
        {
          heading: m.workbench_section_two_title({}, options),
          body: m.workbench_section_two_body({}, options),
        },
        {
          heading: m.workbench_projects_title({}, options),
          body: m.workbench_projects_body({}, options),
          links: [
            { label: 'Veo', href: 'https://github.com/maxstue/veo', external: true },
            { label: 'kijk', href: 'https://github.com/maxstue/kijk', external: true },
            { label: 'Orbit', href: 'https://github.com/maxstue/orbit', external: true },
          ],
        },
      ],
    },
    'side-quests': {
      title: m.side_quests_title({}, options),
      kicker: m.side_quests_kicker({}, options),
      lead: m.side_quests_lead({}, options),
      sections: [
        {
          heading: m.side_quests_section_one_title({}, options),
          body: m.side_quests_section_one_body({}, options),
        },
        {
          heading: m.side_quests_section_two_title({}, options),
          body: m.side_quests_section_two_body({}, options),
        },
      ],
    },
    comms: {
      title: m.comms_title({}, options),
      kicker: m.comms_kicker({}, options),
      lead: m.comms_lead({}, options),
      sections: [
        {
          heading: m.comms_section_one_title({}, options),
          body: m.comms_section_one_body({}, options),
          links: [
            { label: 'dev@justmax.xyz', href: 'mailto:dev@justmax.xyz' },
            { label: 'GitHub', href: 'https://github.com/maxstue', external: true },
            {
              label: 'LinkedIn',
              href: 'https://www.linkedin.com/in/maximilian-st%C3%BCmpfl-ba2832205/',
              external: true,
            },
          ],
        },
        {
          heading: m.comms_section_two_title({}, options),
          body: m.comms_section_two_body({}, options),
        },
      ],
    },
  }
  return transmissions[id]
}
