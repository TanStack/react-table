import { reSplitAlphaNumeric, sortingFns } from '../../fns/sortingFns'
import { isFunction } from '../../utils'
import { table_getFilteredRowModel } from '../column-filtering/ColumnFiltering.utils'
import { row_getValue } from '../../core/rows/Rows.utils'
import { table_getGroupedRowModel } from '../column-grouping/ColumnGrouping.utils'
import type { BuiltInSortingFn } from '../../fns/sortingFns'
import type { Column, RowData, RowModel, Table, Updater } from '../../types'
import type { SortingState } from './RowSorting.types'

export function column_getAutoSortingFn<TData extends RowData, TValue>(
  column: Column<TData, TValue>,
  table: Table<TData>,
) {
  const firstRows = table_getFilteredRowModel(table).flatRows.slice(10)

  let isString = false

  for (const row of firstRows) {
    const value = row_getValue(row, table, column.id)

    if (Object.prototype.toString.call(value) === '[object Date]') {
      return sortingFns.datetime
    }

    if (typeof value === 'string') {
      isString = true

      if (value.split(reSplitAlphaNumeric).length > 1) {
        return sortingFns.alphanumeric
      }
    }
  }

  if (isString) {
    return sortingFns.text
  }

  return sortingFns.basic
}

export function column_getAutoSortDir<TData extends RowData, TValue>(
  column: Column<TData, TValue>,
  table: Table<TData>,
) {
  const firstRow = table_getFilteredRowModel(table).flatRows[0]

  const value = firstRow ? row_getValue(firstRow, table, column.id) : undefined

  if (typeof value === 'string') {
    return 'asc'
  }

  return 'desc'
}

export function column_getSortingFn<TData extends RowData, TValue>(
  column: Column<TData, TValue>,
  table: Table<TData>,
) {
  return isFunction(column.columnDef.sortingFn)
    ? column.columnDef.sortingFn
    : column.columnDef.sortingFn === 'auto'
      ? column_getAutoSortingFn(column, table)
      : table.options.sortingFns?.[column.columnDef.sortingFn as string] ??
        sortingFns[column.columnDef.sortingFn as BuiltInSortingFn]
}

export function column_toggleSorting<TData extends RowData, TValue>(
  column: Column<TData, TValue>,
  table: Table<TData>,
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

export function column_getFirstSortDir<TData extends RowData, TValue>(
  column: Column<TData, TValue>,
  table: Table<TData>,
) {
  const sortDescFirst =
    column.columnDef.sortDescFirst ??
    table.options.sortDescFirst ??
    column_getAutoSortDir(column, table) === 'desc'
  return sortDescFirst ? 'desc' : 'asc'
}

export function column_getNextSortingOrder<TData extends RowData, TValue>(
  column: Column<TData, TValue>,
  table: Table<TData>,
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
    (multi ? table.options.enableMultiRemove ?? true : true) // If multi, don't allow if enableMultiRemove))
  ) {
    return false
  }
  return isSorted === 'desc' ? 'asc' : 'desc'
}

export function column_getCanSort<TData extends RowData, TValue>(
  column: Column<TData, TValue>,
  table: Table<TData>,
) {
  return (
    (column.columnDef.enableSorting ?? true) &&
    (table.options.enableSorting ?? true) &&
    !!column.accessorFn
  )
}

export function column_getCanMultiSort<TData extends RowData, TValue>(
  column: Column<TData, TValue>,
  table: Table<TData>,
) {
  return (
    column.columnDef.enableMultiSort ??
    table.options.enableMultiSort ??
    !!column.accessorFn
  )
}

export function column_getIsSorted<TData extends RowData, TValue>(
  column: Column<TData, TValue>,
  table: Table<TData>,
) {
  const columnSort = table.getState().sorting.find((d) => d.id === column.id)
  return !columnSort ? false : columnSort.desc ? 'desc' : 'asc'
}

export function column_getSortIndex<TData extends RowData, TValue>(
  column: Column<TData, TValue>,
  table: Table<TData>,
) {
  return table.getState().sorting.findIndex((d) => d.id === column.id)
}

export function column_clearSorting<TData extends RowData, TValue>(
  column: Column<TData, TValue>,
  table: Table<TData>,
) {
  //clear sorting for just 1 column
  table_setSorting(table, (old) =>
    old.length ? old.filter((d) => d.id !== column.id) : [],
  )
}

export function column_getToggleSortingHandler<TData extends RowData, TValue>(
  column: Column<TData, TValue>,
  table: Table<TData>,
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

export function table_setSorting<TData extends RowData>(
  table: Table<TData>,
  updater: Updater<SortingState>,
) {
  table.options.onSortingChange?.(updater)
}

export function table_resetSorting<TData extends RowData>(
  table: Table<TData>,
  defaultState?: boolean,
) {
  table_setSorting(table, defaultState ? [] : table.initialState.sorting)
}

export function table_getPreSortedRowModel<TData extends RowData>(
  table: Table<TData>,
): RowModel<TData> {
  return table_getGroupedRowModel(table)
}

export function table_getSortedRowModel<TData extends RowData>(
  table: Table<TData>,
): RowModel<TData> {
  if (!table._rowModels.Sorted) {
    table._rowModels.Sorted = table.options._rowModels?.Sorted?.(table)
  }

  if (table.options.manualSorting || !table._rowModels.Sorted) {
    return table_getPreSortedRowModel(table)
  }

  return table._rowModels.Sorted()
}
