import tailwindcss from '@tailwindcss/vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import { defineConfig } from 'vite-plus'

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [tanstackStart(), tailwindcss(), viteReact()],
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
})

export default config
