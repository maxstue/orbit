import tailwindcss from '@tailwindcss/vite'
import { cloudflare } from '@cloudflare/vite-plugin'
import { paraglideVitePlugin } from '@inlang/paraglide-js'
import { sites } from '@openai/sites-vite-plugin'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import { defineConfig } from 'vite-plus'

const config = defineConfig(({ mode }) => ({
  resolve: { tsconfigPaths: true },
  plugins: [
    ...(mode === 'test' ? [] : [cloudflare({ viteEnvironment: { name: 'ssr' } })]),
    paraglideVitePlugin({
      project: './project.inlang',
      outdir: './src/paraglide',
      emitTsDeclarations: true,
    }),
    tanstackStart(),
    tailwindcss(),
    viteReact(),
    sites(),
  ],
  fmt: {
    ignorePatterns: ['dist/**', 'src/routeTree.gen.ts'],
    singleQuote: true,
    semi: false,
  },
  lint: {
    ignorePatterns: ['dist/**', 'src/routeTree.gen.ts'],
    options: {
      typeAware: true,
      typeCheck: true,
    },
  },
  test: {
    include: ['src/**/*.test.ts'],
  },
}))

export default config
