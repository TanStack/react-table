import { describe, expect, test, vi } from 'vitest'
import {
  Component,
  effect,
  input,
  isSignal,
  signal,
  untracked,
} from '@angular/core'
import { TestBed } from '@angular/core/testing'
import {
  ColumnDef,
  createCoreRowModel,
  createPaginatedRowModel,
  stockFeatures,
} from '@tanstack/table-core'
import { injectTable } from '../src/injectTable'
import {
  experimentalReactivity_testShouldBeComputedProperty,
  setFixtureSignalInputs,
  testShouldBeComputedProperty,
} from './test-utils'
import { type PaginationState, RowModel } from '../src'

describe('injectTable', () => {
  test('should render with required signal inputs', () => {
    @Component({
      selector: 'app-fake',
      template: ``,
      standalone: true,
    })
    class FakeComponent {
      data = input.required<Array<any>>()

      table = injectTable(() => ({
        data: this.data(),
        _features: stockFeatures,
        columns: [],
      }))
    }

    const fixture = TestBed.createComponent(FakeComponent)
    setFixtureSignalInputs(fixture, {
      data: [],
    })

    fixture.detectChanges()
  })

  describe('Proxy table', () => {
    type Data = { id: string; title: string }
    const data = signal<Array<Data>>([{ id: '1', title: 'Title' }])
    const columns: Array<ColumnDef<typeof stockFeatures, Data>> = [
      { id: 'id', header: 'Id', cell: (context) => context.getValue() },
      { id: 'title', header: 'Title', cell: (context) => context.getValue() },
    ]
    const table = injectTable(() => ({
      data: data(),
      _features: stockFeatures,
      columns: columns,
      getRowId: (row) => row.id,
    }))
    const tablePropertyKeys = Object.keys(table())

    test('table must be a signal', () => {
      expect(isSignal(table)).toEqual(true)
    })

    test('supports "in" operator', () => {
      expect('_features' in table).toBe(true)
      expect('options' in table).toBe(true)
      expect('notFound' in table).toBe(false)
    })

    test('supports "Object.keys"', () => {
      const keys = Object.keys(table())
      expect(Object.keys(table)).toEqual(keys)
    })

    test.each(
      tablePropertyKeys.map((property) => [
        property,
        testShouldBeComputedProperty(untracked(table), property),
      ]),
    )('property (%s) is computed -> (%s)', (name, expected) => {
      const tableProperty = table[name as keyof typeof table]
      expect(isSignal(tableProperty)).toEqual(expected)
    })

    test('Row model is reactive', () => {
      const coreRowModelFn =
        vi.fn<(model: RowModel<typeof stockFeatures, Data>) => void>()
      const rowModelFn =
        vi.fn<(model: RowModel<typeof stockFeatures, Data>) => void>()
      const pagination = signal<PaginationState>({
        pageSize: 5,
        pageIndex: 0,
      })
      const data = Array.from({ length: 10 }, (_, i) => ({
        id: String(i),
        title: `Title ${i}`,
      }))

      TestBed.runInInjectionContext(() => {
        const table = injectTable(() => ({
          data,
          columns: columns,
          _features: stockFeatures,
          _rowModels: {
            coreRowModel: createCoreRowModel(),
            paginatedRowModel: createPaginatedRowModel(),
          },
          getRowId: (row) => row.id,
          state: {
            pagination: pagination(),
          },
          onPaginationChange: (updater) => {
            typeof updater === 'function'
              ? pagination.update(updater)
              : pagination.set(updater)
          },
        }))

        effect(() => coreRowModelFn(table.getCoreRowModel()))
        effect(() => rowModelFn(table.getRowModel()))

        TestBed.flushEffects()

        pagination.set({ pageIndex: 0, pageSize: 3 })

        TestBed.flushEffects()
      })

      expect(coreRowModelFn).toHaveBeenCalledOnce()
      expect(coreRowModelFn.mock.calls[0]![0].rows.length).toEqual(10)

      expect(rowModelFn).toHaveBeenCalledTimes(2)
      expect(rowModelFn.mock.calls[0]![0].rows.length).toEqual(5)
      expect(rowModelFn.mock.calls[1]![0].rows.length).toEqual(3)
    })
  })
})

