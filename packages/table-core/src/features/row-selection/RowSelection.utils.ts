import { table_getPreGroupedRowModel } from '../column-grouping/ColumnGrouping.utils'
import { table_getFilteredRowModel } from '../column-filtering/ColumnFiltering.utils'
import { table_getPaginatedRowModel } from '../row-pagination/RowPagination.utils'
import {
  table_getCoreRowModel,
  table_getRowModel,
} from '../../core/row-models/RowModels.utils'
import { table_getRow } from '../../core/rows/Rows.utils'
import type { Row, RowData, RowModel, Table, Updater } from '../../types'
import type { RowSelectionState } from './RowSelection.types'

export function table_setRowSelection<TData extends RowData>(
  table: Table<TData>,
  updater: Updater<RowSelectionState>,
) {
  table.options.onRowSelectionChange?.(updater)
}

export function table_resetRowSelection<TData extends RowData>(
  table: Table<TData>,
  defaultState?: boolean,
) {
  table_setRowSelection(
    table,
    defaultState ? {} : table.initialState.rowSelection,
  )
}

export function table_toggleAllRowsSelected<TData extends RowData>(
  table: Table<TData>,
  value?: boolean,
) {
  table_setRowSelection(table, (old) => {
    value =
      typeof value !== 'undefined' ? value : !table_getIsAllRowsSelected(table)

    const rowSelection = { ...old }

    const preGroupedFlatRows = table_getPreGroupedRowModel(table).flatRows

    // We don't use `mutateRowIsSelected` here for performance reasons.
    // All of the rows are flat already, so it wouldn't be worth it
    if (value) {
      preGroupedFlatRows.forEach((row) => {
        if (!row_getCanSelect(row, table)) {
          return
        }
        rowSelection[row.id] = true
      })
    } else {
      preGroupedFlatRows.forEach((row) => {
        delete rowSelection[row.id]
      })
    }

    return rowSelection
  })
}

export function table_toggleAllPageRowsSelected<TData extends RowData>(
  table: Table<TData>,
  value?: boolean,
) {
  table_setRowSelection(table, (old) => {
    const resolvedValue =
      typeof value !== 'undefined'
        ? value
        : !table_getIsAllPageRowsSelected(table)

    const rowSelection: RowSelectionState = { ...old }

    table_getRowModel(table).rows.forEach((row) => {
      mutateRowIsSelected(rowSelection, row.id, resolvedValue, true, table)
    })

    return rowSelection
  })
}

export function table_getPreSelectedRowModel<TData extends RowData>(
  table: Table<TData>,
): RowModel<TData> {
  return table_getCoreRowModel(table)
}

export function table_getSelectedRowModel<TData extends RowData>(
  table: Table<TData>,
  rowSelection: RowSelectionState,
  rowModel: RowModel<TData>,
) {
  if (!Object.keys(rowSelection).length) {
    return {
      rows: [],
      flatRows: [],
      rowsById: {},
    }
  }

  return selectRowsFn(table, rowModel)
}

export function table_getFilteredSelectedRowModel<TData extends RowData>(
  table: Table<TData>,
  rowSelection: RowSelectionState,
  rowModel: RowModel<TData>,
) {
  if (!Object.keys(rowSelection).length) {
    return {
      rows: [],
      flatRows: [],
      rowsById: {},
    }
  }

  return selectRowsFn(table, rowModel)
}

export function table_getGroupedSelectedRowModel<TData extends RowData>(
  table: Table<TData>,
  rowSelection: RowSelectionState,
  rowModel: RowModel<TData>,
) {
  if (!Object.keys(rowSelection).length) {
    return {
      rows: [],
      flatRows: [],
      rowsById: {},
    }
  }

  return selectRowsFn(table, rowModel)
}

export function table_getIsAllRowsSelected<TData extends RowData>(
  table: Table<TData>,
) {
  const preGroupedFlatRows = table_getFilteredRowModel(table).flatRows
  const { rowSelection } = table.getState()

  let isAllRowsSelected = Boolean(
    preGroupedFlatRows.length && Object.keys(rowSelection).length,
  )

  if (isAllRowsSelected) {
    if (
      preGroupedFlatRows.some(
        (row) => row_getCanSelect(row, table) && !rowSelection[row.id],
      )
    ) {
      isAllRowsSelected = false
    }
  }

  return isAllRowsSelected
}

