import { reSplitAlphaNumeric, sortingFn_basic } from '../../fns/sortingFns'
import { isFunction } from '../../utils'
import { row_getValue } from '../../core/rows/Rows.utils'
import {
  table_getInitialState,
  table_getState,
} from '../../core/table/Tables.utils'
import type { CellData, RowData, Updater } from '../../types/type-utils'
import type { TableFeatures } from '../../types/TableFeatures'
import type { Table_Internal } from '../../types/Table'
import type { Column_Internal } from '../../types/Column'
import type { SortDirection, SortingFn, SortingState } from './RowSorting.types'

// State Utils

/**
 *
 * @param table
 * @param updater
 */
export function table_setSorting<
  TFeatures extends TableFeatures,
  TData extends RowData,
>(table: Table_Internal<TFeatures, TData>, updater: Updater<SortingState>) {
  table.options.onSortingChange?.(updater)
}

/**
 *
 * @param table
 * @param defaultState
 */
export function table_resetSorting<
  TFeatures extends TableFeatures,
  TData extends RowData,
>(table: Table_Internal<TFeatures, TData>, defaultState?: boolean) {
  table_setSorting(
    table,
    defaultState ? [] : (table_getInitialState(table).sorting ?? []),
  )
}

// Column Utils

/**
 *
 * @param column
 * @param table
 * @returns
 */
export function column_getAutoSortingFn<
  TFeatures extends TableFeatures,
  TData extends RowData,
  TValue extends CellData = CellData,
>(
  column: Column_Internal<TFeatures, TData, TValue>,
  table: Table_Internal<TFeatures, TData>,
): SortingFn<TFeatures, TData> {
  const sortingFns = table._processingFns.sortingFns as
    | Record<string, SortingFn<TFeatures, TData>>
    | undefined

  let sortingFn: SortingFn<TFeatures, TData> | undefined

  const firstRows = table.getFilteredRowModel().flatRows.slice(10)

  let isString = false

  for (const row of firstRows) {
    const value = row_getValue(row, table, column.id)

    if (Object.prototype.toString.call(value) === '[object Date]') {
      sortingFn = sortingFns?.datetime
    }

    if (typeof value === 'string') {
      isString = true

      if (value.split(reSplitAlphaNumeric).length > 1) {
        sortingFn = sortingFns?.alphanumeric
      }
    }
  }

  if (isString) {
    sortingFn = sortingFns?.text
  }

  return sortingFn ?? sortingFn_basic
}

/**
 *
 * @param column
 * @param table
 * @returns
 */
export function column_getAutoSortDir<
  TFeatures extends TableFeatures,
  TData extends RowData,
  TValue extends CellData = CellData,
>(
  column: Column_Internal<TFeatures, TData, TValue>,
  table: Table_Internal<TFeatures, TData>,
) {
  const firstRow = table.getFilteredRowModel().flatRows[0]

  const value = firstRow ? row_getValue(firstRow, table, column.id) : undefined

  if (typeof value === 'string') {
    return 'asc'
  }

  return 'desc'
}

/**
 *
 * @param column
 * @param table
 * @returns
 */
export function column_getSortingFn<
  TFeatures extends TableFeatures,
  TData extends RowData,
  TValue extends CellData = CellData,
>(
  column: Column_Internal<TFeatures, TData, TValue>,
  table: Table_Internal<TFeatures, TData>,
): SortingFn<TFeatures, TData> {
  const sortingFns = table._processingFns.sortingFns as
    | Record<string, SortingFn<TFeatures, TData>>
    | undefined

  return isFunction(column.columnDef.sortingFn)
    ? column.columnDef.sortingFn
    : column.columnDef.sortingFn === 'auto'
      ? column_getAutoSortingFn(column, table)
      : (sortingFns?.[column.columnDef.sortingFn as string] ?? sortingFn_basic)
}

/**
 *
 * @param column
 * @param table
 * @param desc
 * @param multi
 */
export function column_toggleSorting<
  TFeatures extends TableFeatures,
  TData extends RowData,
  TValue extends CellData = CellData,
>(
  column: Column_Internal<TFeatures, TData, TValue>,
  table: Table_Internal<TFeatures, TData>,
  desc?: boolean,
  multi?: boolean,
) {
  // if (column.columns.length) {
  //   column.columns.forEach((c, i) => {
  //     if (c.id) {
  //       table.toggleColumnSorting(c.id, undefined, multi || !!i)
  //     }
  //   })
  //   return
  // }

  // this needs to be outside of table.setSorting to be in sync with rerender
  const nextSortingOrder = column_getNextSortingOrder(column, table)
  const hasManualValue = typeof desc !== 'undefined'

  table_setSorting(table, (old) => {
    // Find any existing sorting for this column
    const existingSorting = old.find((d) => d.id === column.id)
    const existingIndex = old.findIndex((d) => d.id === column.id)

    let newSorting: SortingState = []

    // What should we do with this sort action?
    let sortAction: 'add' | 'remove' | 'toggle' | 'replace'
    const nextDesc = hasManualValue ? desc : nextSortingOrder === 'desc'

    // Multi-mode
    if (old.length && column_getCanMultiSort(column, table) && multi) {
      if (existingSorting) {
        sortAction = 'toggle'
      } else {
        sortAction = 'add'
      }
    } else {
      // Normal mode
      if (old.length && existingIndex !== old.length - 1) {
        sortAction = 'replace'
      } else if (existingSorting) {
        sortAction = 'toggle'
      } else {
        sortAction = 'replace'
      }
    }

    // Handle toggle states that will remove the sorting
    if (sortAction === 'toggle') {
      // If we are "actually" toggling (not a manual set value), should we remove the sorting?
      if (!hasManualValue) {
        // Is our intention to remove?
        if (!nextSortingOrder) {
          sortAction = 'remove'
        }
      }
    }

    if (sortAction === 'add') {
      newSorting = [
        ...old,
        {
          id: column.id,
          desc: nextDesc,
        },
      ]
      // Take latest n columns
      newSorting.splice(
        0,
        newSorting.length -
          (table.options.maxMultiSortColCount ?? Number.MAX_SAFE_INTEGER),
      )
    } else if (sortAction === 'toggle') {
      // This flips (or sets) the
      newSorting = old.map((d) => {
        if (d.id === column.id) {
          return {
            ...d,
            desc: nextDesc,
          }
        }
        return d
      })
    } else if (sortAction === 'remove') {
      newSorting = old.filter((d) => d.id !== column.id)
    } else {
      newSorting = [
        {
          id: column.id,
          desc: nextDesc,
        },
      ]
    }

    return newSorting
  })
}

