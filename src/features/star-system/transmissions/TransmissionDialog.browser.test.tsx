import { expect, test, vi } from 'vite-plus/test'
import { userEvent } from 'vite-plus/test/browser'
import { render } from 'vitest-browser-react'

import { TransmissionDialog } from './TransmissionDialog'

test('exposes a labelled modal transmission, traps focus, and reports navigation', async () => {
  const onClose = vi.fn()
  const onSelect = vi.fn()
  const screen = await render(
    <TransmissionDialog locale="en" signal="home" onClose={onClose} onSelect={onSelect} />,
  )

  const dialog = screen.getByRole('dialog', { name: "Hey, I'm Max." })
  const close = screen.getByRole('button', { name: 'Close transmission' })

  await expect.element(dialog).toBeVisible()
  await expect.element(dialog).toHaveAttribute('aria-modal', 'true')
  await expect.element(close).toHaveFocus()

  await userEvent.keyboard('{Shift>}{Tab}{/Shift}')
  await expect.element(screen.getByRole('button', { name: 'NEXT SIGNAL →' })).toHaveFocus()

  await screen.getByRole('button', { name: 'NEXT SIGNAL →' }).click()
  expect(onSelect).toHaveBeenCalledWith('current')

  await close.click()
  expect(onClose).toHaveBeenCalledOnce()
})
