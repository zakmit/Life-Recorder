import { defineConfig } from 'vitest/config'
import viteReact from '@vitejs/plugin-react'

// Tests run against an isolated config so the Cloudflare/TanStack Start
// plugins (which expect a Worker runtime) do not interfere with unit tests.
// Browser-facing modules use jsdom; server/repository modules use node.
export default defineConfig({
  plugins: [viteReact()],
  resolve: {
    alias: {
      '#': new URL('./src/', import.meta.url).pathname,
      '@': new URL('./src/', import.meta.url).pathname,
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    setupFiles: ['./src/test/setup.ts'],
  },
})
