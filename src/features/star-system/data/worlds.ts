import { z } from 'zod'

export const localeSchema = z.enum(['en', 'de'])
export type Locale = z.infer<typeof localeSchema>

export const worldIdSchema = z.enum(['home', 'current', 'workbench', 'side-quests', 'comms'])
export type WorldId = z.infer<typeof worldIdSchema>

export const worldSchema = z.object({
  id: worldIdSchema,
  signal: z.string(),
  color: z.enum(['coral', 'lime', 'cyan', 'violet', 'cream']),
  size: z.enum(['sm', 'md', 'lg']),
  orbit: z.number().int().min(1).max(5),
})

export type World = z.infer<typeof worldSchema>

export const worlds = z.array(worldSchema).parse([
  {
    id: 'home',
    signal: 'BASE',
    color: 'coral',
    size: 'lg',
    orbit: 1,
  },
  {
    id: 'current',
    signal: 'NOW',
    color: 'lime',
    size: 'md',
    orbit: 2,
  },
  {
    id: 'workbench',
    signal: 'LAB',
    color: 'cyan',
    size: 'lg',
    orbit: 3,
  },
  {
    id: 'side-quests',
    signal: 'DRIFT',
    color: 'violet',
    size: 'sm',
    orbit: 4,
  },
  {
    id: 'comms',
    signal: 'LINK',
    color: 'cream',
    size: 'md',
    orbit: 5,
  },
])

export function getWorld(id: WorldId) {
  return worlds.find((world) => world.id === id)
}

export function getAdjacentWorld(id: WorldId, direction: 1 | -1) {
  const index = worlds.findIndex((world) => world.id === id)
  return worlds[(index + direction + worlds.length) % worlds.length]
}

export function getWorldByShortcut(shortcut: string) {
  const index = Number(shortcut) - 1
  return Number.isInteger(index) ? worlds[index] : undefined
}
