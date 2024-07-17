import { describe, expect, it } from 'vitest'
import {
  ColumnDef,
  createColumnHelper,
  _createTable,
  createCoreRowModel,
  RowSelection,
} from '../src'
import * as RowSelectionUtils from '../src/features/row-selection/RowSelection.utils'
import { makeData, Person } from './makeTestData'

type personKeys = keyof Person
type PersonColumn = ColumnDef<
  any,
  Person,
  string | number | Person[] | undefined
>

function generateColumns(people: Person[]): PersonColumn[] {
  const columnHelper = createColumnHelper<any, Person>()
  const person = people[0]
  return Object.keys(person).map((key) => {
    const typedKey = key as personKeys
    return columnHelper.accessor(typedKey, { id: typedKey })
  })
}

describe('RowSelection', () => {
  describe('selectRowsFn', () => {
    it('should only return rows that are selected', () => {
      const data = makeData(5)
      const columns = generateColumns(data)

      const table = _createTable<any, Person>({
        _features: { RowSelection },
        _rowModels: { Core: createCoreRowModel() },
        enableRowSelection: true,
        onStateChange() {},
        renderFallbackValue: '',
        data,
        getSubRows: (row) => row.subRows,
        state: {
          rowSelection: {
            '0': true,
            '2': true,
          },
        },
        columns,
      })
      const rowModel = table.getCoreRowModel()

      const result = RowSelectionUtils.selectRowsFn(table, rowModel)

      expect(result.rows.length).toBe(2)
      expect(result.flatRows.length).toBe(2)
      expect(result.rowsById).toHaveProperty('0')
      expect(result.rowsById).toHaveProperty('2')
    })

    it('should recurse into subRows and only return selected subRows', () => {
      const data = makeData(3, 2) // assuming 3 parent rows with 2 sub-rows each
      const columns = generateColumns(data)

      const table = _createTable<any, Person>({
        _features: { RowSelection },
        _rowModels: { Core: createCoreRowModel() },
        enableRowSelection: true,
        onStateChange() {},
        renderFallbackValue: '',
        data,
        getSubRows: (row) => row.subRows,
        state: {
          rowSelection: {
            '0': true,
            '0.0': true,
          },
        },
        columns,
      })
      const rowModel = table.getCoreRowModel()

      const result = RowSelectionUtils.selectRowsFn(table, rowModel)

      expect(result.rows[0].subRows.length).toBe(1)
      expect(result.flatRows.length).toBe(2)
      expect(result.rowsById).toHaveProperty('0')
      expect(result.rowsById).toHaveProperty('0.0')
    })

    it('should return an empty list if no rows are selected', () => {
      const data = makeData(5)
      const columns = generateColumns(data)

      const table = _createTable<any, Person>({
        _features: { RowSelection },
        _rowModels: { Core: createCoreRowModel() },
        enableRowSelection: true,
        onStateChange() {},
        renderFallbackValue: '',
        data,
        getSubRows: (row) => row.subRows,
        state: {
          rowSelection: {},
        },
        columns,
      })
      const rowModel = table.getCoreRowModel()

      const result = RowSelectionUtils.selectRowsFn(table, rowModel)

      expect(result.rows.length).toBe(0)
      expect(result.flatRows.length).toBe(0)
      expect(result.rowsById).toEqual({})
    })
  })
  describe('isRowSelected', () => {
    it('should return true if the row id exists in selection and is set to true', () => {
      const row = { id: '123', data: {} } as any
      const selection: Record<string, boolean> = {
        '123': true,
        '456': false,
      }

      const result = RowSelectionUtils.isRowSelected(row, selection)
      expect(result).toEqual(true)
    })

    it('should return false if the row id exists in selection and is set to false', () => {
      const row = { id: '456', data: {} } as any
      const selection: Record<string, boolean> = {
        '123': true,
        '456': false,
      }

      const result = RowSelectionUtils.isRowSelected(row, selection)
      expect(result).toEqual(false)
    })

    it('should return false if the row id does not exist in selection', () => {
      const row = { id: '789', data: {} } as any
      const selection: Record<string, boolean> = {
        '123': true,
        '456': false,
      }

      const result = RowSelectionUtils.isRowSelected(row, selection)
      expect(result).toEqual(false)
    })

    it('should return false if selection is an empty object', () => {
      const row = { id: '789', data: {} } as any
      const selection: Record<string, boolean> = {}

      const result = RowSelectionUtils.isRowSelected(row, selection)
      expect(result).toEqual(false)
    })
  })
  describe('isSubRowSelected', () => {
    it('should return false if there are no sub-rows', () => {
      const data = makeData(3)
      const columns = generateColumns(data)

      const table = _createTable<any, Person>({
        _features: { RowSelection },
        _rowModels: { Core: createCoreRowModel() },
        enableRowSelection: true,
        onStateChange() {},
        renderFallbackValue: '',
        data,
        state: {},
        columns,
      })

      const firstRow = table.getCoreRowModel().rows[0]

      const result = RowSelectionUtils.isSubRowSelected(
        firstRow,
        table.getState().rowSelection,
        table,
      )

      expect(result).toEqual(false)
    })

    it('should return false if no sub-rows are selected', () => {
      const data = makeData(3, 2)
      const columns = generateColumns(data)

      const table = _createTable<any, Person>({
        _features: { RowSelection },
        _rowModels: { Core: createCoreRowModel() },
        enableRowSelection: true,
        onStateChange() {},
        renderFallbackValue: '',
        data,
        getSubRows: (row) => row.subRows,
        state: {
          rowSelection: {},
        },
        columns,
      })

      const firstRow = table.getCoreRowModel().rows[0]

      const result = RowSelectionUtils.isSubRowSelected(
        firstRow,
        table.getState().rowSelection,
        table,
      )

      expect(result).toEqual(false)
    })

    it('should return some if some sub-rows are selected', () => {
      const data = makeData(3, 2)
      const columns = generateColumns(data)

      const table = _createTable<any, Person>({
        _features: { RowSelection },
        _rowModels: { Core: createCoreRowModel() },
        enableRowSelection: true,
        onStateChange() {},
        renderFallbackValue: '',
        data,
        getSubRows: (row) => row.subRows,
        state: {
          rowSelection: {
            '0.0': true,
          },
        },
        columns,
      })

      const firstRow = table.getCoreRowModel().rows[0]

      const result = RowSelectionUtils.isSubRowSelected(
        firstRow,
        table.getState().rowSelection,
        table,
      )

      expect(result).toEqual('some')
    })

    it('should return all if all sub-rows are selected', () => {
      const data = makeData(3, 2)
      const columns = generateColumns(data)

      const table = _createTable<any, Person>({
        _features: { RowSelection },
        _rowModels: { Core: createCoreRowModel() },
        enableRowSelection: true,
        onStateChange() {},
        renderFallbackValue: '',
        data,
        getSubRows: (row) => row.subRows,
        state: {
          rowSelection: {
            '0.0': true,
            '0.1': true,
          },
        },
        columns,
      })

      const firstRow = table.getCoreRowModel().rows[0]

      const result = RowSelectionUtils.isSubRowSelected(
        firstRow,
        table.getState().rowSelection,
        table,
      )

      expect(result).toEqual('all')
    })
    it('should return all if all selectable sub-rows are selected', () => {
      const data = makeData(3, 2)
      const columns = generateColumns(data)

      const table = _createTable<any, Person>({
        _features: { RowSelection },
        _rowModels: { Core: createCoreRowModel() },
        enableRowSelection: (row) => row.index === 0, // only first row is selectable (of 2 sub-rows)
        onStateChange() {},
        renderFallbackValue: '',
        data,
        getSubRows: (row) => row.subRows,
        state: {
          rowSelection: {
            '0.0': true, // first sub-row
          },
        },
        columns,
      })

      const firstRow = table.getCoreRowModel().rows[0]

      const result = RowSelectionUtils.isSubRowSelected(
        firstRow,
        table.getState().rowSelection,
        table,
      )

      expect(result).toEqual('all')
    })
    it('should return some when some nested sub-rows are selected', () => {
      const data = makeData(3, 2, 2)
      const columns = generateColumns(data)

      const table = _createTable<any, Person>({
        _features: { RowSelection },
        _rowModels: { Core: createCoreRowModel() },
        enableRowSelection: true,
        onStateChange() {},
        renderFallbackValue: '',
        data,
        getSubRows: (row) => row.subRows,
        state: {
          rowSelection: {
            '0.0.0': true, // first nested sub-row
          },
        },
        columns,
      })

      const firstRow = table.getCoreRowModel().rows[0]

      const result = RowSelectionUtils.isSubRowSelected(
        firstRow,
        table.getState().rowSelection,
        table,
      )

      expect(result).toEqual('some')
    })
  })
})
