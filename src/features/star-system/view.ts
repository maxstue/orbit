export type ViewMode = 'orbit' | 'reading'

export type ViewSearch = { view?: 'reading' }

/** Orbit stays the default: anything other than an explicit `view=reading` falls back to it. */
export function parseViewSearch(search: Record<string, unknown>): ViewSearch {
  return search.view === 'reading' ? { view: 'reading' } : {}
}

export function getViewMode(search: ViewSearch): ViewMode {
  return search.view === 'reading' ? 'reading' : 'orbit'
}

export const loadOrbitScene = () => import('./orbit/OrbitScene')
export const loadReadingMode = () => import('./reading/ReadingMode')
