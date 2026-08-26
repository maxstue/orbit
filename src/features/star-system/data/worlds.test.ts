import { describe, expect, it } from 'vite-plus/test'

import {
  getAdjacentWorld,
  getWorld,
  getWorldByShortcut,
  localeSchema,
  worlds,
  worldIdSchema,
  worldSchema,
} from './worlds'

describe('world model', () => {
  it('contains five valid, unique destinations', () => {
    expect(worlds).toHaveLength(5)
    expect(new Set(worlds.map((world) => world.id)).size).toBe(worlds.length)
    expect(worlds.every((world) => worldSchema.safeParse(world).success)).toBe(true)
  })

  it('resolves a world by id', () => {
    expect(getWorld('workbench')?.signal).toBe('LAB')
  })

  it('wraps adjacent navigation around the system', () => {
    expect(getAdjacentWorld('comms', 1)?.id).toBe('home')
    expect(getAdjacentWorld('home', -1)?.id).toBe('comms')
  })

  it('accepts only supported locales and signals', () => {
    expect(localeSchema.safeParse('de').success).toBe(true)
    expect(localeSchema.safeParse('fr').success).toBe(false)
    expect(worldIdSchema.safeParse('side-quests').success).toBe(true)
    expect(worldIdSchema.safeParse('unknown').success).toBe(false)
  })

  it('maps number shortcuts to their destination', () => {
    for (const [index, world] of worlds.entries()) {
      expect(getWorldByShortcut(String(index + 1))?.id).toBe(world.id)
    }
    expect(
      ['0', '6', '1.5', 'x'].every((shortcut) => getWorldByShortcut(shortcut) === undefined),
    ).toBe(true)
  })
})
