import React from 'react'
import { render, fireEvent } from '../../../test-utils/react-testing'
import { useTable } from '../../hooks/useTable'
import { useSortBy } from '../useSortBy'

const data = [
  {
    firstName: 'tanner',
    lastName: 'linsley',
    age: 29,
    visits: 100,
    status: 'In Relationship',
    progress: 80,
  },
  {
    firstName: 'derek',
    lastName: 'perkins',
    age: 40,
    visits: 40,
    status: 'Single',
    progress: 80,
  },
  {
    firstName: 'joe',
    lastName: 'bergevin',
    age: 45,
    visits: 20,
    status: 'Complicated',
    progress: 10,
  },
]

const defaultColumn = {
  Cell: ({ value, column: { id } }) => `${id}: ${value}`,
}

function Table({ columns, data, initialState }) {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable(
    {
      columns,
      data,
      defaultColumn,
      initialState: initialState || {},
    },
    useSortBy
  )

  return (
    <table {...getTableProps()}>
      <thead>
        {headerGroups.map(headerGroup => (
          <tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map(column => (
              // Add the sorting props to control sorting. For this example
              // we can add them into the header props
              <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                {column.render('Header')}
                {/* Add a sort direction indicator */}
                {column.isSorted
                  ? (column.isSortedDesc ? ' 🔽' : ' 🔼') + column.sortedIndex
                  : ''}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody {...getTableBodyProps()}>
        {rows.map(
          (row, i) =>
            prepareRow(row) || (
              <tr {...row.getRowProps()}>
                {row.cells.map(cell => {
                  return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                })}
              </tr>
            )
        )}
      </tbody>
    </table>
  )
}

function App(props) {
  const columns = React.useMemo(
    () => [
      {
        Header: 'Name',
        columns: [
          {
            Header: 'First Name',
            accessor: 'firstName',
          },
          {
            Header: 'Last Name',
            accessor: 'lastName',
          },
        ],
      },
      {
        Header: 'Info',
        columns: [
          {
            Header: 'Age',
            accessor: 'age',
          },
          {
            Header: 'Visits',
            accessor: 'visits',
          },
          {
            Header: 'Status',
            accessor: 'status',
          },
          {
            Header: 'Profile Progress',
            accessor: 'progress',
          },
        ],
      },
    ],
    []
  )

  return <Table columns={columns} data={data} initialState={props.initialState} />
}

test('renders a sortable table', () => {
  const rendered = render(<App />)

  fireEvent.click(rendered.getByText('First Name'))
  rendered.getByText('First Name 🔼0')
  expect(
    rendered
      .queryAllByRole('row')
      .slice(2)
      .map(d => d.children[0].textContent)
  ).toEqual(['firstName: derek', 'firstName: joe', 'firstName: tanner'])

  fireEvent.click(rendered.getByText('First Name 🔼0'))
  rendered.getByText('First Name 🔽0')
  expect(
    rendered
      .queryAllByRole('row')
      .slice(2)
      .map(d => d.children[0].textContent)
  ).toEqual(['firstName: tanner', 'firstName: joe', 'firstName: derek'])

  fireEvent.click(rendered.getByText('Profile Progress'))
  rendered.getByText('Profile Progress 🔼0')
  expect(
    rendered
      .queryAllByRole('row')
      .slice(2)
      .map(d => d.children[0].textContent)
  ).toEqual(['firstName: joe', 'firstName: tanner', 'firstName: derek'])

  fireEvent.click(rendered.getByText('First Name'), { shiftKey: true })
  rendered.getByText('Profile Progress 🔼0')
  rendered.getByText('First Name 🔼1')
  expect(
    rendered
      .queryAllByRole('row')
      .slice(2)
      .map(d => d.children[0].textContent)
  ).toEqual(['firstName: joe', 'firstName: derek', 'firstName: tanner'])
})

test('Test initialState.sortBy: When clicking the last sortBy column, the sorted state will be replaced not toggled', () => {
  const initialState = {
    sortBy: [
      { id: 'firstName', desc: true, },
      { id: 'age', desc: true, }
    ],
  }
  const rendered = render(<App initialState={initialState} />)

  fireEvent.click(rendered.getByText('Age 🔽1'))
  rendered.getByText('Age 🔼0')
  expect(
    rendered
      .queryAllByRole('row')
      .slice(2)
      .map(d => d.children[0].textContent)
  ).toEqual(['firstName: tanner', 'firstName: derek', 'firstName: joe'])

  fireEvent.click(rendered.getByText('Age 🔼0'))
  rendered.getByText('Age 🔽0')
  expect(
    rendered
      .queryAllByRole('row')
      .slice(2)
      .map(d => d.children[0].textContent)
  ).toEqual(['firstName: joe', 'firstName: derek', 'firstName: tanner'])

  fireEvent.click(rendered.getByText('Age 🔽0'))
  rendered.getByText('Age')
})
