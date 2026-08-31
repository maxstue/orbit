import { type Browser, type Page } from '@playwright/test'

import { expect, test } from './coverage-fixture'

async function openLanguageMenu(page: Page) {
  await page.getByRole('button', { name: /language.*selection|sprachauswahl/i }).click()
  await expect(
    page.getByRole('menu', { name: /choose a language|sprache auswählen/i }),
  ).toBeVisible()
}

async function chooseTheme(page: Page, label: RegExp) {
  await page.getByRole('button', { name: /appearance selection|darstellung auswählen/i }).click()
  await page.getByRole('menuitemradio', { name: label }).click()
}

async function expectNoHorizontalOverflow(page: Page) {
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
    .toBe(true)
}

async function openSignalByShortcut(page: Page, shortcut: string, expectedPath: string) {
  await expect
    .poll(async () => {
      await page.keyboard.press(shortcut)
      return new URL(page.url()).pathname
    })
    .toBe(expectedPath)
}

async function openSignalByName(page: Page, name: RegExp, expectedPath: string) {
  const signal = page.getByRole('button', { name })
  await expect
    .poll(async () => {
      if (new URL(page.url()).pathname !== expectedPath) {
        await signal.evaluate((button: HTMLButtonElement) => button.click())
      }
      return new URL(page.url()).pathname
    })
    .toBe(expectedPath)
}

test('keeps localized workbench routes in browser history', async ({ page }) => {
  await page.goto('/en')
  await openSignalByName(
    page,
    /work: software someone can still understand tomorrow/i,
    '/en/workbench',
  )
  await expect(page).toHaveURL('/en/workbench')
  await expect(page.getByRole('dialog')).toContainText(
    'Software someone can still understand tomorrow.',
  )

  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toBeHidden()

  await openLanguageMenu(page)
  await page.getByRole('menuitemradio', { name: 'German' }).click()
  await expect(page).toHaveURL('/de')
  await openSignalByName(
    page,
    /arbeit: software, die auch morgen noch jemand versteht/i,
    '/de/workbench',
  )
  await expect(page).toHaveURL('/de/workbench')
  await expect(page.getByRole('dialog')).toContainText(
    'Software, die auch morgen noch jemand versteht.',
  )

  await page.goBack()
  await expect(page).toHaveURL('/de')
  await expect(page.getByRole('main')).toBeVisible()
})

test('closes the LINGUA RELAY bubble on an outside click', async ({ page }) => {
  await page.goto('/en')
  await openLanguageMenu(page)

  const menu = page.getByRole('menu', { name: 'Choose a language' })
  await page.getByRole('heading', { name: 'Choose a destination.' }).click()

  await expect(menu).toBeHidden()
})

test('supports direct routes, reloads, and the root redirect', async ({ page }) => {
  await page.goto('/de/workbench')
  await expect(page.getByRole('dialog')).toContainText(
    'Software, die auch morgen noch jemand versteht.',
  )

  await page.reload()
  await expect(page.getByRole('dialog')).toBeVisible()

  await page.goto('/')
  await expect(page).toHaveURL('/en')
  await expect(page.getByRole('main')).toBeVisible()
})

test('renders useful fallbacks for unknown locales and signals', async ({ page }) => {
  await page.goto('/fr')
  await expect(
    page.getByRole('heading', { name: 'Translation protocol unavailable.' }),
  ).toBeVisible()
  await expect(page.getByRole('link', { name: 'English' })).toHaveAttribute('href', '/en')

  await page.goto('/en/unknown-signal')
  await expect(page.getByRole('heading', { name: 'Unknown transmission.' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Return to Orbit' })).toHaveAttribute('href', '/en')
})

test('persists an explicit theme through navigation and reload', async ({ page }) => {
  await page.goto('/en')
  await chooseTheme(page, /^DAY$/)
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'day')

  await openSignalByName(
    page,
    /work: software someone can still understand tomorrow/i,
    '/en/workbench',
  )
  await expect(page).toHaveURL('/en/workbench')
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'day')

  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'day')
})

test('honors reduced motion while keeping transmissions usable', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/en')
  await page.getByRole('button', { name: /current: what has my attention right now/i }).click()

  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  await expect
    .poll(() =>
      page.evaluate(() =>
        document.getAnimations().every((animation) => animation.playState !== 'running'),
      ),
    )
    .toBe(true)
  await expect(dialog.getByRole('button', { name: 'Close transmission' })).toBeFocused()
})

test('keeps the rendered route useful without client JavaScript', async ({ browser }) => {
  const page = await createJavaScriptDisabledPage(browser)
  await page.goto('http://127.0.0.1:4173/en/workbench')

  await expect(page.getByRole('main')).toBeVisible()
  await expect(page.getByText('Choose a destination.')).toBeVisible()

  await page.context().close()
})

test('supports keyboard-only signal navigation and focus restoration', async ({ page }) => {
  await page.goto('/en')
  await page
    .getByRole('button', { name: /work: software someone can still understand tomorrow/i })
    .focus()
  await openSignalByShortcut(page, '3', '/en/workbench')

  const dialog = page.getByRole('dialog')
  await expect(dialog.getByRole('button', { name: 'Close transmission' })).toBeFocused()
  await page.keyboard.press('Escape')

  await expect(dialog).toBeHidden()
  await expect(
    page.getByRole('button', { name: /work: software someone can still understand tomorrow/i }),
  ).toBeFocused()
})

test('keeps the field log usable at every supported viewport', async ({ page }, testInfo) => {
  await page.goto('/en')
  await expect(page.getByRole('main')).toBeVisible()
  await expectNoHorizontalOverflow(page)

  await openSignalByName(
    page,
    /work: software someone can still understand tomorrow/i,
    '/en/workbench',
  )
  await expect(page.getByRole('dialog')).toBeVisible()
  await expectNoHorizontalOverflow(page)

  testInfo.annotations.push({ type: 'viewport', description: testInfo.project.name })
})

test('matches the stable night and day system views', async ({ page }, testInfo) => {
  test.skip(
    testInfo.project.name !== 'desktop-chromium',
    'Visual baselines are kept for desktop only.',
  )

  await page.goto('/en')
  await expect(page.locator('main.system')).toHaveScreenshot('deep-space.png')

  await chooseTheme(page, /^DAY$/)
  await expect(page.locator('main.system')).toHaveScreenshot('star-chart.png')
})

async function createJavaScriptDisabledPage(browser: Browser) {
  const context = await browser.newContext({ javaScriptEnabled: false })
  return context.newPage()
}
