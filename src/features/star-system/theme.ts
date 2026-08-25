export const themeStorageKey = 'orbit-theme'

export const themePreferences = ['system', 'night', 'day'] as const
export type ThemePreference = (typeof themePreferences)[number]
export type ResolvedTheme = Exclude<ThemePreference, 'system'>

export function isThemePreference(value: string | null): value is ThemePreference {
  return themePreferences.some((preference) => preference === value)
}

export function resolveTheme(preference: ThemePreference, prefersLight: boolean): ResolvedTheme {
  if (preference === 'system') return prefersLight ? 'day' : 'night'
  return preference
}

export function getNextThemePreference(preference: ThemePreference): ThemePreference {
  const index = themePreferences.indexOf(preference)
  return themePreferences[(index + 1) % themePreferences.length]
}
