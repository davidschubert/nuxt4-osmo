import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'
import { defineVitestProject } from '@nuxt/test-utils/config'

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      include: ['app/**/*.{ts,vue}', 'server/**/*.ts'],
      exclude: ['app/utils/mock-data.ts', 'app/utils/mock-mode.ts']
    },
    projects: [
      // Plain unit tests – no Nuxt runtime, fast Node environment
      {
        test: {
          name: 'unit',
          include: ['tests/unit/**/*.{test,spec}.ts']
        },
        resolve: {
          alias: {
            '~': fileURLToPath(new URL('./app', import.meta.url))
          }
        }
      },
      // Server-side unit tests – no Nuxt runtime, Node environment with server aliases
      {
        test: {
          name: 'server',
          include: ['tests/server/**/*.{test,spec}.ts']
        },
        resolve: {
          alias: {
            '~': fileURLToPath(new URL('./app', import.meta.url))
          }
        }
      },
      // Nuxt runtime tests – composables, components, stores
      await defineVitestProject({
        test: {
          name: 'nuxt',
          include: ['tests/nuxt/**/*.{test,spec}.ts'],
          environment: 'nuxt',
          environmentOptions: {
            nuxt: {
              domEnvironment: 'happy-dom',
              mock: {
                intersectionObserver: true,
                indexedDb: true
              }
            }
          }
        }
      })
    ]
  }
})
