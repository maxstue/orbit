import type { Locale, WorldId } from '../data/worlds'

type WorldCopy = { label: string; title: string; description: string }

const germanCopy: Record<WorldId, WorldCopy> = {
  home: { label: 'Start', title: 'HOME SIGNAL', description: 'Hey, ich bin Max.' },
  current: {
    label: 'Gerade',
    title: 'CURRENT ORBIT',
    description: 'Was mich gerade beschäftigt.',
  },
  workbench: {
    label: 'Arbeit',
    title: 'WORKBENCH',
    description: 'Software, die auch morgen noch jemand versteht.',
  },
  'side-quests': {
    label: 'Abseits',
    title: 'SIDE QUESTS',
    description: 'Bildschirm aus. Side Quest an.',
  },
  comms: { label: 'Kontakt', title: 'COMMS RELAY', description: 'Ein Signal senden.' },
}

const englishCopy: Record<WorldId, WorldCopy> = {
  home: { label: 'Home', title: 'HOME SIGNAL', description: "Hey, I'm Max." },
  current: {
    label: 'Current',
    title: 'CURRENT ORBIT',
    description: 'What has my attention right now.',
  },
  workbench: {
    label: 'Work',
    title: 'WORKBENCH',
    description: 'Software someone can still understand tomorrow.',
  },
  'side-quests': {
    label: 'Off duty',
    title: 'SIDE QUESTS',
    description: 'Screen off. Side quest on.',
  },
  comms: { label: 'Contact', title: 'COMMS RELAY', description: 'Send a signal.' },
}

export function getWorldCopy(id: WorldId, locale: Locale) {
  return locale === 'de' ? germanCopy[id] : englishCopy[id]
}
