import {
  ChangeDetectionStrategy,
  Component,
  computed,
  signal,
} from '@angular/core'
import {
  FlexRenderDirective,
  columnOrderingFeature,
  columnVisibilityFeature,
  injectTable,
  tableFeatures,
} from '@tanstack/angular-table'
import { faker } from '@faker-js/faker'
import { makeData } from './makeData'
import type { Person } from './makeData'
import type {
  ColumnDef,
  ColumnOrderState,
  ColumnVisibilityState,
} from '@tanstack/angular-table'

const defaultColumns: Array<ColumnDef<typeof _features, Person>> = [
  {
    header: 'Name',
    footer: (props) => props.column.id,
    columns: [
      {
        accessorKey: 'firstName',
        cell: (info) => info.getValue(),
        footer: (props) => props.column.id,
      },
      {
        accessorFn: (row) => row.lastName,
        id: 'lastName',
        cell: (info) => info.getValue(),
        header: () => 'Last Name',
        footer: (props) => props.column.id,
      },
    ],
  },
  {
    header: 'Info',
    footer: (props) => props.column.id,
    columns: [
      {
        accessorKey: 'age',
        header: () => 'Age',
        footer: (props) => props.column.id,
      },
      {
        header: 'More Info',
        columns: [
          {
            accessorKey: 'visits',
            header: () => 'Visits',
            footer: (props) => props.column.id,
          },
          {
            accessorKey: 'status',
            header: 'Status',
            footer: (props) => props.column.id,
          },
          {
            accessorKey: 'progress',
            header: 'Profile Progress',
            footer: (props) => props.column.id,
          },
        ],
      },
    ],
  },
]

const _features = tableFeatures({
  columnVisibilityFeature,
  columnOrderingFeature,
})

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FlexRenderDirective],
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  readonly data = signal<Array<Person>>(makeData(20))
  readonly columnVisibility = signal<ColumnVisibilityState>({})
  readonly columnOrder = signal<ColumnOrderState>([])

  readonly table = injectTable(() => ({
    _features,
    data: this.data(),
    columns: defaultColumns,
    state: {
      columnOrder: this.columnOrder(),
      columnVisibility: this.columnVisibility(),
    },
    enableExperimentalReactivity: true,
    onColumnVisibilityChange: (updaterOrValue) => {
      typeof updaterOrValue === 'function'
        ? this.columnVisibility.update(updaterOrValue)
        : this.columnVisibility.set(updaterOrValue)
    },
    onColumnOrderChange: (updaterOrValue) => {
      typeof updaterOrValue === 'function'
        ? this.columnOrder.update(updaterOrValue)
        : this.columnOrder.set(updaterOrValue)
    },
    debugTable: true,
    debugHeaders: true,
    debugColumns: true,
  }))

  readonly stringifiedColumnOrdering = computed(() => {
    return JSON.stringify(this.table.getState().columnOrder)
  })

  randomizeColumns() {
    this.table.setColumnOrder(
      faker.helpers.shuffle(this.table.getAllLeafColumns().map((d) => d.id)),
    )
  }

  rerender() {
    this.data.set([...makeData(20)])
  }
}
