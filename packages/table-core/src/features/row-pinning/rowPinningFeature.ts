import { assignAPIs, makeStateUpdater } from '../../utils'
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
} from './rowPinningFeature.utils'
import type { TableState_All } from '../../types/TableState'
import type { RowData } from '../../types/type-utils'
import type { TableFeature, TableFeatures } from '../../types/TableFeatures'
import type { Table_Internal } from '../../types/Table'
import type { Row } from '../../types/Row'
import type {
  RowPinningDefaultOptions,
  Row_RowPinning,
} from './rowPinningFeature.types'

/**
 * The Row Pinning feature adds row pinning state and APIs to the table and row objects.
 * [API Docs](https://tanstack.com/table/v8/docs/api/features/row-pinning)
 * [Guide](https://tanstack.com/table/v8/docs/guide/row-pinning)
 */
export const rowPinningFeature: TableFeature = {
  getInitialState: (
    initialState: Partial<TableState_All>,
  ): Partial<TableState_All> => {
    return {
      ...initialState,
      rowPinning: {
        ...getDefaultRowPinningState(),
        ...initialState.rowPinning,
      },
    }
  },

  getDefaultTableOptions: <
    TFeatures extends TableFeatures,
    TData extends RowData,
  >(
    table: Table_Internal<TFeatures, TData>,
  ): RowPinningDefaultOptions => {
    return {
      onRowPinningChange: makeStateUpdater('rowPinning', table),
    }
  },

  constructRowAPIs: <TFeatures extends TableFeatures, TData extends RowData>(
    row: Row<TFeatures, TData> & Partial<Row_RowPinning>,
  ): void => {
    assignAPIs(row, [
      {
        fn: () => row_getCanPin(row),
      },
      {
        fn: () => row_getIsPinned(row),
      },
      {
        fn: () => row_getPinnedIndex(row),
        memoDeps: () => [
          row.table.getRowModel().rows,
          row.table.options.state?.rowPinning,
        ],
      },
      {
        fn: (position, includeLeafRows, includeParentRows) =>
          row_pin(row, position, includeLeafRows, includeParentRows),
      },
    ])
  },

  constructTableAPIs: <TFeatures extends TableFeatures, TData extends RowData>(
    table: Table_Internal<TFeatures, TData>,
  ): void => {
    assignAPIs(table, [
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
          table.options.state?.rowPinning?.top,
        ],
      },
      {
        fn: () => table_getBottomRows(table),
        memoDeps: () => [
          table.getRowModel().rows,
          table.options.state?.rowPinning?.bottom,
        ],
      },
      {
        fn: () => table_getCenterRows(table),
        memoDeps: () => [
          table.getRowModel().rows,
          table.options.state?.rowPinning,
        ],
      },
    ])
  },
}