import { computed, signal } from '@angular/core'
import { toComputed } from './proxy'
import type { Signal } from '@angular/core'
import type {
  RowData,
  Table,
  TableFeature,
  TableFeatures,
} from '@tanstack/table-core'

declare module '@tanstack/table-core' {
  interface TableOptions_Plugins<
    TFeatures extends TableFeatures,
    TData extends RowData,
  > extends TableOptions_AngularReactivity {}

  interface Table_Plugins<
    TFeatures extends TableFeatures,
    TData extends RowData,
  > extends Table_AngularReactivity<TFeatures, TData> {}
}

interface TableOptions_AngularReactivity {
  enableExperimentalReactivity?: boolean
}

interface Table_AngularReactivity<
  TFeatures extends TableFeatures,
  TData extends RowData,
> {
  _rootNotifier?: Signal<Table<TFeatures, TData>>
  _setRootNotifier?: (signal: Signal<Table<TFeatures, TData>>) => void
}

interface AngularReactivityFeatureConstructors<
  TFeatures extends TableFeatures,
  TData extends RowData,
> {
  TableOptions: TableOptions_AngularReactivity
  Table: Table_AngularReactivity<TFeatures, TData>
}

export function constructAngularReactivityFeature<
  TFeatures extends TableFeatures,
  TData extends RowData,
>(): TableFeature<AngularReactivityFeatureConstructors<TFeatures, TData>> {
  return {
    getDefaultTableOptions(table) {
      return { enableExperimentalReactivity: false }
    },
    constructTableAPIs: (table) => {
      if (!table.options.enableExperimentalReactivity) {
        return
      }
      const rootNotifier = signal<Signal<any> | null>(null)

      table._rootNotifier = computed(() => rootNotifier()?.(), {
        equal: () => false,
      }) as any

      table._setRootNotifier = (notifier) => {
        rootNotifier.set(notifier)
      }

      setReactiveProps(table._rootNotifier!, table, {
        skipProperty: skipBaseProperties,
      })
    },

    constructCellAPIs(cell) {
      if (
        !cell._table.options.enableExperimentalReactivity ||
        !cell._table._rootNotifier
      ) {
        return
      }
      setReactiveProps(cell._table._rootNotifier, cell, {
        skipProperty: skipBaseProperties,
      })
    },

    constructColumnAPIs(column) {
      if (
        !column._table.options.enableExperimentalReactivity ||
        !column._table._rootNotifier
      ) {
        return
      }
      setReactiveProps(column._table._rootNotifier, column, {
        skipProperty: skipBaseProperties,
      })
    },

    constructHeaderAPIs(header) {
      if (
        !header._table.options.enableExperimentalReactivity ||
        !header._table._rootNotifier
      ) {
        return
      }
      setReactiveProps(header._table._rootNotifier, header, {
        skipProperty: skipBaseProperties,
      })
    },

    constructRowAPIs(row) {
      if (
        !row._table.options.enableExperimentalReactivity ||
        !row._table._rootNotifier
      ) {
        return
      }
      setReactiveProps(row._table._rootNotifier, row, {
        skipProperty: skipBaseProperties,
      })
    },
  }
}

export const angularReactivityFeature = constructAngularReactivityFeature()

function skipBaseProperties(property: string): boolean {
  return property.endsWith('Handler') || !property.startsWith('get')
}

export function setReactiveProps(
  notifier: Signal<Table<any, any>>,
  obj: { [key: string]: any },
  options: {
    skipProperty: (property: string) => boolean
  },
) {
  const { skipProperty } = options
  for (const property in obj) {
    const value = obj[property]
    if (typeof value !== 'function') {
      continue
    }
    if (skipProperty(property)) {
      continue
    }
    Object.defineProperty(obj, property, {
      enumerable: true,
      configurable: false,
      value: toComputed(notifier, value, property),
    })
  }
}
