import { computed, signal } from '@angular/core'
import {
  constructTable,
  coreFeatures,
  getInitialTableState,
  isFunction,
} from '@tanstack/table-core'
import { lazyInit } from './lazy-signal-initializer'
import { proxifyTable } from './proxy'
import { angularReactivityFeature } from './angularReactivityFeature'
import type {
  RowData,
  Table,
  TableFeatures,
  TableOptions,
  TableState,
} from '@tanstack/table-core'
import type { Signal } from '@angular/core'

export function injectTable<
  TFeatures extends TableFeatures,
  TData extends RowData,
>(
  options: () => TableOptions<TFeatures, TData>,
): Table<TFeatures, TData> & Signal<Table<TFeatures, TData>> {
  return lazyInit(() => {
    const features = () => {
      return {
        ...coreFeatures,
        ...options()._features,
        angularReactivityFeature,
      }
    }

    // By default, manage table state here using the table's initial state
    const state = signal<TableState<TFeatures>>(
      getInitialTableState(features(), options().initialState),
    )

    const resolvedOptions: TableOptions<TFeatures, TData> = {
      ...options(),
      _features: features(),
      state: { ...state(), ...options().state },
    } as TableOptions<TFeatures, TData>

    const table = constructTable(resolvedOptions)

    // Compose table options using computed.
    // This is to allow `tableSignal` to listen and set table option
    const updatedOptions = computed<TableOptions<TFeatures, TData>>(() => {
      // listen to table state changed
      const tableState = state()
      // listen to input options changed
      const tableOptions = options()

      return {
        ...table.options,
        ...resolvedOptions,
        ...tableOptions,
        _features: features(),
        state: { ...tableState, ...tableOptions.state },
        onStateChange: (updater) => {
          const value = isFunction(updater) ? updater(tableState) : updater
          state.set(value)
          resolvedOptions.onStateChange?.(updater)
        },
      }
    })

    // convert table instance to signal for proxify to listen to any table state and options changes
    const tableSignal = computed(
      () => {
        table.setOptions(updatedOptions())
        return table
      },
      {
        equal: () => false,
      },
    )

    table._setRootNotifier?.(tableSignal as any)

    // proxify Table instance to provide ability for consumer to listen to any table state changes
    return proxifyTable(tableSignal)
  })
}
