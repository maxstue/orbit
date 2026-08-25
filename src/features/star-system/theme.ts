export const themeCookieName = 'orbit-theme'
export const themeCookieMaxAge = 60 * 60 * 24 * 365

export const themePreferences = ['system', 'night', 'day'] as const
export type ThemePreference = (typeof themePreferences)[number]
export type ResolvedTheme = Exclude<ThemePreference, 'system'>

export function isThemePreference(value: string | null | undefined): value is ThemePreference {
  return themePreferences.some((preference) => preference === value)
}

export function readThemePreferenceFromCookie(cookieHeader: string): ThemePreference | undefined {
  const value = cookieHeader
    .split(';')
    .map((part) => part.trim().split('='))
    .find(([name]) => name === themeCookieName)?.[1]

  if (isThemePreference(value)) return value
  return undefined
}

export function createThemeCookie(preference: ThemePreference) {
  return `${themeCookieName}=${preference}; Path=/; Max-Age=${themeCookieMaxAge}; SameSite=Lax`
}

export function resolveTheme(preference: ThemePreference, prefersLight: boolean): ResolvedTheme {
  if (preference === 'system') return prefersLight ? 'day' : 'night'
  return preference
}

export function getNextThemePreference(preference: ThemePreference): ThemePreference {
  const index = themePreferences.indexOf(preference)
  return themePreferences[(index + 1) % themePreferences.length]
}
