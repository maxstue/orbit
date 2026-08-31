import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://127.0.0.1:4173',
    colorScheme: 'dark',
    trace: 'on-first-retry',
  },
  expect: {
    toHaveScreenshot: {
      animations: 'disabled',
      caret: 'hide',
      maxDiffPixelRatio: 0.05,
      scale: 'css',
    },
  },
  webServer: {
    command: 'pnpm run test:e2e:server',
    env: {
      VITE_COVERAGE: 'true',
    },
    url: 'http://127.0.0.1:4173/en',
    reuseExistingServer: process.env.PLAYWRIGHT_REUSE_EXISTING_SERVER === 'true',
  },
  projects: [
    {
      name: 'desktop-chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile-chromium',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'tablet-chromium',
      use: { ...devices['iPad (gen 7)'], browserName: 'chromium' },
    },
    {
      name: 'zoom-400-chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 320, height: 720 },
      },
    },
  ],
})
