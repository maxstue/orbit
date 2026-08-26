import { describe, expect, it } from 'vite-plus/test'

import { worlds } from '../data/worlds'
import { getTransmission } from './content'

describe('transmission content', () => {
  it.each(['en', 'de'] as const)('provides complete %s content for every destination', (locale) => {
    for (const world of worlds) {
      const transmission = getTransmission(world.id, locale)

      expect(transmission.channel.trim()).not.toBe('')
      expect(transmission.kicker.trim()).not.toBe('')
      expect(transmission.title.trim()).not.toBe('')
      expect(transmission.lead.trim()).not.toBe('')
      expect(transmission.quote.trim()).not.toBe('')
      expect(transmission.details).toHaveLength(world.id === 'side-quests' ? 4 : 3)
      expect(
        transmission.details.every((detail) => detail.label.trim() && detail.value.trim()),
      ).toBe(true)
    }
  })

  it('exposes the verified communications links only on the contact transmission', () => {
    expect(getTransmission('comms', 'en').details.map((detail) => detail.href)).toEqual([
      'mailto:dev@justmax.xyz',
      'https://github.com/maxstue',
      'https://www.linkedin.com/in/maximilian-st%C3%BCmpfl-ba2832205/',
    ])
    expect(getTransmission('home', 'en').details.every((detail) => detail.href === undefined)).toBe(
      true,
    )
  })
})
