import { cloudflare } from '@cloudflare/vite-plugin'
import tailwindcss from '@tailwindcss/vite'
import { paraglideVitePlugin } from '@inlang/paraglide-js'
import { sentryTanstackStart } from '@sentry/tanstackstart-react/vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import { playwright } from 'vite-plus/test/browser-playwright'
import { defineConfig, loadEnv } from 'vite-plus'
import istanbul from 'vite-plugin-istanbul'

const config = defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const browserTests = process.env.ORBIT_BROWSER_TESTS === 'true'
  const collectE2ECoverage = env.VITE_COVERAGE === 'true'
  const uploadSourceMaps = mode === 'production' && Boolean(env.SENTRY_AUTH_TOKEN)

  return {
    build: uploadSourceMaps ? { sourcemap: 'hidden' } : undefined,
    resolve: { tsconfigPaths: true },
    plugins: [
      ...(mode === 'test' ? [] : [cloudflare({ viteEnvironment: { name: 'ssr' } })]),
      paraglideVitePlugin({
        project: './project.inlang',
        outdir: './src/paraglide',
        emitTsDeclarations: true,
      }),
      tanstackStart({
        start: { entry: 'start.ts' },
        router: { entry: 'router.tsx' },
        client: { entry: 'client.tsx' },
        server: { entry: 'server.ts' },
      }),
      tailwindcss(),
      viteReact(),
      collectE2ECoverage
        ? istanbul({
            include: ['src/**/*'],
            exclude: [
              'node_modules/**',
              'tests/**',
              'src/**/*.server.ts',
              'src/**/*.test.{ts,tsx}',
              'src/**/*.browser.test.tsx',
              'src/paraglide/**',
              'src/routeTree.gen.ts',
            ],
            extension: ['.js', '.jsx', '.ts', '.tsx'],
            requireEnv: true,
          })
        : undefined,
      uploadSourceMaps
        ? sentryTanstackStart({
            org: 'maxstue',
            project: 'orbit',
            authToken: env.SENTRY_AUTH_TOKEN,
            autoInstrumentMiddleware: false,
            tunnelRoute: true,
            release: env.SENTRY_RELEASE ? { name: env.SENTRY_RELEASE } : undefined,
            sourcemaps: { filesToDeleteAfterUpload: ['dist/**/*.map'] },
            telemetry: false,
          })
        : undefined,
    ],
    fmt: {
      ignorePatterns: [
        'dist/**',
        'playwright-report/**',
        'src/routeTree.gen.ts',
        'test-results/**',
        'worker-configuration.d.ts',
      ],
      singleQuote: true,
      semi: false,
    },
    lint: {
      ignorePatterns: [
        'dist/**',
        'playwright-report/**',
        'src/routeTree.gen.ts',
        'test-results/**',
        'worker-configuration.d.ts',
      ],
      options: {
        typeAware: true,
        typeCheck: true,
      },
    },
    test: {
      browser: browserTests
        ? {
            enabled: true,
            headless: true,
            instances: [{ browser: 'chromium' }],
            provider: playwright(),
            screenshotFailures: true,
            trace: 'on-first-retry',
          }
        : undefined,
      exclude: browserTests ? undefined : ['src/**/*.browser.test.tsx'],
      include: browserTests ? ['src/**/*.browser.test.tsx'] : ['src/**/*.test.ts'],
      name: browserTests ? 'browser' : 'unit',
      reporters:
        process.env.GITHUB_ACTIONS === 'true' ? ['default', 'github-actions'] : ['default'],
      coverage: {
        exclude: [
          'src/**/*.test.{ts,tsx}',
          'src/**/*.browser.test.tsx',
          'src/paraglide/**',
          'src/routeTree.gen.ts',
        ],
        provider: 'v8',
        reporter: ['text', 'html', 'lcov'],
        reportsDirectory: 'coverage/unit',
      },
    },
  }
})

export default config
