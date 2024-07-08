import { getMemoOptions, memo } from '../../utils'
import { row_getUniqueValues } from '../../core/rows/Rows.utils'
import type { RowData, Table } from '../../types'

export function createFacetedUniqueValues<TData extends RowData>(): (
  table: Table<TData>,
  columnId: string,
) => () => Map<any, number> {
  return (table, columnId) =>
    memo(
      () => [table.getColumn(columnId)?.getFacetedRowModel()],
      (facetedRowModel) => {
        if (!facetedRowModel) return new Map()

        const facetedUniqueValues = new Map<any, number>()

        for (const row of facetedRowModel.flatRows) {
          const values = row_getUniqueValues(row, table, columnId)

          for (const value of values) {
            if (facetedUniqueValues.has(value)) {
              facetedUniqueValues.set(
                value,
                (facetedUniqueValues.get(value) ?? 0) + 1,
              )
            } else {
              facetedUniqueValues.set(value, 1)
            }
          }
        }

        return facetedUniqueValues
      },
      getMemoOptions(
        table.options,
        'debugTable',
        `getFacetedUniqueValues_${columnId}`,
      ),
    )
}
