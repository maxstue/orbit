import { describe, expect, it } from 'vite-plus/test'

import { worlds } from '../data/worlds'
import { getWorldCopy } from './world-copy'

describe('world copy', () => {
  it.each(['en', 'de'] as const)('provides complete %s copy for every destination', (locale) => {
    for (const world of worlds) {
      const copy = getWorldCopy(world.id, locale)

      expect(copy.label.trim()).not.toBe('')
      expect(copy.title.trim()).not.toBe('')
      expect(copy.description.trim()).not.toBe('')
    }
  })

  it('localizes visible copy instead of reusing the English workbench description', () => {
    expect(getWorldCopy('workbench', 'en').description).not.toBe(
      getWorldCopy('workbench', 'de').description,
    )
  })
})
