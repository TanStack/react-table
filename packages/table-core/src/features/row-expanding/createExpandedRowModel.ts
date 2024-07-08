import { getMemoOptions, memo } from '../../utils'
import { row_getIsExpanded } from './RowExpanding.utils'
import type { Row, RowData, RowModel, Table } from '../../types'

export function createExpandedRowModel<TData extends RowData>(): (
  table: Table<TData>,
) => () => RowModel<TData> {
  return (table) =>
    memo(
      () => [
        table.getState().expanded,
        table.getPreExpandedRowModel(),
        table.options.paginateExpandedRows,
      ],
      (expanded, rowModel, paginateExpandedRows) => {
        if (
          !rowModel.rows.length ||
          (expanded !== true && !Object.keys(expanded).length)
        ) {
          return rowModel
        }

        if (!paginateExpandedRows) {
          // Only expand rows at this point if they are being paginated
          return rowModel
        }

        return expandRows(rowModel, table)
      },
      getMemoOptions(table.options, 'debugTable', 'getExpandedRowModel'),
    )
}

export function expandRows<TData extends RowData>(
  rowModel: RowModel<TData>,
  table: Table<TData>,
) {
  const expandedRows: Array<Row<TData>> = []

  const handleRow = (row: Row<TData>) => {
    expandedRows.push(row)

    if (row.subRows.length && row_getIsExpanded(row, table)) {
      row.subRows.forEach(handleRow)
    }
  }

  rowModel.rows.forEach(handleRow)

  return {
    rows: expandedRows,
    flatRows: rowModel.flatRows,
    rowsById: rowModel.rowsById,
  }
}
