import type { CellData, RowData } from './type-utils'
import type { ColumnDefBase_All } from './ColumnDef'
import type { Cell } from './Cell'
import type { Column } from './Column'
import type { Header } from './Header'
import type { Row } from './Row'
import type { Table } from './Table'
import type { TableOptions_All } from './TableOptions'
import type { TableState_All } from './TableState'

export interface CoreTableFeatures {
  cellsFeature?: TableFeature
  columnsFeature?: TableFeature
  headersFeature?: TableFeature
  rowsFeature?: TableFeature
  rowModelsFeature?: TableFeature
  tablesFeature?: TableFeature
}

export interface StockTableFeatures {
  columnFacetingFeature?: TableFeature
  columnFilteringFeature?: TableFeature
  columnGroupingFeature?: TableFeature
  columnOrderingFeature?: TableFeature
  columnPinningFeature?: TableFeature
  columnResizingFeature?: TableFeature
  columnSizingFeature?: TableFeature
  columnVisibilityFeature?: TableFeature
  globalFacetingFeature?: TableFeature
  globalFilteringFeature?: TableFeature
  rowExpandingFeature?: TableFeature
  rowPaginationFeature?: TableFeature
  rowPinningFeature?: TableFeature
  rowSelectionFeature?: TableFeature
  rowSortingFeature?: TableFeature
}

export interface Plugins {}

export interface TableFeatures
  extends CoreTableFeatures,
    StockTableFeatures,
    Plugins {}

export interface TableFeature {
  constructCellAPIs?: <
    TFeatures extends TableFeatures,
    TData extends RowData,
    TValue extends CellData = CellData,
  >(
    cell: Cell<TFeatures, TData, TValue>,
  ) => void
  constructColumnAPIs?: <
    TFeatures extends TableFeatures,
    TData extends RowData,
    TValue extends CellData = CellData,
  >(
    column: Column<TFeatures, TData, TValue>,
  ) => void
  constructHeaderAPIs?: <
    TFeatures extends TableFeatures,
    TData extends RowData,
    TValue extends CellData = CellData,
  >(
    header: Header<TFeatures, TData, TValue>,
  ) => void
  constructRowAPIs?: <TFeatures extends TableFeatures, TData extends RowData>(
    row: Row<TFeatures, TData>,
  ) => void
  constructTableAPIs?: <TFeatures extends TableFeatures, TData extends RowData>(
    table: Table<TFeatures, TData>,
  ) => void
  getDefaultColumnDef?: <
    TFeatures extends TableFeatures,
    TData extends RowData,
    TValue extends CellData = CellData,
  >() => ColumnDefBase_All<TFeatures, TData, TValue>
  getDefaultTableOptions?: <
    TFeatures extends TableFeatures,
    TData extends RowData,
  >(
    table: Table<TFeatures, TData>,
  ) => Partial<TableOptions_All<TFeatures, TData>>
  getInitialState?: (
    initialState: Partial<TableState_All>,
  ) => Partial<TableState_All>
}
