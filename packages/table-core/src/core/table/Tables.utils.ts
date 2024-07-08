import { table_getPaginatedRowModel } from '../../features/row-pagination/RowPagination.utils'
import { functionalUpdate } from '../../utils'
import type {
  RowData,
  RowModel,
  Table,
  TableOptionsResolved,
  TableState,
  Updater,
} from '../../types'
import type { RequiredKeys } from '../../utils.types'

export function table_reset<TData extends RowData>(table: Table<TData>): void {
  table_setState(table, table.initialState)
}

export function table_mergeOptions<TData extends RowData>(
  table: Table<TData>,
  newOptions: TableOptionsResolved<TData>,
) {
  if (table.options.mergeOptions) {
    return table.options.mergeOptions(table.options, newOptions)
  }

  return {
    ...table.options,
    ...newOptions,
  }
}

export function table_setOptions<TData extends RowData>(
  table: Table<TData>,
  updater: Updater<TableOptionsResolved<TData>>,
): void {
  const newOptions = functionalUpdate(updater, table.options)
  table.options = table_mergeOptions(table, newOptions) as RequiredKeys<
    TableOptionsResolved<TData>,
    'state'
  >
}

export function table_getState<TData extends RowData>(
  table: Table<TData>,
): TableState {
  return table.options.state as TableState
}

export function table_setState<TData extends RowData>(
  table: Table<TData>,
  updater: Updater<TableState>,
): void {
  table.options.onStateChange(updater)
}
