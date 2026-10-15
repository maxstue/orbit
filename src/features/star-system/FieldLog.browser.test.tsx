import '@/styles.css'
import type { ReactNode } from 'react'
import { beforeEach, expect, test, vi } from 'vite-plus/test'
import { userEvent } from 'vite-plus/test/browser'
import { render } from 'vitest-browser-react'

const navigation = vi.hoisted(() => ({ navigate: vi.fn() }))
const metrics = vi.hoisted(() => ({ captureObjectCursor: vi.fn() }))

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children }: { children: ReactNode }) => <a href="/en">{children}</a>,
  useNavigate: () => navigation.navigate,
  useRouterState: ({ select }: { select: (state: { location: { hash: string } }) => unknown }) =>
    select({ location: { hash: '' } }),
}))

vi.mock('@/lib/observability/metrics', () => ({ Metrics: metrics }))

import { FieldLog } from './FieldLog'

beforeEach(() => {
  navigation.navigate.mockReset()
  metrics.captureObjectCursor.mockReset()
  document.cookie = 'orbit-theme=; Max-Age=0; Path=/'
  delete document.documentElement.dataset.theme
  delete document.documentElement.dataset.orbitCursor
})

test('offers theme and language controls through browser locators', async () => {
  const screen = await render(<FieldLog locale="en" />)
  expect(screen).toBeDefined()

  await screen.getByRole('button', { name: 'Open appearance selection' }).click()
  await expect.element(screen.getByRole('menu', { name: 'Choose appearance' })).toBeVisible()

  await screen.getByRole('menuitemradio', { name: 'DAY' }).click()
  await expect
    .element(screen.getByRole('button', { name: 'Open appearance selection' }))
    .toHaveAttribute('title', 'Theme: DAY')

  await screen.getByRole('button', { name: 'Open language selection' }).click()
  await expect.element(screen.getByRole('menu', { name: 'Choose a language' })).toBeVisible()
})

test('uses number, arrow, and escape keys to request signal navigation', async () => {
  const screen = await render(<FieldLog locale="en" selectedSignal="workbench" />)
  // The orbit scene is lazy loaded and owns the navigation keys.
  await expect.element(screen.getByRole('dialog')).toBeVisible()

  await userEvent.keyboard('3')
  await userEvent.keyboard('{ArrowRight}')
  await userEvent.keyboard('{Escape}')

  expect(navigation.navigate).toHaveBeenNthCalledWith(1, {
    params: { locale: 'en', signal: 'workbench' },
    resetScroll: false,
    to: '/$locale/$signal',
  })
  expect(navigation.navigate).toHaveBeenNthCalledWith(2, {
    params: { locale: 'en', signal: 'side-quests' },
    resetScroll: false,
    to: '/$locale/$signal',
  })
  expect(navigation.navigate).toHaveBeenNthCalledWith(3, {
    params: { locale: 'en' },
    resetScroll: false,
    to: '/$locale',
  })
})

test('turns the cursor into a clicked satellite until escape', async () => {
  const screen = await render(<FieldLog locale="en" />)

  const satellite = screen.getByRole('button', { name: 'Use satellite cursor' })
  await expect.element(satellite).toBeInTheDocument()
  const satelliteButton = satellite.element() as HTMLButtonElement
  expect(satelliteButton.parentElement?.closest('button')).toBeNull()
  // The satellite continuously orbits, so it never reaches Playwright's stable state.
  await satellite.click({ force: true })
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))

  expect(document.documentElement.dataset.orbitCursor).toBe('satellite')
  expect(metrics.captureObjectCursor).toHaveBeenNthCalledWith(
    1,
    'satellite',
    'activated',
    'object-click',
  )
  expect(document.body.style.cursor).toContain('/cursors/satellite.svg')
  expect(getComputedStyle(document.querySelector('h1')!).cursor).toContain('/cursors/satellite.svg')
  expect(getComputedStyle(satelliteButton).cursor).toContain('/cursors/satellite.svg')
  expect(navigation.navigate).not.toHaveBeenCalled()

  await userEvent.keyboard('{Escape}')
  expect(metrics.captureObjectCursor).toHaveBeenNthCalledWith(
    2,
    'satellite',
    'deactivated',
    'escape',
  )
  expect(document.documentElement.dataset.orbitCursor).toBeUndefined()
  expect(document.body.style.cursor).toBe('')

  satelliteButton.focus()
  await userEvent.keyboard('{Enter}')
  expect(document.documentElement.dataset.orbitCursor).toBe('satellite')
})

test('hands shortcuts between views without duplicate registrations or callbacks', async () => {
  const warnings = vi.spyOn(console, 'warn')
  try {
    const screen = await render(<FieldLog locale="en" />)
    await expect.element(screen.getByRole('button', { name: 'Open home signal' })).toBeVisible()

    for (let cycle = 0; cycle < 2; cycle++) {
      await screen.rerender(<FieldLog locale="en" view="reading" />)
      await expect
        .element(screen.getByRole('button', { name: 'Open home signal' }))
        .not.toBeInTheDocument()
      await expect.element(screen.getByRole('heading', { name: "Hey, I'm Max." })).toBeVisible()
      navigation.navigate.mockClear()
      await userEvent.keyboard('3')
      expect(navigation.navigate).toHaveBeenCalledExactlyOnceWith({
        to: '/$locale',
        params: { locale: 'en' },
        search: { view: 'reading' },
        hash: 'workbench',
      })
      await screen.getByRole('button', { name: 'Open appearance selection' }).click()
      await userEvent.keyboard('{Escape}')
      await expect
        .element(screen.getByRole('menu', { name: 'Choose appearance' }))
        .not.toBeInTheDocument()

      await screen.rerender(<FieldLog locale="en" />)
      await expect.element(screen.getByRole('button', { name: 'Open home signal' })).toBeVisible()
      navigation.navigate.mockClear()
      await userEvent.keyboard('3')
      expect(navigation.navigate).toHaveBeenCalledExactlyOnceWith({
        to: '/$locale/$signal',
        params: { locale: 'en', signal: 'workbench' },
        resetScroll: false,
      })
    }

    expect(
      warnings.mock.calls.filter((args) =>
        args.some((arg) => String(arg).includes('already registered')),
      ),
    ).toEqual([])
  } finally {
    warnings.mockRestore()
  }
})
