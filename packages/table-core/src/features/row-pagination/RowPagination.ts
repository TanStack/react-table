import { assignAPIs, getMemoOptions, makeStateUpdater, memo } from '../../utils'
import {
  getDefaultPaginationState,
  table_autoResetPageIndex,
  table_firstPage,
  table_getCanNextPage,
  table_getCanPreviousPage,
  table_getPageCount,
  table_getPageOptions,
  table_getPaginatedRowModel,
  table_getPrePaginationRowModel,
  table_getRowCount,
  table_lastPage,
  table_nextPage,
  table_previousPage,
  table_resetPageIndex,
  table_resetPageSize,
  table_resetPagination,
  table_setPageIndex,
  table_setPageSize,
  table_setPagination,
} from './RowPagination.utils'
import type { TableState } from '../../types/TableState'
import type {
  PaginationDefaultOptions,
  TableState_RowPagination,
  Table_RowPagination,
} from './RowPagination.types'
import type { RowData } from '../../types/type-utils'
import type { TableFeature, TableFeatures } from '../../types/TableFeatures'
import type { Table } from '../../types/Table'

/**
 * The (Row) Pagination feature adds pagination state and APIs to the table object.
 * @link [API Docs](https://tanstack.com/table/v8/docs/api/features/pagination)
 * @link [Guide](https://tanstack.com/table/v8/docs/guide/pagination)
 */
export const RowPagination: TableFeature = {
  _getInitialState: <TFeatures extends TableFeatures>(
    state: TableState<TFeatures> & Partial<TableState_RowPagination>,
  ): TableState<TFeatures> & TableState_RowPagination => {
    return {
      ...state,
      pagination: {
        ...getDefaultPaginationState(),
        ...state.pagination,
      },
    }
  },

  _getDefaultOptions: <TFeatures extends TableFeatures, TData extends RowData>(
    table: Table<TFeatures, TData> &
      Partial<Table_RowPagination<TFeatures, TData>>,
  ): PaginationDefaultOptions => {
    return {
      onPaginationChange: makeStateUpdater('pagination', table),
    }
  },

  _createTable: <TFeatures extends TableFeatures, TData extends RowData>(
    table: Table<TFeatures, TData> &
      Partial<Table_RowPagination<TFeatures, TData>>,
  ): void => {


    assignAPIs(table, table, [
      {
        fn: () => table_autoResetPageIndex(table),
      },
      {
        fn: (updater) => table_setPagination(table, updater),
      },
      {
        fn: (defaultState) => table_resetPagination(table, defaultState),
      },
      {
        fn: (updater) => table_setPageIndex(table, updater),
      },
      {
        fn: (defaultState) => table_resetPageIndex(table, defaultState),
      },
      {
        fn: (updater) => table_setPageSize(table, updater),
      },
      {
        fn: () => table_getPageCount(table),
        memoDeps: () => [table_getPageCount(table)],
      },
      {
        fn: (defaultState) => table_resetPageSize(table, defaultState),
      },
      {
        fn: () => table_getPageOptions(table),
      },
      {
        fn: () => table_getCanPreviousPage(table),
      },
      {
        fn: () => table_getCanNextPage(table),
      },
      {
        fn: () => table_previousPage(table),
      },
      {
        fn: () => table_nextPage(table),
      },
      {
        fn: () => table_firstPage(table),
      },
      {
        fn: () => table_lastPage(table),
      },
      {
        fn: () => table_getPrePaginationRowModel(table),
      },
      {
        fn: () => table_getPaginatedRowModel(table),
      },
      {
        fn: () => table_getPageCount(table),
      },
      {
        fn: () => table_getRowCount(table),
      },
    ])
  },
}
