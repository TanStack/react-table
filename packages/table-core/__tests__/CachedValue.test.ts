import { ColumnDef, getCoreRowModel } from '../src'
import { createColumnHelper } from '../src/columnHelper'
import { createTable } from '../src/core/table'
import { getGroupedRowModel } from '../src/utils/getGroupedRowModel'
import { makeData, Person } from './makeTestData'

type personKeys = keyof Person
type PersonColumn = ColumnDef<Person, string | number | Person[] | undefined>
const columnHelper = createColumnHelper<Person>()

describe('#CachedValue', () => {
  it('cached value invalidated after changing accessorFn', () => {
    const data = makeData(1)

    const targetColumnId = 'name'

    const table = createTable<Person>({
      data,
      columns: [
        columnHelper.accessor(() => 'hoge', {
          id: targetColumnId,
        }),
      ],
      onStateChange() {},
      renderFallbackValue: '',
      state: {},
      getCoreRowModel: getCoreRowModel(),
      getGroupedRowModel: getGroupedRowModel(),
    })

    const row = table.getCoreRowModel().rows[0]
    expect(row.getValue(targetColumnId)).toBe('hoge')

    let execCounter = 0
    table.setOptions(old => {
      return {
        ...old,
        columns: [
          columnHelper.accessor(
            () => {
              execCounter = execCounter + 1
              return 'fuga'
            },
            {
              id: targetColumnId,
            }
          ),
        ],
      }
    })

    expect(row.getValue(targetColumnId)).toBe('fuga')
    row.getValue(targetColumnId)
    expect(execCounter).toBe(1)
  })
})
