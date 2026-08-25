const ease = [0.22, 1, 0.36, 1] as const

export function getTransmissionMotion(reduceMotion: boolean | null) {
  if (reduceMotion) {
    return {
      initial: false as const,
      animate: { x: 0, opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0 },
    }
  }

  return {
    initial: { x: 36, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: 28, opacity: 0, transition: { duration: 0.24, ease } },
    transition: { duration: 0.32, ease },
  }
}
