// @ts-check

import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * List your npm packages here. The first package will be used as the versioner.
 * @type {import('./types').Package[]}
 */
export const packages = [
  {
    name: '@tanstack/table-core',
    packageDir: 'packages/table-core',
  },
  {
    name: '@tanstack/qwik-table',
    packageDir: 'packages/qwik-table',
  },
  {
    name: '@tanstack/react-table',
    packageDir: 'packages/react-table',
  },
  {
    name: '@tanstack/solid-table',
    packageDir: 'packages/solid-table',
  },
  {
    name: '@tanstack/vue-table',
    packageDir: 'packages/vue-table',
  },
  {
    name: '@tanstack/svelte-table',
    packageDir: 'packages/svelte-table',
  },
  {
    name: '@tanstack/react-table-devtools',
    packageDir: 'packages/react-table-devtools',
  },
  {
    name: '@tanstack/match-sorter-utils',
    packageDir: 'packages/match-sorter-utils',
  },
  {
    name: '@tanstack/angular-table',
    packageDir: 'packages/angular-table',
  },
]

/**
 * Contains config for publishable branches.
 * @type {Record<string, import('./types').BranchConfig>}
 */
export const branchConfigs = {
  main: {
    prerelease: false,
  },
  next: {
    prerelease: true,
  },
  beta: {
    prerelease: true,
  },
  alpha: {
    prerelease: true,
  },
}

const __dirname = fileURLToPath(new URL('.', import.meta.url))
export const rootDir = resolve(__dirname, '..')
