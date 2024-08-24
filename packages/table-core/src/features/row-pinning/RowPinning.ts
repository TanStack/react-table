import { _memo, assignAPIs, makeStateUpdater } from '../../utils'
import { _table_getState } from '../../core/table/Tables.utils'
import {
  getDefaultRowPinningState,
  row_getCanPin,
  row_getIsPinned,
  row_getPinnedIndex,
  row_pin,
  table_getBottomRows,
  table_getCenterRows,
  table_getIsSomeRowsPinned,
  table_getTopRows,
  table_resetRowPinning,
  table_setRowPinning,
} from './RowPinning.utils'
import type { RowData } from '../../types/type-utils'
import type { TableFeature, TableFeatures } from '../../types/TableFeatures'
import type { Table } from '../../types/Table'
import type { Row } from '../../types/Row'
import type {
  RowPinningDefaultOptions,
  Row_RowPinning,
  TableState_RowPinning,
  Table_RowPinning,
} from './RowPinning.types'

/**
 * The Row Pinning feature adds row pinning state and APIs to the table and row objects.
 * @link [API Docs](https://tanstack.com/table/v8/docs/api/features/row-pinning)
 * @link [Guide](https://tanstack.com/table/v8/docs/guide/row-pinning)
 */
export const RowPinning: TableFeature = {
  _getInitialState: (state): TableState_RowPinning => {
    return {
      rowPinning: getDefaultRowPinningState(),
      ...state,
    }
  },

  _getDefaultOptions: <TFeatures extends TableFeatures, TData extends RowData>(
    table: Table<TFeatures, TData> &
      Partial<Table_RowPinning<TFeatures, TData>>,
  ): RowPinningDefaultOptions => {
    return {
      onRowPinningChange: makeStateUpdater('rowPinning', table),
    }
  },

  _createRow: <TFeatures extends TableFeatures, TData extends RowData>(
    row: Row<TFeatures, TData> & Partial<Row_RowPinning>,
    table: Table<TFeatures, TData> &
      Partial<Table_RowPinning<TFeatures, TData>>,
  ): void => {
    assignAPIs(row, table, [
      {
        fn: () => row_getCanPin(row, table),
      },
      {
        fn: () => row_getIsPinned(row, table),
      },
      {
        fn: () => row_getPinnedIndex(row, table),
        memoDeps: () => [
          table.getRowModel().rows,
          _table_getState(table).rowPinning,
        ],
      },
      {
        fn: (position, includeLeafRows, includeParentRows) =>
          row_pin(row, table, position, includeLeafRows, includeParentRows),
      },
    ])
  },

  _createTable: <TFeatures extends TableFeatures, TData extends RowData>(
    table: Table<TFeatures, TData> &
      Partial<Table_RowPinning<TFeatures, TData>>,
  ): void => {
    assignAPIs(table, table, [
      {
        fn: (updater) => table_setRowPinning(table, updater),
      },
      {
        fn: (defaultState) => table_resetRowPinning(table, defaultState),
      },
      {
        fn: (position) => table_getIsSomeRowsPinned(table, position),
      },
      {
        fn: () => table_getTopRows(table),
        memoDeps: () => [
          table.getRowModel().rows,
          _table_getState(table).rowPinning?.top,
        ],
      },
      {
        fn: () => table_getBottomRows(table),
        memoDeps: () => [
          table.getRowModel().rows,
          _table_getState(table).rowPinning?.bottom,
        ],
      },
      {
        fn: () => table_getCenterRows(table),
        memoDeps: () => [
          table.getRowModel().rows,
          _table_getState(table).rowPinning,
        ],
      },
    ])
  },
}