export function table_getIsAllPageRowsSelected<TData extends RowData>(
  table: Table<TData>,
) {
  const paginationFlatRows = table_getPaginatedRowModel(table).flatRows.filter(
    (row) => row_getCanSelect(row, table),
  )
  const { rowSelection } = table.getState()

  let isAllPageRowsSelected = !!paginationFlatRows.length

  if (
    isAllPageRowsSelected &&
    paginationFlatRows.some((row) => !rowSelection[row.id])
  ) {
    isAllPageRowsSelected = false
  }

  return isAllPageRowsSelected
}

export function table_getIsSomeRowsSelected<TData extends RowData>(
  table: Table<TData>,
) {
  const totalSelected = Object.keys(table.getState().rowSelection).length
  return (
    totalSelected > 0 &&
    totalSelected < table_getFilteredRowModel(table).flatRows.length
  )
}

export function table_getIsSomePageRowsSelected<TData extends RowData>(
  table: Table<TData>,
) {
  const paginationFlatRows = table_getPaginatedRowModel(table).flatRows
  return table_getIsAllPageRowsSelected(table)
    ? false
    : paginationFlatRows
        .filter((row) => row_getCanSelect(row, table))
        .some(
          (row) =>
            row_getIsSelected(row, table) || row_getIsSomeSelected(row, table),
        )
}

export function table_getToggleAllRowsSelectedHandler<TData extends RowData>(
  table: Table<TData>,
) {
  return (e: unknown) => {
    table_toggleAllRowsSelected(
      table,
      ((e as MouseEvent).target as HTMLInputElement).checked,
    )
  }
}

export function table_getToggleAllPageRowsSelectedHandler<
  TData extends RowData,
>(table: Table<TData>) {
  return (e: unknown) => {
    table_toggleAllPageRowsSelected(
      table,
      ((e as MouseEvent).target as HTMLInputElement).checked,
    )
  }
}

export function row_toggleSelected<TData extends RowData>(
  row: Row<TData>,
  table: Table<TData>,
  value?: boolean,
  opts?: {
    selectChildren?: boolean
  },
) {
  const isSelected = row_getIsSelected(row, table)

  table_setRowSelection(table, (old) => {
    value = typeof value !== 'undefined' ? value : !isSelected

    if (row_getCanSelect(row, table) && isSelected === value) {
      return old
    }

    const selectedRowIds = { ...old }

    mutateRowIsSelected(
      selectedRowIds,
      row.id,
      value,
      opts?.selectChildren ?? true,
      table,
    )

    return selectedRowIds
  })
}

export function row_getIsSelected<TData extends RowData>(
  row: Row<TData>,
  table: Table<TData>,
) {
  const { rowSelection } = table.getState()
  return isRowSelected(row, rowSelection)
}

export function row_getIsSomeSelected<TData extends RowData>(
  row: Row<TData>,
  table: Table<TData>,
) {
  const { rowSelection } = table.getState()
  return isSubRowSelected(row, rowSelection, table) === 'some'
}

export function row_getIsAllSubRowsSelected<TData extends RowData>(
  row: Row<TData>,
  table: Table<TData>,
) {
  const { rowSelection } = table.getState()
  return isSubRowSelected(row, rowSelection, table) === 'all'
}

export function row_getCanSelect<TData extends RowData>(
  row: Row<TData>,
  table: Table<TData>,
) {
  if (typeof table.options.enableRowSelection === 'function') {
    return table.options.enableRowSelection(row)
  }

  return table.options.enableRowSelection ?? true
}

export function row_getCanSelectSubRows<TData extends RowData>(
  row: Row<TData>,
  table: Table<TData>,
) {
  if (typeof table.options.enableSubRowSelection === 'function') {
    return table.options.enableSubRowSelection(row)
  }

  return table.options.enableSubRowSelection ?? true
}

