import { computed, untracked } from '@angular/core'
import type { Signal } from '@angular/core'
import type { RowData, Table, TableFeatures } from '@tanstack/table-core'

type TableSignal<
  TFeatures extends TableFeatures,
  TData extends RowData,
> = Table<TFeatures, TData> & Signal<Table<TFeatures, TData>>

export function proxifyTable<
  TFeatures extends TableFeatures,
  TData extends RowData,
>(
  tableSignal: Signal<Table<TFeatures, TData>>,
): Table<TFeatures, TData> & Signal<Table<TFeatures, TData>> {
  const internalState = tableSignal as TableSignal<TFeatures, TData>

  const proxyTargetImplementation = {
    default: getDefaultProxyHandler(tableSignal),
    experimental: getExperimentalProxyHandler(tableSignal),
  } as const

  return new Proxy(internalState, {
    apply() {
      const signal = untracked(tableSignal)
      const impl = signal.options.enableExperimentalReactivity
        ? proxyTargetImplementation.experimental
        : proxyTargetImplementation.default
      return impl.apply()
    },
    get(target, property, receiver): any {
      const signal = untracked(tableSignal)
      const impl = signal.options.enableExperimentalReactivity
        ? proxyTargetImplementation.experimental
        : proxyTargetImplementation.default
      return impl.get(target, property, receiver)
    },
    has(_, prop) {
      const signal = untracked(tableSignal)
      const impl = signal.options.enableExperimentalReactivity
        ? proxyTargetImplementation.experimental
        : proxyTargetImplementation.default
      return impl.has(_, prop)
    },
    ownKeys() {
      const signal = untracked(tableSignal)
      const impl = signal.options.enableExperimentalReactivity
        ? proxyTargetImplementation.experimental
        : proxyTargetImplementation.default
      return impl.ownKeys()
    },
    getOwnPropertyDescriptor() {
      const signal = untracked(tableSignal)
      const impl = signal.options.enableExperimentalReactivity
        ? proxyTargetImplementation.experimental
        : proxyTargetImplementation.default
      return impl.getOwnPropertyDescriptor()
    },
  })
}

/**
 * Here we'll handle all type of accessors:
 * - 0 argument -> e.g. table.getCanNextPage())
 * - 0~1 arguments -> e.g. table.getIsSomeRowsPinned(position?)
 * - 1 required argument -> e.g. table.getColumn(columnId)
 * - 1+ argument -> e.g. table.getRow(id, searchAll?)
 *
 * Since we are not able to detect automatically the accessors parameters,
 * we'll wrap all accessors into a cached function wrapping a computed
 * that return it's value based on the given parameters
 */
export function toComputed<
  TFeatures extends TableFeatures,
  TData extends RowData,
>(signal: Signal<Table<TFeatures, TData>>, fn: Function, debugName?: string) {
  const hasArgs = fn.length > 0
  if (!hasArgs) {
    return computed(
      () => {
        void signal()
        return fn()
      },
      { debugName },
    )
  }

  const computedCache: Record<string, Signal<unknown>> = {}

  // Declare at least a static argument in order to detect fns `length` > 0
  return (arg0: any, ...otherArgs: Array<any>) => {
    const argsArray = [arg0, ...otherArgs]
    const serializedArgs = serializeArgs(...argsArray)
    if (computedCache.hasOwnProperty(serializedArgs)) {
      return computedCache[serializedArgs]?.()
    }
    const computedSignal = computed(
      () => {
        void signal()
        return fn(...argsArray)
      },
      { debugName },
    )

    computedCache[serializedArgs] = computedSignal

    return computedSignal()
  }
}

function serializeArgs(...args: Array<any>) {
  return JSON.stringify(args)
}

function getDefaultProxyHandler<
  TFeatures extends TableFeatures,
  TData extends RowData,
>(tableSignal: Signal<Table<TFeatures, TData>>) {
  return {
    apply() {
      return tableSignal()
    },
    get(target, property, receiver): any {
      if (Reflect.has(target, property)) {
        return Reflect.get(target, property)
      }
      const table = untracked(tableSignal)
      /**
       * Attempt to convert all accessors into computed ones,
       * excluding handlers as they do not retain any reactive value
       */
      if (
        typeof property === 'string' &&
        property.startsWith('get') &&
        !property.endsWith('Handler')
        // e.g. getCoreRowModel, getSelectedRowModel etc.
        // We need that after a signal change even `rowModel` may mark the view as dirty.
        // This allows to always get the latest `getContext` value while using flexRender
        // && !property.endsWith('Model')
      ) {
        const maybeFn = table[property as keyof typeof target] as
          | Function
          | never
        if (typeof maybeFn === 'function') {
          Object.defineProperty(target, property, {
            value: toComputed(tableSignal, maybeFn),
            configurable: true,
            enumerable: true,
          })
          return target[property as keyof typeof target]
        }
      }
      return ((target as any)[property] = (table as any)[property])
    },
    has(_, prop) {
      return (
        Reflect.has(untracked(tableSignal), prop) ||
        Reflect.has(tableSignal, prop)
      )
    },
    ownKeys() {
      return [...Reflect.ownKeys(untracked(tableSignal))]
    },
    getOwnPropertyDescriptor() {
      return {
        enumerable: true,
        configurable: true,
      }
    },
  } satisfies ProxyHandler<Table<TFeatures, TData>>
}

function getExperimentalProxyHandler<
  TFeatures extends TableFeatures,
  TData extends RowData,
>(tableSignal: Signal<Table<TFeatures, TData>>) {
  return {
    apply() {
      return tableSignal()
    },
    get(target, property, receiver): any {
      if (Reflect.has(target, property)) {
        return Reflect.get(target, property)
      }
      const table = untracked(tableSignal)
      return ((target as any)[property] = (table as any)[property])
    },
    has(_, property) {
      return (
        Reflect.has(untracked(tableSignal), property) ||
        Reflect.has(tableSignal, property)
      )
    },
    ownKeys() {
      return Reflect.ownKeys(untracked(tableSignal))
    },
    getOwnPropertyDescriptor() {
      return {
        enumerable: true,
        configurable: true,
      }
    },
  } satisfies ProxyHandler<Table<TFeatures, TData>>
}
