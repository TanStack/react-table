import type {
  AccessorFn,
  Column,
  ColumnDef,
  ColumnDefResolved,
  RowData,
  Table,
} from '../../types'
import type { Column_CoreProperties } from './Columns.types'

export function _createColumn<TData extends RowData, TValue>(
  table: Table<TData>,
  columnDef: ColumnDef<TData, TValue>,
  depth: number,
  parent?: Column<TData, TValue>,
): Column<TData, TValue> {
  const defaultColumn = table._getDefaultColumnDef()

  const resolvedColumnDef = {
    ...defaultColumn,
    ...columnDef,
  } as ColumnDefResolved<TData>

  const accessorKey = resolvedColumnDef.accessorKey

  const id =
    resolvedColumnDef.id ??
    (accessorKey ? accessorKey.replace('.', '_') : undefined) ??
    (typeof resolvedColumnDef.header === 'string'
      ? resolvedColumnDef.header
      : undefined)

  let accessorFn: AccessorFn<TData> | undefined

  if (resolvedColumnDef.accessorFn) {
    accessorFn = resolvedColumnDef.accessorFn
  } else if (accessorKey) {
    // Support deep accessor keys
    if (accessorKey.includes('.')) {
      accessorFn = (originalRow: TData) => {
        let result = originalRow as Record<string, any> | undefined

        for (const key of accessorKey.split('.')) {
          result = result?.[key]
          if (process.env.NODE_ENV !== 'production' && result === undefined) {
            console.warn(
              `"${key}" in deeply nested key "${accessorKey}" returned undefined.`,
            )
          }
        }

        return result
      }
    } else {
      accessorFn = (originalRow: TData) =>
        (originalRow as any)[resolvedColumnDef.accessorKey]
    }
  }

  if (!id) {
    if (process.env.NODE_ENV !== 'production') {
      throw new Error(
        resolvedColumnDef.accessorFn
          ? `Columns require an id when using an accessorFn`
          : `Columns require an id when using a non-string header`,
      )
    }
    throw new Error()
  }

  const column: Column_CoreProperties<TData, any> = {
    id: `${String(id)}`,
    accessorFn,
    parent: parent as any,
    depth,
    columnDef: resolvedColumnDef as ColumnDef<TData, any>,
    columns: [],
  }

  for (const feature of Object.values(table._features)) {
    feature?._createColumn?.(column as Column<TData, TValue>, table)
  }

  return column as Column<TData, TValue>
}
