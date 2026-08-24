import { describe, expect, it } from 'vite-plus/test'

import { getAdjacentWorld, getWorld, worlds, worldSchema } from './worlds'

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
})
