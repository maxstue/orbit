import { cloudflare } from '@cloudflare/vite-plugin'
import tailwindcss from '@tailwindcss/vite'
import { paraglideVitePlugin } from '@inlang/paraglide-js'
import { sentryTanstackStart } from '@sentry/tanstackstart-react/vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite-plus'

const config = defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
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
      include: ['src/**/*.test.ts'],
      reporters:
        process.env.GITHUB_ACTIONS === 'true' ? ['default', 'github-actions'] : ['default'],
    },
  }
})

export default config
