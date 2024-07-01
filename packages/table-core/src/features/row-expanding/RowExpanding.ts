import { Table, Row, RowData, TableFeature } from '../../types'
import { makeStateUpdater } from '../../utils'
import {
  ExpandedOptions,
  ExpandedStateList,
  ExpandedTableState,
} from './RowExpanding.types'
import {
  row_getCanExpand,
  row_getIsAllParentsExpanded,
  row_getIsExpanded,
  row_getToggleExpandedHandler,
  row_toggleExpanded,
  table_autoResetExpanded,
  table_getCanSomeRowsExpand,
  table_getExpandedDepth,
  table_getExpandedRowModel,
  table_getIsAllRowsExpanded,
  table_getIsSomeRowsExpanded,
  table_getPreExpandedRowModel,
  table_getToggleAllRowsExpandedHandler,
  table_resetExpanded,
  table_setExpanded,
  table_toggleAllRowsExpanded,
} from './RowExpanding.utils'

export const RowExpanding: TableFeature = {
  _getInitialState: (state): ExpandedTableState => {
    return {
      expanded: {},
      ...state,
    }
  },

  _getDefaultOptions: <TData extends RowData>(
    table: Table<TData>
  ): ExpandedOptions<TData> => {
    return {
      onExpandedChange: makeStateUpdater('expanded', table),
      paginateExpandedRows: true,
    }
  },

  _createTable: <TData extends RowData>(table: Table<TData>): void => {
    let registered = false
    let queued = false

    table._autoResetExpanded = () =>
      table_autoResetExpanded(table, registered, queued)

    table.setExpanded = updater => table_setExpanded(table, updater)

    table.toggleAllRowsExpanded = expanded =>
      table_toggleAllRowsExpanded(table, expanded)

    table.resetExpanded = defaultState =>
      table_resetExpanded(table, defaultState)

    table.getCanSomeRowsExpand = () => table_getCanSomeRowsExpand(table)

    table.getToggleAllRowsExpandedHandler = () =>
      table_getToggleAllRowsExpandedHandler(table)

    table.getIsSomeRowsExpanded = () => table_getIsSomeRowsExpanded(table)

    table.getIsAllRowsExpanded = () => table_getIsAllRowsExpanded(table)

    table.getExpandedDepth = () => table_getExpandedDepth(table)

    table.getPreExpandedRowModel = () => table_getPreExpandedRowModel(table)

    table.getExpandedRowModel = () => table_getExpandedRowModel(table)
  },

  _createRow: <TData extends RowData>(
    row: Row<TData>,
    table: Table<TData>
  ): void => {
    row.toggleExpanded = expanded => row_toggleExpanded(row, table, expanded)

    row.getIsExpanded = () => row_getIsExpanded(row, table)

    row.getCanExpand = () => row_getCanExpand(row, table)

    row.getIsAllParentsExpanded = () => row_getIsAllParentsExpanded(row, table)

    row.getToggleExpandedHandler = () => row_getToggleExpandedHandler(row)
  },
}
