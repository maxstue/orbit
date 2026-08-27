import { expect, test } from './coverage-fixture'

const signals = ['home', 'current', 'workbench', 'side-quests', 'comms'] as const
const socialPreviewUrl = 'https://me.justmax.xyz/social-preview.png'

test('@seo localized routes publish complete canonical, language, and social metadata', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chromium', 'SEO is independent of viewport.')

  for (const locale of ['en', 'de'] as const) {
    for (const signal of [undefined, ...signals]) {
      const path = signal ? `/${locale}/${signal}` : `/${locale}`
      await page.goto(path)

      await expect(page.locator('html')).toHaveAttribute('lang', locale)
      await expect(page.locator('head title')).not.toBeEmpty()
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', path)
      await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute(
        'href',
        signal ? `/en/${signal}` : '/en',
      )
      await expect(page.locator('link[rel="alternate"][hreflang="de"]')).toHaveAttribute(
        'href',
        signal ? `/de/${signal}` : '/de',
      )
      await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
        'content',
        socialPreviewUrl,
      )
      await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
        'content',
        'summary_large_image',
      )
    }
  }
})

test('@seo publishes crawl, manifest, icon, and social-preview assets', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chromium', 'SEO is independent of viewport.')

  const [robots, sitemap, manifest, favicon, socialPreview] = await Promise.all([
    page.request.get('/robots.txt'),
    page.request.get('/sitemap.xml'),
    page.request.get('/site.webmanifest'),
    page.request.get('/favicon.svg'),
    page.request.get('/social-preview.png'),
  ])

  for (const response of [robots, sitemap, manifest, favicon, socialPreview]) {
    expect(response.ok()).toBe(true)
  }

  await expect(robots.text()).resolves.toContain('Sitemap:')
  await expect(sitemap.text()).resolves.toContain('/de/workbench')
  await expect(manifest.json()).resolves.toMatchObject({
    name: "Max's Orbit",
    theme_color: '#0c1011',
  })
  expect(favicon.headers()['content-type']).toContain('image/svg+xml')
  expect(socialPreview.headers()['content-type']).toContain('image/png')
})
