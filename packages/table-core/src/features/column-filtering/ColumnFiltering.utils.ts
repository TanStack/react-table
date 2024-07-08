import { filterFns } from '../../fns/filterFns'
import { functionalUpdate, isFunction } from '../../utils'
import { table_getCoreRowModel } from '../../core/row-models/RowModels.utils'
import { row_getValue } from '../../core/rows/Rows.utils'
import type { BuiltInFilterFn } from '../../fns/filterFns'
import type { Column, RowData, RowModel, Table, Updater } from '../../types'
import type { ColumnFiltersState, FilterFn } from './ColumnFiltering.types'

export function column_getAutoFilterFn<TData extends RowData>(
  column: Column<TData, unknown>,
  table: Table<TData>,
) {
  const firstRow = table_getCoreRowModel(table).flatRows[0]

  const value = firstRow ? row_getValue(firstRow, table, column.id) : undefined

  if (typeof value === 'string') {
    return filterFns.includesString
  }

  if (typeof value === 'number') {
    return filterFns.inNumberRange
  }

  if (typeof value === 'boolean') {
    return filterFns.equals
  }

  if (value !== null && typeof value === 'object') {
    return filterFns.equals
  }

  if (Array.isArray(value)) {
    return filterFns.arrIncludes
  }

  return filterFns.weakEquals
}

export function column_getFilterFn<TData extends RowData>(
  column: Column<TData, unknown>,
  table: Table<TData>,
) {
  return isFunction(column.columnDef.filterFn)
    ? column.columnDef.filterFn
    : column.columnDef.filterFn === 'auto'
      ? column.getAutoFilterFn()
      : table.options.filterFns?.[column.columnDef.filterFn as string] ??
        filterFns[column.columnDef.filterFn as BuiltInFilterFn]
}

export function column_getCanFilter<TData extends RowData>(
  column: Column<TData, unknown>,
  table: Table<TData>,
) {
  return (
    (column.columnDef.enableColumnFilter ?? true) &&
    (table.options.enableColumnFilters ?? true) &&
    (table.options.enableFilters ?? true) &&
    !!column.accessorFn
  )
}

export function column_getIsFiltered<TData extends RowData>(
  column: Column<TData, unknown>,
) {
  return column.getFilterIndex() > -1
}

export function column_getFilterValue<TData extends RowData>(
  column: Column<TData, unknown>,
  table: Table<TData>,
) {
  return table.getState().columnFilters.find((d) => d.id === column.id)?.value
}

export function column_getFilterIndex<TData extends RowData>(
  column: Column<TData, unknown>,
  table: Table<TData>,
) {
  return table.getState().columnFilters.findIndex((d) => d.id === column.id)
}

export function column_setFilterValue<TData extends RowData>(
  column: Column<TData, unknown>,
  table: Table<TData>,
  value: any,
) {
  table_setColumnFilters(table, (old) => {
    const filterFn = column.getFilterFn()
    const previousFilter = old.find((d) => d.id === column.id)

    const newFilter = functionalUpdate(
      value,
      previousFilter ? previousFilter.value : undefined,
    )

    if (
      shouldAutoRemoveFilter(filterFn as FilterFn<TData>, newFilter, column)
    ) {
      return old.filter((d) => d.id !== column.id)
    }

    const newFilterObj = { id: column.id, value: newFilter }

    if (previousFilter) {
      return old.map((d) => {
        if (d.id === column.id) {
          return newFilterObj
        }
        return d
      })
    }

    if (old.length) {
      return [...old, newFilterObj]
    }

    return [newFilterObj]
  })
}

export function table_setColumnFilters<TData extends RowData>(
  table: Table<TData>,
  updater: Updater<ColumnFiltersState>,
) {
  const leafColumns = table.getAllLeafColumns()

  const updateFn = (old: ColumnFiltersState) => {
    return functionalUpdate(updater, old).filter((filter) => {
      const column = leafColumns.find((d) => d.id === filter.id)

      if (column) {
        const filterFn = column.getFilterFn()

        if (shouldAutoRemoveFilter(filterFn, filter.value, column)) {
          return false
        }
      }

      return true
    })
  }

  table.options.onColumnFiltersChange?.(updateFn)
}

export function table_resetColumnFilters<TData extends RowData>(
  table: Table<TData>,
  defaultState?: boolean,
) {
  table_setColumnFilters(
    table,
    defaultState ? [] : table.initialState.columnFilters,
  )
}

export function table_getPreFilteredRowModel<TData extends RowData>(
  table: Table<TData>,
) {
  return table_getCoreRowModel(table)
}

export function table_getFilteredRowModel<TData extends RowData>(
  table: Table<TData>,
): RowModel<TData> {
  if (!table._rowModels.Filtered) {
    table._rowModels.Filtered = table.options._rowModels?.Filtered?.(table)
  }

  if (table.options.manualFiltering || !table._rowModels.Filtered) {
    return table_getPreFilteredRowModel(table)
  }

  return table._rowModels.Filtered()
}

export function shouldAutoRemoveFilter<TData extends RowData>(
  filterFn?: FilterFn<TData>,
  value?: any,
  column?: Column<TData, unknown>,
) {
  return (
    (filterFn && filterFn.autoRemove
      ? filterFn.autoRemove(value, column)
      : false) ||
    typeof value === 'undefined' ||
    (typeof value === 'string' && !value)
  )
}
