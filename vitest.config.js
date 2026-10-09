import { fileURLToPath } from 'node:url'
import { mergeConfig, defineConfig, configDefaults } from 'vitest/config'
import viteConfig from './vite.config.js'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      //environment: 'jsdom',
      environment: 'happy-dom',      
      exclude: [...configDefaults.exclude, 'e2e/*'],
      root: fileURLToPath(new URL('./', import.meta.url)),
      globals: true,
      setupFiles: ['./setupTest.js'],
      coverage: {
        enabled: false,
        provider: 'istanbul'
      }
    }
  })
)

//console.log('config load')