export function row_getCanMultiSelect<TData extends RowData>(
  row: Row<TData>,
  table: Table<TData>,
) {
  if (typeof table.options.enableMultiRowSelection === 'function') {
    return table.options.enableMultiRowSelection(row)
  }

  return table.options.enableMultiRowSelection ?? true
}

export function row_getToggleSelectedHandler<TData extends RowData>(
  row: Row<TData>,
  table: Table<TData>,
) {
  const canSelect = row_getCanSelect(row, table)

  return (e: unknown) => {
    if (!canSelect) return
    row_toggleSelected(
      row,
      table,
      ((e as MouseEvent).target as HTMLInputElement).checked,
    )
  }
}

const mutateRowIsSelected = <TData extends RowData>(
  selectedRowIds: Record<string, boolean>,
  rowId: string,
  value: boolean,
  includeChildren: boolean,
  table: Table<TData>,
) => {
  const row = table_getRow(table, rowId, true)

  // const isGrouped = row.getIsGrouped()

  // if ( // TODO: enforce grouping row selection rules
  //   !isGrouped ||
  //   (isGrouped && table.options.enableGroupingRowSelection)
  // ) {
  if (value) {
    if (!row_getCanMultiSelect(row, table)) {
      Object.keys(selectedRowIds).forEach((key) => delete selectedRowIds[key])
    }
    if (row_getCanSelect(row, table)) {
      selectedRowIds[rowId] = true
    }
  } else {
    delete selectedRowIds[rowId]
  }
  // }

  if (
    includeChildren &&
    row.subRows.length &&
    row_getCanSelectSubRows(row, table)
  ) {
    row.subRows.forEach((r) =>
      mutateRowIsSelected(selectedRowIds, r.id, value, includeChildren, table),
    )
  }
}

export function selectRowsFn<TData extends RowData>(
  table: Table<TData>,
  rowModel: RowModel<TData>,
): RowModel<TData> {
  const rowSelection = table.getState().rowSelection

  const newSelectedFlatRows: Array<Row<TData>> = []
  const newSelectedRowsById: Record<string, Row<TData>> = {}

  // Filters top level and nested rows
  const recurseRows = (
    rows: Array<Row<TData>>,
    depth = 0,
  ): Array<Row<TData>> => {
    return rows
      .map((row) => {
        const isSelected = isRowSelected(row, rowSelection)

        if (isSelected) {
          newSelectedFlatRows.push(row)
          newSelectedRowsById[row.id] = row
        }

        if (row.subRows.length) {
          row = {
            ...row,
            subRows: recurseRows(row.subRows, depth + 1),
          }
        }

        if (isSelected) {
          return row
        }
      })
      .filter(Boolean) as Array<Row<TData>>
  }

  return {
    rows: recurseRows(rowModel.rows),
    flatRows: newSelectedFlatRows,
    rowsById: newSelectedRowsById,
  }
}

export function isRowSelected<TData extends RowData>(
  row: Row<TData>,
  selection: Record<string, boolean>,
): boolean {
  return selection[row.id] ?? false
}

export function isSubRowSelected<TData extends RowData>(
  row: Row<TData>,
  selection: Record<string, boolean>,
  table: Table<TData>,
): boolean | 'some' | 'all' {
  if (!row.subRows.length) return false

  let allChildrenSelected = true
  let someSelected = false

  row.subRows.forEach((subRow) => {
    // Bail out early if we know both of these
    if (someSelected && !allChildrenSelected) {
      return
    }

    if (row_getCanSelect(subRow, table)) {
      if (isRowSelected(subRow, selection)) {
        someSelected = true
      } else {
        allChildrenSelected = false
      }
    }

    // Check row selection of nested subrows
    if (subRow.subRows.length) {
      const subRowChildrenSelected = isSubRowSelected(subRow, selection, table)
      if (subRowChildrenSelected === 'all') {
        someSelected = true
      } else if (subRowChildrenSelected === 'some') {
        someSelected = true
        allChildrenSelected = false
      } else {
        allChildrenSelected = false
      }
    }
  })

  // eslint-disable-next-line ts/no-unnecessary-condition
  return allChildrenSelected ? 'all' : someSelected ? 'some' : false
}
