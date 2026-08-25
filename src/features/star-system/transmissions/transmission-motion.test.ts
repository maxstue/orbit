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

  it('uses a calmer entrance and a faster exit by default', () => {
    expect(getTransmissionMotion(false)).toMatchObject({
      initial: { x: 72, opacity: 0 },
      animate: { x: 0, opacity: 1 },
      exit: { x: 48, opacity: 0, transition: { duration: 0.3 } },
      transition: { duration: 0.42 },
    })
  })
})
