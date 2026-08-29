import type { ReactNode } from 'react'
import { beforeEach, expect, test, vi } from 'vite-plus/test'
import { userEvent } from 'vite-plus/test/browser'
import { render } from 'vitest-browser-react'

const navigation = vi.hoisted(() => ({ navigate: vi.fn() }))
const metrics = vi.hoisted(() => ({ captureObjectCursor: vi.fn() }))

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children }: { children: ReactNode }) => <a href="/en">{children}</a>,
  useNavigate: () => navigation.navigate,
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
  await render(<FieldLog locale="en" selectedSignal="workbench" />)

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
  await render(<FieldLog locale="en" />)

  const satellite = document.querySelector<HTMLElement>('[data-object-cursor="satellite"]')
  expect(satellite).not.toBeNull()
  satellite?.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
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
})
