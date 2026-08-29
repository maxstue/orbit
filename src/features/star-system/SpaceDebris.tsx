import { useRef } from 'react'
import { useAnimationFrame, useReducedMotion } from 'motion/react'

const debris = [
  { delay: 4, kind: 'meteor', repeatDelay: 19, reverse: false, slope: 0.27, speed: 540, top: 8 },
  {
    delay: 12,
    kind: 'asteroid',
    repeatDelay: 29,
    reverse: true,
    slope: -0.16,
    speed: 190,
    top: 72,
  },
  { delay: 23, kind: 'meteor', repeatDelay: 36, reverse: false, slope: 0.2, speed: 460, top: 28 },
] as const

type DebrisState = {
  active: boolean
  impactAt: number
  impactX: number
  impactY: number
  nextStart: number
  vx: number
  vy: number
  x: number
  y: number
}

const interactionDistance = 90
const gravityDistance = 180

export function SpaceDebris() {
  const reduceMotion = useReducedMotion()
  const particleRefs = useRef<Array<HTMLSpanElement | null>>([])
  const bodyRefs = useRef<Array<HTMLElement | null>>([])
  const tailRefs = useRef<Array<HTMLElement | null>>([])
  const explosionRefs = useRef<Array<HTMLSpanElement | null>>([])
  const states = useRef<DebrisState[]>(
    debris.map(() => ({
      active: false,
      impactAt: -1,
      impactX: 0,
      impactY: 0,
      nextStart: -1,
      vx: 0,
      vy: 0,
      x: 0,
      y: 0,
    })),
  )

  useAnimationFrame((time, delta) => {
    if (reduceMotion) return

    const planetRects = Array.from(
      document.querySelectorAll<HTMLElement>('.system > section [data-signal] .planet'),
    ).map((planet) => planet.getBoundingClientRect())
    const dt = Math.min(delta, 50) / 1000

    debris.forEach((item, index) => {
      const particle = particleRefs.current[index]
      const body = bodyRefs.current[index]
      const tail = tailRefs.current[index]
      const explosion = explosionRefs.current[index]
      const state = states.current[index]!
      if (!particle || !body || !explosion) return

      if (state.impactAt >= 0) {
        const progress = Math.min(1, (time - state.impactAt) / 460)
        explosion.style.opacity = String((1 - progress) * 0.95)
        explosion.style.transform = `translate3d(${state.impactX}px, ${state.impactY}px, 0) scale(${0.3 + progress * 1.45})`
        if (progress >= 1) state.impactAt = -1
      }

      if (state.nextStart < 0) state.nextStart = time + item.delay * 1000
      if (!state.active && time >= state.nextStart) {
        state.active = true
        state.x = item.reverse ? window.innerWidth + 90 : -90
        state.y = (window.innerHeight * item.top) / 100
        state.vx = (item.reverse ? -1 : 1) * item.speed
        state.vy = item.speed * item.slope
        particle.style.opacity = '0.9'
      }
      if (!state.active) return

      const particleRadius = item.kind === 'meteor' ? 3 : 8
      let nearestEdge = Number.POSITIVE_INFINITY
      let nearestCenterDistance = Number.POSITIVE_INFINITY
      let gravityX = 0
      let gravityY = 0
      for (const rect of planetRects) {
        const centerX = rect.left + rect.width / 2
        const centerY = rect.top + rect.height / 2
        const planetRadius = Math.max(rect.width, rect.height) / 2
        const offsetX = centerX - state.x
        const offsetY = centerY - state.y
        const centerDistance = Math.hypot(offsetX, offsetY)
        const edgeDistance = centerDistance - planetRadius
        if (edgeDistance < nearestEdge) {
          nearestEdge = edgeDistance
          nearestCenterDistance = centerDistance
          gravityX = offsetX
          gravityY = offsetY
        }
      }

      if (nearestEdge <= particleRadius) {
        state.active = false
        state.impactAt = time
        state.impactX = state.x
        state.impactY = state.y
        state.nextStart = time + item.repeatDelay * 1000
        particle.style.opacity = '0'
        return
      }

      const gravityProximity = Math.max(0, Math.min(1, 1 - nearestEdge / gravityDistance))
      if (gravityProximity > 0 && nearestCenterDistance > 0) {
        const acceleration = 820 * gravityProximity ** 2
        state.vx += (gravityX / nearestCenterDistance) * acceleration * dt
        state.vy += (gravityY / nearestCenterDistance) * acceleration * dt
      }

      const velocity = Math.hypot(state.vx, state.vy)
      const maxVelocity = item.speed * 1.35
      if (velocity > maxVelocity) {
        state.vx = (state.vx / velocity) * maxVelocity
        state.vy = (state.vy / velocity) * maxVelocity
      }

      const proximity = Math.max(0, Math.min(1, 1 - nearestEdge / interactionDistance))
      const heat = proximity ** 0.58
      const burnScale = 1 - heat * 0.55
      const speedFactor = 0.45 + (1 - proximity) * 0.55
      state.x += state.vx * dt * speedFactor
      state.y += state.vy * dt * speedFactor

      const coolColor = item.kind === 'meteor' ? 'var(--paper)' : '#777d78'
      particle.style.transform = `translate3d(${state.x}px, ${state.y}px, 0)`
      particle.style.opacity = String(0.68 + heat * 0.32)
      body.style.backgroundColor = `color-mix(in srgb, ${coolColor} ${(1 - heat) * 100}%, #ff6a3d)`
      body.style.filter = `brightness(${1 + heat * 1.5}) drop-shadow(0 0 ${5 + heat * 18}px color-mix(in srgb, var(--cyan) ${(1 - heat) * 100}%, #ff4f2f)) drop-shadow(0 0 ${heat * 28}px rgb(255 82 42 / ${heat * 0.8}))`
      body.style.transform =
        item.kind === 'asteroid'
          ? `rotate(${time * 0.05}deg) scale(${burnScale})`
          : `scale(${burnScale})`
      if (tail) {
        const tailAngle = (Math.atan2(state.vy, state.vx) * 180) / Math.PI + 180
        tail.style.transform = `rotate(${tailAngle}deg)`
        tail.style.background = `linear-gradient(90deg,color-mix(in srgb,var(--cyan) ${(1 - heat) * 100}%,#ff6a3d),transparent)`
        tail.style.filter = `drop-shadow(0 0 ${3 + heat * 9}px rgb(255 91 49 / ${0.25 + heat * 0.65}))`
      }

      const outsideX = item.reverse ? state.x < -120 : state.x > window.innerWidth + 120
      const outsideY = state.y < -120 || state.y > window.innerHeight + 120
      if (outsideX || outsideY) {
        state.active = false
        state.nextStart = time + item.repeatDelay * 1000
        particle.style.opacity = '0'
      }
    })
  })

  if (reduceMotion) return null

  return (
    <div className="pointer-events-none absolute inset-0 z-1 overflow-hidden" aria-hidden="true">
      {debris.map((item, index) => (
        <span className="contents" key={`${item.kind}-${index}`}>
          <span
            ref={(element) => {
              explosionRefs.current[index] = element
            }}
            className="absolute top-0 left-0 block opacity-0 will-change-transform"
          >
            <i className="relative block size-3 -translate-1/2 rounded-full border border-[#ffbd68] bg-[radial-gradient(circle,#fff4bd_0_8%,#ff9a50_28%,#ff4f2f_52%,transparent_72%)] shadow-[0_0_6px_#ffb15c,0_0_14px_#ff5b35,0_0_24px_rgb(255_79_47_/_58%)] before:absolute before:top-1/2 before:left-1/2 before:h-px before:w-6 before:-translate-1/2 before:bg-[linear-gradient(90deg,transparent,#ffbd68,transparent)] after:absolute after:top-1/2 after:left-1/2 after:h-6 after:w-px after:-translate-1/2 after:bg-[linear-gradient(transparent,#ffbd68,transparent)]" />
          </span>
          <span
            ref={(element) => {
              particleRefs.current[index] = element
            }}
            className="absolute top-0 left-0 block opacity-0 transition-opacity duration-150"
          >
            {item.kind === 'meteor' && (
              <i
                ref={(element) => {
                  tailRefs.current[index] = element
                }}
                className="absolute top-1/2 left-1/2 h-px w-16 origin-left bg-[linear-gradient(90deg,var(--cyan),transparent)]"
              />
            )}
            <i
              ref={(element) => {
                bodyRefs.current[index] = element
              }}
              className={
                item.kind === 'meteor'
                  ? 'relative block size-[5px] rounded-full bg-[var(--paper)] shadow-[0_0_8px_var(--cyan)]'
                  : 'relative block h-3 w-4 [clip-path:polygon(18%_0,78%_8%,100%_42%,81%_88%,36%_100%,0_68%,6%_25%)] bg-[#777d78] shadow-[inset_-4px_-3px_rgb(12_16_17_/_38%),0_0_10px_rgb(242_238_225_/_13%)] after:absolute after:top-[2px] after:left-[4px] after:size-[3px] after:rounded-full after:bg-[rgb(12_16_17_/_28%)]'
              }
            />
          </span>
        </span>
      ))}
    </div>
  )
}
