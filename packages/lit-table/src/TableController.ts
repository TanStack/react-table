import type {
  RowData,
  Table,
  TableFeatures,
  TableOptions,
  TableState,
  Updater,
} from '@tanstack/table-core'
import {
  constructTable,
  coreFeatures,
  getInitialTableState,
  isFunction,
} from '@tanstack/table-core'
import type { ReactiveController, ReactiveControllerHost } from 'lit'

export class TableController<
  TFeatures extends TableFeatures,
  TData extends RowData,
> implements ReactiveController
{
  host: ReactiveControllerHost

  private _features: TableFeatures | null = null
  private _state: TableState<TFeatures> | null = null
  private _table: Table<TFeatures, TData> | null = null

  constructor(host: ReactiveControllerHost) {
    ;(this.host = host).addController(this)
  }

  public table(
    tableOptions: TableOptions<TFeatures, TData>,
  ): Table<TFeatures, TData> {
    if (!this._table) {
      this._features = { ...coreFeatures, ...tableOptions._features }
      this._state = getInitialTableState(
        this._features,
        tableOptions.initialState,
      )

      const initialOptions: TableOptions<TFeatures, TData> = {
        ...tableOptions,
        _features: this._features,
      }

      this._table = constructTable(initialOptions)
    }

    this._table.setOptions((prev) => ({
      ...prev,
      state: { ...this._state, ...tableOptions.state },
      data: tableOptions.data,
      columns: tableOptions.columns,
      onStateChange: (updater: Updater<TableState<TFeatures>>) => {
        this._state = isFunction(updater) ? updater(this._state!) : updater
        this.host.requestUpdate()
        tableOptions.onStateChange?.(updater)
      },
    }))

    return this._table
  }

  hostDisconnected() {}
}
