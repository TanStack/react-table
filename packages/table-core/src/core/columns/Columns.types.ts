import type { CellData, RowData } from '../../types/type-utils'
import type { TableFeatures } from '../../types/TableFeatures'
import type { AccessorFn, ColumnDef } from '../../types/ColumnDef'
import type { Column } from '../../types/Column'

export interface Column_CoreProperties<
  TFeatures extends TableFeatures,
  TData extends RowData,
  TValue extends CellData = CellData,
> {
  /**
   * The resolved accessor function to use when extracting the value for the column from each row. Will only be defined if the column def has a valid accessor key or function defined.
   * @link [API Docs](https://tanstack.com/table/v8/docs/api/core/column#accessorfn)
   * @link [Guide](https://tanstack.com/table/v8/docs/guide/column-defs)
   */
  accessorFn?: AccessorFn<TData, TValue>
  /**
   * The original column def used to create the column.
   * @link [API Docs](https://tanstack.com/table/v8/docs/api/core/column#columndef)
   * @link [Guide](https://tanstack.com/table/v8/docs/guide/column-defs)
   */
  columnDef: ColumnDef<TFeatures, TData, TValue>
  /**
   * The child column (if the column is a group column). Will be an empty array if the column is not a group column.
   * @link [API Docs](https://tanstack.com/table/v8/docs/api/core/column#columns)
   * @link [Guide](https://tanstack.com/table/v8/docs/guide/column-defs)
   */
  columns: Array<Column<TFeatures, TData, TValue>>
  /**
   * The depth of the column (if grouped) relative to the root column def array.
   * @link [API Docs](https://tanstack.com/table/v8/docs/api/core/column#depth)
   * @link [Guide](https://tanstack.com/table/v8/docs/guide/column-defs)
   */
  depth: number
  /**
   * The resolved unique identifier for the column resolved in this priority:
      - A manual `id` property from the column def
      - The accessor key from the column def
      - The header string from the column def
   * @link [API Docs](https://tanstack.com/table/v8/docs/api/core/column#id)
   * @link [Guide](https://tanstack.com/table/v8/docs/guide/column-defs)
   */
  id: string
  /**
   * The parent column for this column. Will be undefined if this is a root column.
   * @link [API Docs](https://tanstack.com/table/v8/docs/api/core/column#parent)
   * @link [Guide](https://tanstack.com/table/v8/docs/guide/column-defs)
   */
  parent?: Column<TFeatures, TData, TValue>
}

export interface Column_Column<
  TFeatures extends TableFeatures,
  TData extends RowData,
  TValue extends CellData = CellData,
> extends Column_CoreProperties<TFeatures, TData, TValue> {
  /**
   * Returns the flattened array of this column and all child/grand-child columns for this column.
   * @link [API Docs](https://tanstack.com/table/v8/docs/api/core/column#getflatcolumns)
   * @link [Guide](https://tanstack.com/table/v8/docs/guide/column-defs)
   */
  getFlatColumns: () => Array<Column<TFeatures, TData, TValue>>
  /**
   * Returns an array of all leaf-node columns for this column. If a column has no children, it is considered the only leaf-node column.
   * @link [API Docs](https://tanstack.com/table/v8/docs/api/core/column#getleafcolumns)
   * @link [Guide](https://tanstack.com/table/v8/docs/guide/column-defs)
   */
  getLeafColumns: () => Array<Column<TFeatures, TData, TValue>>
}

export interface TableOptions_Columns<
  TFeatures extends TableFeatures,
  TData extends RowData,
  TValue extends CellData = CellData,
> {
  /**
   * The array of column defs to use for the table.
   * @link [API Docs](https://tanstack.com/table/v8/docs/api/core/table#columns)
   * @link [Guide](https://tanstack.com/table/v8/docs/guide/tables)
   */
  columns: Array<ColumnDef<TFeatures, TData, TValue>>
  /**
   * Set this option to `true` to output column debugging information to the console.
   * @link [API Docs](https://tanstack.com/table/v8/docs/api/core/table#debugcolumns)
   * @link [Guide](https://tanstack.com/table/v8/docs/guide/tables)
   */
  debugColumns?: boolean
  /**
   * Default column options to use for all column defs supplied to the table.
   * @link [API Docs](https://tanstack.com/table/v8/docs/api/core/table#defaultcolumn)
   * @link [Guide](https://tanstack.com/table/v8/docs/guide/tables)
   */
  defaultColumn?: Partial<ColumnDef<TFeatures, TData, TValue>>
}

export interface Table_Columns<
  TFeatures extends TableFeatures,
  TData extends RowData,
> {
  getAllFlatColumnsById: () => Record<string, Column<TFeatures, TData, unknown>>
  getDefaultColumnDef: () => Partial<ColumnDef<TFeatures, TData, unknown>>
  /**
   * Returns all columns in the table in their normalized and nested hierarchy.
   * @link [API Docs](https://tanstack.com/table/v8/docs/api/core/table#getallcolumns)
   * @link [Guide](https://tanstack.com/table/v8/docs/guide/tables)
   */
  getAllColumns: () => Array<Column<TFeatures, TData, unknown>>
  /**
   * Returns all columns in the table flattened to a single level.
   * @link [API Docs](https://tanstack.com/table/v8/docs/api/core/table#getallflatcolumns)
   * @link [Guide](https://tanstack.com/table/v8/docs/guide/tables)
   */
  getAllFlatColumns: () => Array<Column<TFeatures, TData, unknown>>
  /**
   * Returns all leaf-node columns in the table flattened to a single level. This does not include parent columns.
   * @link [API Docs](https://tanstack.com/table/v8/docs/api/core/table#getallleafcolumns)
   * @link [Guide](https://tanstack.com/table/v8/docs/guide/tables)
   */
  getAllLeafColumns: () => Array<Column<TFeatures, TData, unknown>>
  /**
   * Returns a single column by its ID.
   * @link [API Docs](https://tanstack.com/table/v8/docs/api/core/table#getcolumn)
   * @link [Guide](https://tanstack.com/table/v8/docs/guide/tables)
   */
  getColumn: (columnId: string) => Column<TFeatures, TData, unknown> | undefined
}
