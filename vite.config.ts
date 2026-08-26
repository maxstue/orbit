import tailwindcss from '@tailwindcss/vite'
import { paraglideVitePlugin } from '@inlang/paraglide-js'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import { defineConfig } from 'vite-plus'

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [
    paraglideVitePlugin({
      project: './project.inlang',
      outdir: './src/paraglide',
      emitTsDeclarations: true,
    }),
    tanstackStart(),
    tailwindcss(),
    viteReact(),
  ],
  fmt: {
    ignorePatterns: ['dist/**', 'playwright-report/**', 'src/routeTree.gen.ts', 'test-results/**'],
    singleQuote: true,
    semi: false,
  },
  lint: {
    ignorePatterns: ['dist/**', 'playwright-report/**', 'src/routeTree.gen.ts', 'test-results/**'],
    options: {
      typeAware: true,
      typeCheck: true,
    },
  },
  test: {
    include: ['src/**/*.test.ts'],
  },
})

export default config
