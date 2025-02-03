export * from '@tanstack/table-core'

<<<<<<< HEAD
export * from './flexRender'
export * from './TableController'
=======
export function flexRender<TProps>(
  Comp: ((props: TProps) => string) | string | TemplateResult | undefined,
  props: TProps
): TemplateResult | string | null {
  if (!Comp) return null

  if (typeof Comp === 'function') {
    return Comp(props)
  }

  return Comp
}

export class TableController<TData extends RowData>
  implements ReactiveController
{
  host: ReactiveControllerHost

  private tableInstance: Table<TData> | null = null

  private _tableState: TableState | null = null

  constructor(host: ReactiveControllerHost) {
    ;(this.host = host).addController(this)
  }

  public table(options: TableOptions<TData>) {
    if (!this.tableInstance) {
      const resolvedOptions: TableOptionsResolved<TData> = {
        state: {},
        onStateChange: () => {}, // noop
        renderFallbackValue: null,
        ...options,
      }

      this.tableInstance = createTable(resolvedOptions)
      this._tableState = {
        ...this.tableInstance.initialState,
        ...options.state,
      }
    }

    this.tableInstance.setOptions(prev => ({
      ...prev,
      state: { ...this._tableState, ...options.state },
      data: options.data,
      columns: options.columns,
      onStateChange: (updater: any) => {
        this._tableState = updater(this._tableState)
        this.host.requestUpdate()
        options.onStateChange?.(updater)
      },
    }))

    return this.tableInstance
  }

  hostDisconnected() {}
}
>>>>>>> origin/main
