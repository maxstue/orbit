import { describe, expect, it } from 'vite-plus/test'

import { getTransmissionMotion } from './transmission-motion'

describe('transmission motion', () => {
  it('removes movement and transition time when reduced motion is preferred', () => {
    expect(getTransmissionMotion(true)).toEqual({
      initial: false,
      animate: { x: 0, opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0 },
    })
  })

  it.each([false, null])(
    'uses a calmer entrance and a faster exit without reduced motion (%s)',
    (reducedMotion) => {
      expect(getTransmissionMotion(reducedMotion)).toMatchObject({
        initial: { x: 36, opacity: 0 },
        animate: { x: 0, opacity: 1 },
        exit: { x: 28, opacity: 0, transition: { duration: 0.24 } },
        transition: { duration: 0.32 },
      })
    },
  )
})
