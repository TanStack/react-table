import type { RowData, Updater } from '../../types/type-utils'
import type {
  CoreTableFeatures,
  TableFeatures,
} from '../../types/TableFeatures'
import type {
  CachedRowModels,
  RowModel,
  RowModelOptions,
} from '../../types/RowModel'
import type { TableOptions } from '../../types/TableOptions'
import type { TableState } from '../../types/TableState'

export interface TableMeta<
  TFeatures extends TableFeatures,
  TData extends RowData,
> {}

export interface TableOptions_Table<
  TFeatures extends TableFeatures,
  TData extends RowData,
> {
  /**
   * The features that you want to enable for the table.
   * @link [API Docs](https://tanstack.com/table/v8/docs/api/core/table#_features)
   * @link [Guide](https://tanstack.com/table/v8/docs/guide/tables)
   */
  _features: TFeatures
  /**
   * The row model options that you want to enable for the table.
   * @link [API Docs](https://tanstack.com/table/v8/docs/api/core/table#_rowmodels)
   * @link [Guide](https://tanstack.com/table/v8/docs/guide/tables)
   */
  _rowModels?: RowModelOptions<TFeatures, TData>
  /**
   * Set this option to override any of the `autoReset...` feature options.
   * @link [API Docs](https://tanstack.com/table/v8/docs/api/core/table#autoresetall)
   * @link [Guide](https://tanstack.com/table/v8/docs/guide/tables)
   */
  autoResetAll?: boolean
  /**
   * The data for the table to display. This array should match the type you provided to `table.setRowType<...>`. Columns can access this data via string/index or a functional accessor. When the `data` option changes reference, the table will reprocess the data.
   * @link [API Docs](https://tanstack.com/table/v8/docs/api/core/table#data)
   * @link [Guide](https://tanstack.com/table/v8/docs/guide/tables)
   */
  data: Array<TData>
  /**
   * Set this option to `true` to output all debugging information to the console.
   * @link [API Docs](https://tanstack.com/table/v8/docs/api/core/table#debugall)
   * @link [Guide](https://tanstack.com/table/v8/docs/guide/tables)
   */
  debugAll?: boolean
  /**
   * Set this option to `true` to output table debugging information to the console.
   * @link [API Docs](https://tanstack.com/table/v8/docs/api/core/table#debugtable)
   * @link [Guide](https://tanstack.com/table/v8/docs/guide/tables)
   */
  debugTable?: boolean
  /**
   * Use this option to optionally pass initial state to the table. This state will be used when resetting various table states either automatically by the table (eg. `options.autoResetPageIndex`) or via functions like `table.resetRowSelection()`. Most reset function allow you optionally pass a flag to reset to a blank/default state instead of the initial state.
   *
   * Table state will not be reset when this object changes, which also means that the initial state object does not need to be stable.
   *
   * @link [API Docs](https://tanstack.com/table/v8/docs/api/core/table#initialstate)
   * @link [Guide](https://tanstack.com/table/v8/docs/guide/tables)
   */
  initialState?: Partial<TableState<TFeatures>>
  /**
   * This option is used to optionally implement the merging of table options.
   * @link [API Docs](https://tanstack.com/table/v8/docs/api/core/table#mergeoptions)
   * @link [Guide](https://tanstack.com/table/v8/docs/guide/tables)
   */
  mergeOptions?: (
    defaultOptions: TableOptions<TFeatures, TData>,
    options: Partial<TableOptions<TFeatures, TData>>,
  ) => TableOptions<TFeatures, TData>
  /**
   * You can pass any object to `options.meta` and access it anywhere the `table` is available via `table.options.meta`.
   * @link [API Docs](https://tanstack.com/table/v8/docs/api/core/table#meta)
   * @link [Guide](https://tanstack.com/table/v8/docs/guide/tables)
   */
  meta?: TableMeta<TFeatures, TData>
  /**
   * The `onStateChange` option can be used to optionally listen to state changes within the table.
   * @link [API Docs](https://tanstack.com/table/v8/docs/api/core/table#onstatechange)
   * @link [Guide](https://tanstack.com/table/v8/docs/guide/tables)
   */
  onStateChange?: (updater: Updater<TableState<TFeatures>>) => void
  /**
   * The `state` option can be used to optionally _control_ part or all of the table state. The state you pass here will merge with and overwrite the internal automatically-managed state to produce the final state for the table. You can also listen to state changes via the `onStateChange` option.
   * > Note: Any state passed in here will override both the internal state and any other `initialState` you provide.
   * @link [API Docs](https://tanstack.com/table/v8/docs/api/core/table#state)
   * @link [Guide](https://tanstack.com/table/v8/docs/guide/tables)
   */
  state?: Partial<TableState<TFeatures>>
}

export interface Table_CoreProperties<
  TFeatures extends TableFeatures,
  TData extends RowData,
> {
  _features: CoreTableFeatures & TFeatures
  _rowModels: CachedRowModels<TFeatures, TData>
  /**
   * This is the resolved initial state of the table.
   * @link [API Docs](https://tanstack.com/table/v8/docs/api/core/table#initialstate)
   * @link [Guide](https://tanstack.com/table/v8/docs/guide/tables)
   */
  initialState: TableState<TFeatures>
  /**
   * A read-only reference to the table's current options.
   * @link [API Docs](https://tanstack.com/table/v8/docs/api/core/table#options)
   * @link [Guide](https://tanstack.com/table/v8/docs/guide/tables)
   */
  options: TableOptions<TFeatures, TData>
}

export interface Table_Table<
  TFeatures extends TableFeatures,
  TData extends RowData,
> extends Table_CoreProperties<TFeatures, TData> {
  _queue: (cb: () => void) => void
  /**
   * Returns the core row model before any processing has been applied.
   * @link [API Docs](https://tanstack.com/table/v8/docs/api/core/table#getcorerowmodel)
   * @link [Guide](https://tanstack.com/table/v8/docs/guide/tables)
   */
  getCoreRowModel: () => RowModel<TFeatures, TData>
  /**
   * Returns the final model after all processing from other used features has been applied. This is the row model that is most commonly used for rendering.
   * @link [API Docs](https://tanstack.com/table/v8/docs/api/core/table#getrowmodel)
   * @link [Guide](https://tanstack.com/table/v8/docs/guide/tables)
   */
  getRowModel: () => RowModel<TFeatures, TData>
  /**
   * Call this function to get the table's current state. It's recommended to use this function and its state, especially when managing the table state manually. It is the exact same state used internally by the table for every feature and function it provides.
   * @link [API Docs](https://tanstack.com/table/v8/docs/api/core/table#getstate)
   * @link [Guide](https://tanstack.com/table/v8/docs/guide/tables)
   */
  getState: () => TableState<TFeatures>
  /**
   * Call this function to reset the table state to the initial state.
   * @link [API Docs](https://tanstack.com/table/v8/docs/api/core/table#reset)
   * @link [Guide](https://tanstack.com/table/v8/docs/guide/tables)
   */
  reset: () => void
  /**
   * This function can be used to update the table options.
   * @link [API Docs](https://tanstack.com/table/v8/docs/api/core/table#setoptions)
   * @link [Guide](https://tanstack.com/table/v8/docs/guide/tables)
   */
  setOptions: (newOptions: Updater<TableOptions<TFeatures, TData>>) => void
  /**
   * Call this function to update the table state.
   * @link [API Docs](https://tanstack.com/table/v8/docs/api/core/table#setstate)
   * @link [Guide](https://tanstack.com/table/v8/docs/guide/tables)
   */
  setState: (updater: Updater<TableState<TFeatures>>) => void
}
