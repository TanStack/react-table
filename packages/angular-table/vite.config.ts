import * as path from 'node:path'
import { defineConfig } from 'vitest/config'
import angular from '@analogjs/vite-plugin-angular'
import packageJson from './package.json'

const tsconfigPath = path.join(import.meta.dirname, 'tsconfig.test.json')
const testDirPath = path.join(import.meta.dirname, 'tests')
const angularPlugin = angular({ tsconfig: tsconfigPath, jit: true })

export default defineConfig({
  plugins: [angularPlugin],
  test: {
    name: packageJson.name,
    watch: false,
    dir: testDirPath,
    pool: 'threads',
    environment: 'jsdom',
    setupFiles: [path.join(testDirPath, 'test-setup.ts')],
    globals: true,
    reporters: 'default',
    disableConsoleIntercept: true,
  },
})