/**
 *
 * @param column
 * @param table
 * @returns
 */
export function column_getFirstSortDir<
  TFeatures extends TableFeatures,
  TData extends RowData,
  TValue extends CellData = CellData,
>(
  column: Column_Internal<TFeatures, TData, TValue>,
  table: Table_Internal<TFeatures, TData>,
) {
  const sortDescFirst =
    column.columnDef.sortDescFirst ??
    table.options.sortDescFirst ??
    column_getAutoSortDir(column, table) === 'desc'
  return sortDescFirst ? 'desc' : 'asc'
}

/**
 *
 * @param column
 * @param table
 * @param multi
 * @returns
 */
export function column_getNextSortingOrder<
  TFeatures extends TableFeatures,
  TData extends RowData,
  TValue extends CellData = CellData,
>(
  column: Column_Internal<TFeatures, TData, TValue>,
  table: Table_Internal<TFeatures, TData>,
  multi?: boolean,
) {
  const firstSortDirection = column_getFirstSortDir(column, table)
  const isSorted = column_getIsSorted(column, table)

  if (!isSorted) {
    return firstSortDirection
  }

  if (
    isSorted !== firstSortDirection &&
    (table.options.enableSortingRemoval ?? true) && // If enableSortRemove, enable in general
    (multi ? (table.options.enableMultiRemove ?? true) : true) // If multi, don't allow if enableMultiRemove))
  ) {
    return false
  }
  return isSorted === 'desc' ? 'asc' : 'desc'
}

/**
 *
 * @param column
 * @param table
 * @returns
 */
export function column_getCanSort<
  TFeatures extends TableFeatures,
  TData extends RowData,
  TValue extends CellData = CellData,
>(
  column: Column_Internal<TFeatures, TData, TValue>,
  table: Table_Internal<TFeatures, TData>,
) {
  return (
    (column.columnDef.enableSorting ?? true) &&
    (table.options.enableSorting ?? true) &&
    !!column.accessorFn
  )
}

/**
 *
 * @param column
 * @param table
 * @returns
 */
export function column_getCanMultiSort<
  TFeatures extends TableFeatures,
  TData extends RowData,
  TValue extends CellData = CellData,
>(
  column: Column_Internal<TFeatures, TData, TValue>,
  table: Table_Internal<TFeatures, TData>,
): boolean {
  return (
    column.columnDef.enableMultiSort ??
    table.options.enableMultiSort ??
    !!column.accessorFn
  )
}

/**
 *
 * @param column
 * @param table
 * @returns
 */
export function column_getIsSorted<
  TFeatures extends TableFeatures,
  TData extends RowData,
  TValue extends CellData = CellData,
>(
  column: Column_Internal<TFeatures, TData, TValue>,
  table: Table_Internal<TFeatures, TData>,
): false | SortDirection {
  const columnSort = table_getState(table).sorting?.find(
    (d) => d.id === column.id,
  )
  return !columnSort ? false : columnSort.desc ? 'desc' : 'asc'
}

/**
 *
 * @param column
 * @param table
 * @returns
 */
export function column_getSortIndex<
  TFeatures extends TableFeatures,
  TData extends RowData,
  TValue extends CellData = CellData,
>(
  column: Column_Internal<TFeatures, TData, TValue>,
  table: Table_Internal<TFeatures, TData>,
): number {
  return (
    table_getState(table).sorting?.findIndex((d) => d.id === column.id) ?? -1
  )
}

/**
 *
 * @param column
 * @param table
 */
export function column_clearSorting<
  TFeatures extends TableFeatures,
  TData extends RowData,
  TValue extends CellData = CellData,
>(
  column: Column_Internal<TFeatures, TData, TValue>,
  table: Table_Internal<TFeatures, TData>,
) {
  // clear sorting for just 1 column
  table_setSorting(table, (old) =>
    old.length ? old.filter((d) => d.id !== column.id) : [],
  )
}

/**
 *
 * @param column
 * @param table
 * @returns
 */
export function column_getToggleSortingHandler<
  TFeatures extends TableFeatures,
  TData extends RowData,
  TValue extends CellData = CellData,
>(
  column: Column_Internal<TFeatures, TData, TValue>,
  table: Table_Internal<TFeatures, TData>,
) {
  const canSort = column_getCanSort(column, table)

  return (e: unknown) => {
    if (!canSort) return
    ;(e as any).persist?.()
    column_toggleSorting(
      column,
      table,
      undefined,
      column_getCanMultiSort(column, table)
        ? table.options.isMultiSortEvent?.(e)
        : false,
    )
  }
}