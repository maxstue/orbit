import { useEffect, useRef } from 'react'

import { objectCursorImages, type ObjectCursor } from './object-cursor'

export function ObjectCursorOverlay({ cursor }: { cursor?: ObjectCursor }) {
  const cursorRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    function followPointer(event: PointerEvent) {
      const element = cursorRef.current
      if (!element) return

      element.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0) translate(-50%, -50%)`
    }

    document.addEventListener('pointermove', followPointer, { passive: true })
    return () => document.removeEventListener('pointermove', followPointer)
  }, [])

  return (
    <img
      ref={cursorRef}
      className={`pointer-events-none fixed top-0 left-0 z-50 size-8 max-w-none select-none transition-opacity duration-75 ${cursor ? 'opacity-100' : 'opacity-0'}`}
      src={cursor ? objectCursorImages[cursor] : objectCursorImages.satellite}
      alt=""
      aria-hidden="true"
    />
  )
}
