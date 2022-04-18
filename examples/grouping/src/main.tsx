import React from 'react'
import ReactDOM from 'react-dom'

import './index.css'

import {
  createTable,
  columnFilterRowsFn,
  paginateRowsFn,
  useTable,
  GroupingState,
  groupRowsFn,
  expandRowsFn,
} from '@tanstack/react-table'
import { makeData, Person } from './makeData'

let table = createTable<{ Row: Person }>()

function App() {
  const rerender = React.useReducer(() => ({}), {})[1]

  const columns = React.useMemo(
    () =>
      table.createColumns([
        table.createGroup({
          header: 'Name',
          footer: props => props.column.id,
          columns: [
            table.createDataColumn('firstName', {
              cell: info => info.value,
              footer: props => props.column.id,
            }),
            table.createDataColumn(row => row.lastName, {
              id: 'lastName',
              cell: info => info.value,
              header: () => <span>Last Name</span>,
              footer: props => props.column.id,
            }),
          ],
        }),
        table.createGroup({
          header: 'Info',
          footer: props => props.column.id,
          columns: [
            table.createDataColumn('age', {
              header: () => 'Age',
              footer: props => props.column.id,
            }),
            table.createGroup({
              header: 'More Info',
              columns: [
                table.createDataColumn('visits', {
                  header: () => <span>Visits</span>,
                  footer: props => props.column.id,
                }),
                table.createDataColumn('status', {
                  header: 'Status',
                  footer: props => props.column.id,
                }),
                table.createDataColumn('progress', {
                  header: 'Profile Progress',
                  footer: props => props.column.id,
                }),
              ],
            }),
          ],
        }),
      ]),
    []
  )

  const [data, setData] = React.useState(() => makeData(100000))
  const refreshData = () => setData(() => makeData(100000))

  const [grouping, setGrouping] = React.useState<GroupingState>([])

  const instance = useTable(table, {
    data,
    columns,
    state: {
      grouping,
    },
    onGroupingChange: setGrouping,
    groupRowsFn: groupRowsFn,
    expandRowsFn: expandRowsFn,
    paginateRowsFn: paginateRowsFn,
    columnFilterRowsFn: columnFilterRowsFn,
    debugTable: true,
  })

  return (
    <div className="p-2">
      <div className="h-2" />
      <table {...instance.getTableProps({})}>
        <thead>
          {instance.getHeaderGroups().map(headerGroup => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map(header => {
                return (
                  <th {...header.getHeaderProps()}>
                    {header.isPlaceholder ? null : (
                      <div>
                        {header.column.getCanGroup() ? (
                          // If the header can be grouped, let's add a toggle
                          <span
                            {...header.column.getToggleGroupingProps(props => ({
                              ...props,
                              style: {
                                cursor: 'pointer',
                              },
                            }))}
                          >
                            {header.column.getIsGrouped()
                              ? `🛑(${header.column.getGroupedIndex()}) `
                              : `👊 `}
                          </span>
                        ) : null}{' '}
                        {header.renderHeader()}
                      </div>
                    )}
                  </th>
                )
              })}
            </tr>
          ))}
        </thead>
        <tbody {...instance.getTableBodyProps()}>
          {instance.getRowModel().rows.map(row => {
            return (
              <tr {...row.getRowProps()}>
                {row.getVisibleCells().map(cell => {
                  return (
                    <td
                      {...cell.getCellProps(props => ({
                        ...props,
                        style: {
                          ...props.style,
                          background: cell.getIsGrouped()
                            ? '#0aff0082'
                            : cell.getIsAggregated()
                            ? '#ffa50078'
                            : cell.getIsPlaceholder()
                            ? '#ff000042'
                            : 'white',
                        },
                      }))}
                    >
                      {cell.getIsGrouped() ? (
                        // If it's a grouped cell, add an expander and row count
                        <>
                          <span
                            {...row.getToggleExpandedProps(props => ({
                              ...props,
                              style: {
                                ...props.style,
                                cursor: props.onClick ? 'pointer' : 'normal',
                              },
                            }))}
                          >
                            {row.getIsExpanded() ? '👇' : '👉'}{' '}
                            {cell.renderCell()} ({row.subRows.length})
                          </span>
                        </>
                      ) : cell.getIsAggregated() ? (
                        // If the cell is aggregated, use the Aggregated
                        // renderer for cell
                        cell.renderAggregatedCell()
                      ) : cell.getIsPlaceholder() ? null : ( // For cells with repeated values, render null
                        // Otherwise, just render the regular cell
                        cell.renderCell()
                      )}
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
      <div className="h-2" />
      <div className="flex items-center gap-2">
        <button
          className="border rounded p-1"
          onClick={() => instance.setPageIndex(0)}
          disabled={!instance.getCanPreviousPage()}
        >
          {'<<'}
        </button>
        <button
          className="border rounded p-1"
          onClick={() => instance.previousPage()}
          disabled={!instance.getCanPreviousPage()}
        >
          {'<'}
        </button>
        <button
          className="border rounded p-1"
          onClick={() => instance.nextPage()}
          disabled={!instance.getCanNextPage()}
        >
          {'>'}
        </button>
        <button
          className="border rounded p-1"
          onClick={() => instance.setPageIndex(instance.getPageCount() - 1)}
          disabled={!instance.getCanNextPage()}
        >
          {'>>'}
        </button>
        <span className="flex items-center gap-1">
          <div>Page</div>
          <strong>
            {instance.getState().pagination.pageIndex + 1} of{' '}
            {instance.getPageCount()}
          </strong>
        </span>
        <span className="flex items-center gap-1">
          | Go to page:
          <input
            type="number"
            defaultValue={instance.getState().pagination.pageIndex + 1}
            onChange={e => {
              const page = e.target.value ? Number(e.target.value) - 1 : 0
              instance.setPageIndex(page)
            }}
            className="border p-1 rounded w-16"
          />
        </span>
        <select
          value={instance.getState().pagination.pageSize}
          onChange={e => {
            instance.setPageSize(Number(e.target.value))
          }}
        >
          {[10, 20, 30, 40, 50].map(pageSize => (
            <option key={pageSize} value={pageSize}>
              Show {pageSize}
            </option>
          ))}
        </select>
      </div>
      <div>{instance.getRowModel().rows.length} Rows</div>
      <div>
        <button onClick={() => rerender()}>Force Rerender</button>
      </div>
      <div>
        <button onClick={() => refreshData()}>Refresh Data</button>
      </div>
      <pre>{JSON.stringify(grouping, null, 2)}</pre>
    </div>
  )
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
)
