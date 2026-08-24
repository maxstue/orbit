import { z } from 'zod'

export const localeSchema = z.enum(['en', 'de'])
export type Locale = z.infer<typeof localeSchema>

export const worldIdSchema = z.enum(['home', 'current', 'workbench', 'side-quests', 'comms'])
export type WorldId = z.infer<typeof worldIdSchema>

const localizedCopySchema = z.record(
  localeSchema,
  z.object({ title: z.string(), description: z.string() }),
)

export const worldSchema = z.object({
  id: worldIdSchema,
  signal: z.string(),
  color: z.enum(['coral', 'lime', 'cyan', 'violet', 'cream']),
  size: z.enum(['sm', 'md', 'lg']),
  orbit: z.number().int().min(1).max(5),
  copy: localizedCopySchema,
})

export type World = z.infer<typeof worldSchema>

export const worlds = z.array(worldSchema).parse([
  {
    id: 'home',
    signal: 'BASE',
    color: 'coral',
    size: 'lg',
    orbit: 1,
    copy: {
      en: { title: 'Home', description: 'The person behind the signal.' },
      de: { title: 'Home', description: 'Die Person hinter dem Signal.' },
    },
  },
  {
    id: 'current',
    signal: 'NOW',
    color: 'lime',
    size: 'md',
    orbit: 2,
    copy: {
      en: { title: 'Current', description: 'What has my attention right now.' },
      de: {
        title: 'Aktuell',
        description: 'Was gerade meine Aufmerksamkeit hat.',
      },
    },
  },
  {
    id: 'workbench',
    signal: 'LAB',
    color: 'cyan',
    size: 'lg',
    orbit: 3,
    copy: {
      en: {
        title: 'Workbench',
        description: 'Things built, tested, and learned.',
      },
      de: {
        title: 'Werkbank',
        description: 'Gebautes, Getestetes und Gelerntes.',
      },
    },
  },
  {
    id: 'side-quests',
    signal: 'DRIFT',
    color: 'violet',
    size: 'sm',
    orbit: 4,
    copy: {
      en: {
        title: 'Side quests',
        description: 'Curiosity beyond the main route.',
      },
      de: {
        title: 'Nebenmissionen',
        description: 'Neugier abseits der Hauptroute.',
      },
    },
  },
  {
    id: 'comms',
    signal: 'LINK',
    color: 'cream',
    size: 'md',
    orbit: 5,
    copy: {
      en: { title: 'Comms', description: 'Ways to start a conversation.' },
      de: { title: 'Kontakt', description: 'Wege, ein Gespräch zu beginnen.' },
    },
  },
])

export function getWorld(id: WorldId) {
  return worlds.find((world) => world.id === id)
}

export function getAdjacentWorld(id: WorldId, direction: 1 | -1) {
  const index = worlds.findIndex((world) => world.id === id)
  return worlds[(index + direction + worlds.length) % worlds.length]
}
