import AxeBuilder from '@axe-core/playwright'
import { type Page, type TestInfo } from '@playwright/test'

import { expect, test } from './coverage-fixture'

const wcagTags = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22a', 'wcag22aa']
const signals = ['home', 'current', 'workbench', 'side-quests', 'comms'] as const

async function expectNoA11yViolations(page: Page, testInfo: TestInfo) {
  const results = await new AxeBuilder({ page }).withTags(wcagTags).analyze()

  await testInfo.attach('axe-results', {
    body: JSON.stringify(results, null, 2),
    contentType: 'application/json',
  })

  expect(results.violations).toEqual([])
}

test('@a11y localized home pages have no detectable WCAG A/AA violations', async ({
  page,
}, testInfo) => {
  for (const locale of ['en', 'de']) {
    await page.goto(`/${locale}`)
    await expect(page.locator('main')).toBeVisible()
    await expectNoA11yViolations(page, testInfo)
    await expect
      .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
      .toBe(true)
  }
})

test('@a11y every transmission has no detectable WCAG A/AA violations', async ({
  page,
}, testInfo) => {
  for (const signal of signals) {
    await page.goto(`/en/${signal}`)
    await expect(page.getByRole('dialog')).toBeVisible()
    await expectNoA11yViolations(page, testInfo)
  }
})

test('@a11y appearance and language menus have no detectable violations', async ({
  page,
}, testInfo) => {
  await page.goto('/en')

  await page.getByRole('button', { name: 'Open appearance selection' }).click()
  await expect(page.getByRole('menu', { name: 'Choose appearance' })).toBeVisible()
  await expectNoA11yViolations(page, testInfo)

  await page.keyboard.press('Escape')
  await page.getByRole('button', { name: 'Open language selection' }).click()
  await expect(page.getByRole('menu', { name: 'Choose a language' })).toBeVisible()
  await expectNoA11yViolations(page, testInfo)
})

test('@a11y transmission traps focus and restores it to its planet', async ({ page }) => {
  await page.goto('/en')
  const planet = page.getByRole('button', {
    name: 'Current: What has my attention right now.',
  })

  await expect
    .poll(async () => {
      if (new URL(page.url()).pathname !== '/en/current') {
        await planet.evaluate((button: HTMLButtonElement) => button.click())
      }
      return new URL(page.url()).pathname
    })
    .toBe('/en/current')

  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  await expect(dialog.getByRole('button', { name: 'Close transmission' })).toBeFocused()

  for (let index = 0; index < 10; index += 1) {
    await page.keyboard.press('Tab')
    await expect
      .poll(() => page.evaluate(() => Boolean(document.activeElement?.closest('[role="dialog"]'))))
      .toBe(true)
  }

  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
  await expect(planet).toBeFocused()
})

test('@a11y visible controls meet the WCAG 2.2 minimum target size', async ({ page }) => {
  await page.goto('/en')

  const undersizedControls = await page.getByRole('button').evaluateAll((buttons) =>
    buttons.flatMap((button) => {
      const bounds = button.getBoundingClientRect()
      const isVisible = bounds.width > 0 && bounds.height > 0
      return isVisible && (bounds.width < 24 || bounds.height < 24)
        ? [button.getAttribute('aria-label') ?? button.textContent?.trim() ?? 'unnamed control']
        : []
    }),
  )

  expect(undersizedControls).toEqual([])
})
