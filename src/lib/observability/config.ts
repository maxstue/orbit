export const sentryTraceSampleRate = 0.05

export function readOptionalSetting(value: string | undefined) {
  const setting = value?.trim()
  return setting || undefined
}