describe('injectTable - Experimental reactivity', () => {
  type Data = { id: string; title: string }
  const data = signal<Array<Data>>([{ id: '1', title: 'Title' }])
  const columns: Array<ColumnDef<typeof stockFeatures, Data>> = [
    { id: 'id', header: 'Id', cell: (context) => context.getValue() },
    { id: 'title', header: 'Title', cell: (context) => context.getValue() },
  ]
  const table = injectTable(() => ({
    data: data(),
    _features: { ...stockFeatures },
    columns: columns,
    getRowId: (row) => row.id,
    enableExperimentalReactivity: true,
  }))
  const tablePropertyKeys = Object.keys(table)

  describe('Proxy', () => {
    test('table must be a signal', () => {
      expect(isSignal(table)).toEqual(true)
    })

    test('supports "in" operator', () => {
      expect('_features' in table).toBe(true)
      expect('options' in table).toBe(true)
      expect('notFound' in table).toBe(false)
    })

    test('supports "Object.keys"', () => {
      const keys = Object.keys(table)
      expect(Object.keys(table)).toEqual(keys)
    })
  })

  describe('Table property reactivity', () => {
    test.each(
      tablePropertyKeys.map((property) => [
        property,
        experimentalReactivity_testShouldBeComputedProperty(table, property),
      ]),
    )('property (%s) is computed -> (%s)', (name, expected) => {
      const tableProperty = table[name as keyof typeof table]
      expect(isSignal(tableProperty)).toEqual(expected)
    })
  })

  describe('Header property reactivity', () => {
    const headers = table.getHeaderGroups()
    headers.forEach((headerGroup, index) => {
      const headerPropertyKeys = Object.keys(headerGroup)
      test.each(
        headerPropertyKeys.map((property) => [
          property,
          experimentalReactivity_testShouldBeComputedProperty(
            headerGroup,
            property,
          ),
        ]),
      )(
        `HeaderGroup ${headerGroup.id} (${index}) - property (%s) is computed -> (%s)`,
        (name, expected) => {
          const tableProperty = headerGroup[name as keyof typeof headerGroup]
          expect(isSignal(tableProperty)).toEqual(expected)
        },
      )

      const headers = headerGroup.headers
      headers.forEach((header, cellIndex) => {
        const headerPropertyKeys = Object.keys(header)
        test.each(
          headerPropertyKeys.map((property) => [
            property,
            experimentalReactivity_testShouldBeComputedProperty(
              header,
              property,
            ),
          ]),
        )(
          `HeaderGroup ${headerGroup.id} (${index}) / Header ${header.id} - property (%s) is computed -> (%s)`,
          (name, expected) => {
            const tableProperty = header[name as keyof typeof header]
            expect(isSignal(tableProperty)).toEqual(expected)
          },
        )
      })
    })
  })

  describe('Column property reactivity', () => {
    const columns = table.getAllColumns()
    columns.forEach((column, index) => {
      const columnPropertyKeys = Object.keys(column)
      test.each(
        columnPropertyKeys.map((property) => [
          property,
          experimentalReactivity_testShouldBeComputedProperty(column, property),
        ]),
      )(
        `Column ${column.id} (${index}) - property (%s) is computed -> (%s)`,
        (name, expected) => {
          const tableProperty = column[name as keyof typeof column]
          expect(isSignal(tableProperty)).toEqual(expected)
        },
      )
    })
  })

  describe('Row property reactivity', () => {
    const flatRows = table.getRowModel().flatRows
    flatRows.forEach((row, index) => {
      const rowsPropertyKeys = Object.keys(row)
      test.each(
        rowsPropertyKeys.map((property) => [
          property,
          experimentalReactivity_testShouldBeComputedProperty(row, property),
        ]),
      )(
        `Row ${row.id} (${index}) - property (%s) is computed -> (%s)`,
        (name, expected) => {
          const tableProperty = row[name as keyof typeof row]
          expect(isSignal(tableProperty)).toEqual(expected)
        },
      )

      const cells = row.getAllCells()
      cells.forEach((cell, cellIndex) => {
        const cellPropertyKeys = Object.keys(cell)
        test.each(
          cellPropertyKeys.map((property) => [
            property,
            experimentalReactivity_testShouldBeComputedProperty(cell, property),
          ]),
        )(
          `Row ${row.id} (${index}) / Cell ${cell.id} - property (%s) is computed -> (%s)`,
          (name, expected) => {
            const tableProperty = cell[name as keyof typeof cell]
            expect(isSignal(tableProperty)).toEqual(expected)
          },
        )
      })
    })
  })
})
