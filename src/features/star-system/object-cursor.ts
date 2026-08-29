export type ObjectCursor = 'asteroid' | 'meteor' | 'satellite'

export const objectCursorStyles: Record<ObjectCursor, string> = {
  asteroid: "url('/cursors/asteroid.svg') 16 16, default",
  meteor: "url('/cursors/meteor.svg') 23 10, default",
  satellite: "url('/cursors/satellite.svg') 16 16, default",
}
