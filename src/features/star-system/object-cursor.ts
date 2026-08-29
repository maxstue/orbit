export type ObjectCursor = 'asteroid' | 'meteor' | 'satellite'

export const objectCursorStyles: Record<ObjectCursor, string> = {
  asteroid: "url('/cursors/asteroid.png') 16 16, default",
  meteor: "url('/cursors/meteor.png') 23 10, default",
  satellite: "url('/cursors/satellite.png') 16 16, default",
}
