import React from 'react'

import {
  useGetLatest,
  useLazyMemo,
  useMountedLayoutEffect,
  getRowIsSelected,
  composeReducer,
  functionalUpdate,
} from '../utils'

import {
  withSelection as name,
  withColumnVisibility,
  withColumnFilters,
  withGlobalFilter,
  withGrouping,
  withSorting,
  withExpanding,
  withPagination,
} from '../Constants'

export const withSelection = {
  name,
  after: [
    withColumnVisibility,
    withColumnFilters,
    withGlobalFilter,
    withGrouping,
    withSorting,
    withExpanding,
    withPagination,
  ],
  useReduceOptions,
  useInstanceAfterState,
  useReduceLeafColumns,
  decorateRow,
}

function useReduceOptions(options) {
  return {
    selectSubRows: true,
    selectGroupingRows: false,
    manualRowSelectedKey: 'isSelected',
    isAdditiveSelectEvent: e => e.metaKey,
    isInclusiveSelectEvent: e => e.shiftKey,
    ...options,
    initialState: {
      selection: {},
      ...options.initialState,
    },
  }
}

function useInstanceAfterState(instance) {
  const { setState } = instance

  const getInstance = useGetLatest(instance)

  const selectionResetDeps = [instance.options.data]
  React.useMemo(() => {
    if (getInstance().options.autoResetSelection) {
      getInstance().state.selection = getInstance().getInitialState().selection
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, selectionResetDeps)

  useMountedLayoutEffect(() => {
    if (getInstance().options.autoResetSelection) {
      instance.resetSelection()
    }
  }, selectionResetDeps)

  instance.getSelectedFlatRows = React.useCallback(() => {
    const { flatRows } = getInstance()

    return flatRows.filter(row => !row.getIsGrouped() && row.getIsSelected())
  }, [getInstance])

  instance.resetSelectedRows = React.useCallback(
    () =>
      setState(
        old => ({
          ...old,
          selection: getInstance().getInitialState().selection || {},
        }),
        {
          type: 'resetSelectedRows',
        }
      ),
    [getInstance, setState]
  )

  instance.setSelectedRows = React.useCallback(
    updater =>
      setState(
        old => ({
          ...old,
          selection: functionalUpdate(updater, old.selection),
        }),
        {
          type: 'resetSelectedRows',
        }
      ),
    [setState]
  )

  instance.toggleAllRowsSelected = React.useCallback(
    value =>
      setState(
        old => {
          const {
            getIsAllRowsSelected,
            rowsById,
            nonGroupedRowsById = rowsById,
          } = getInstance()

          value = typeof value !== 'undefined' ? value : !getIsAllRowsSelected()

          // Only remove/add the rows that are visible on the screen
          //  Leave all the other rows that are selected alone.
          const selection = Object.assign({}, old.selection)

          if (value) {
            Object.keys(nonGroupedRowsById).forEach(rowId => {
              selection[rowId] = true
            })
          } else {
            Object.keys(nonGroupedRowsById).forEach(rowId => {
              delete selection[rowId]
            })
          }

          return [
            {
              ...old,
              selection,
            },
            {
              value,
            },
          ]
        },
        {
          type: 'toggleAllRowsSelected',
        }
      ),
    [getInstance, setState]
  )

  instance.toggleAllPageRowsSelected = React.useCallback(
    value =>
      setState(
        old => {
          const {
            getIsAllPageRowsSelected,
            rowsById,
            getSubRows,
            page,
            selectSubRows = true,
          } = getInstance()

          const selectAll =
            typeof value !== 'undefined' ? value : !getIsAllPageRowsSelected()

          const selection = { ...old.selection }

          const handleRowById = id => {
            const row = rowsById[id]

            if (!row.isGrouped) {
              if (selectAll) {
                selection[id] = true
              } else {
                delete selection[id]
              }
            }

            if (selectSubRows && getSubRows(row)) {
              return getSubRows(row).forEach(row => handleRowById(row.id))
            }
          }

          page.forEach(row => handleRowById(row.id))

          return [
            {
              ...old,
              selection,
            },
            {
              value,
            },
          ]
        },
        {
          type: 'toggleAllPageRowsSelected',
        }
      ),
    [getInstance, setState]
  )

  instance.toggleRowSelected = React.useCallback(
    (id, value) =>
      setState(
        old => {
          const {
            rowsById,
            options: { selectSubRows, selectGroupingRows },
          } = getInstance()

          // Join the ids of deep rows
          // to make a key, then manage all of the keys
          // in a flat object
          const row = rowsById[id]
          const isSelected = row.getIsSelected()
          value = typeof value !== 'undefined' ? value : !isSelected

          if (isSelected === value) {
            return old
          }

          const selectedRowIds = { ...old.selection }

          selectRowById(selectedRowIds, id, value, {
            rowsById,
            selectGroupingRows,
            selectSubRows,
          })

          return [
            {
              ...old,
              selection: selectedRowIds,
            },
            {
              value,
            },
          ]
        },
        {
          type: 'toggleRowSelected',
        }
      ),
    [getInstance, setState]
  )

  instance.addSelectionRange = React.useCallback(
    rowId => {
      getInstance().setSelectedRows(old => {
        const {
          rows,
          rowsById,
          options: { selectGroupingRows, selectSubRows },
        } = getInstance()

        const findSelectedRow = rows => {
          let found
          rows.find(d => {
            if (d.getIsSelected()) {
              found = d
              return true
            }
            const subFound = findSelectedRow(d.subRows || [])
            if (subFound) {
              found = subFound
              return true
            }
            return false
          })
          return found
        }

        const firstRow = findSelectedRow(rows) || rows[0]
        const lastRow = rowsById[rowId]

        let include = false
        const selectedRowIds = {}

        const addRow = row => {
          selectRowById(selectedRowIds, row.id, true, {
            rowsById,
            selectGroupingRows,
            selectSubRows,
          })
        }

        getInstance().rows.forEach(row => {
          const isFirstRow = row.id === firstRow.id
          const isLastRow = row.id === lastRow.id

          if (isFirstRow || isLastRow) {
            if (!include) {
              include = true
            } else if (include) {
              addRow(row)
              include = false
            }
          }

          if (include) {
            addRow(row)
          }
        })

        return selectedRowIds
      })
    },
    [getInstance]
  )

  instance.getIsAllRowsSelected = useLazyMemo(() => {
    let isAllRowsSelected = Boolean(
      Object.keys(instance.nonGroupedRowsById).length &&
        Object.keys(instance.state.selection).length
    )
    if (isAllRowsSelected) {
      if (
        Object.keys(instance.nonGroupedRowsById).some(
          id => !instance.state.selection[id]
        )
      ) {
        isAllRowsSelected = false
      }
    }

    return isAllRowsSelected
  }, [instance.nonGroupedRowsById, instance.state.selection])

  instance.getIsAllPageRowsSelected = useLazyMemo(() => {
    let isAllPageRowsSelected = instance.getIsAllPageRowsSelected()
    if (!isAllPageRowsSelected) {
      if (
        instance.page?.length &&
        instance.page.some(({ id }) => !instance.selectedRowIds[id])
      ) {
        isAllPageRowsSelected = false
      }
    }

    return isAllPageRowsSelected
  }, [instance.page, instance.state.selection])

  instance.getIsSomeRowsSelected = useLazyMemo(() => {
    return (
      !getInstance().getIsAllRowsSelected() &&
      Object.keys(instance.state.selection).length
    )
  }, [instance.nonGroupedRowsById, instance.state.selection])

  instance.getIsSomePageRowsSelected = useLazyMemo(() => {
    return (
      !getInstance().getIsPageAllRowsSelected() &&
      instance.page?.length &&
      instance.page.some(({ id }) => instance.selectRowIds[id])
    )
  }, [instance.page, instance.state.selection])

  instance.getToggleAllRowsSelectedProps = props => {
    const isSomeRowsSelected = getInstance().getIsSomeRowsSelected()
    const isAllRowsSelected = getInstance().getIsAllRowsSelected()

    return {
      onChange: e => {
        getInstance().toggleAllRowsSelected(e.target.checked)
      },
      checked: isAllRowsSelected,
      title: 'Toggle All Rows Selected',
      indeterminate: isSomeRowsSelected,
      ...props,
    }
  }

  instance.getToggleAllPageRowsSelectedProps = props => {
    const isSomePageRowsSelected = getInstance().getIsSomePageRowsSelected()
    const isAllPageRowsSelected = getInstance().getIsAllPageRowsSelected()

    return {
      onChange: e => {
        getInstance().toggleAllPageRowsSelected(e.target.checked)
      },
      checked: isAllPageRowsSelected,
      title: 'Toggle All Current Page Rows Selected',
      indeterminate: isSomePageRowsSelected,
      ...props,
    }
  }
}

function useReduceLeafColumns(orderedColumns) {
  return React.useMemo(() => {
    return [
      orderedColumns.find(d => d.isSelectionColumn),
      ...orderedColumns.filter(d => d && !d.isSelectionColumn),
    ].filter(Boolean)
  }, [orderedColumns])
}

useReduceLeafColumns.after = ['withGrouping', 'withExpanding']

function decorateRow(row, { getInstance }) {
  row.getIsSelected = () =>
    getInstance().options.selectSubRows
      ? getRowIsSelected(row, getInstance().state.selection)
      : !!getInstance().state.selection[row.id]

  row.getIsSomeSelected = () => row.getIsSelected() === null

  row.toggleSelected = set => getInstance().toggleRowSelected(row.id, set)

  row.getToggleRowSelectedProps = props => {
    const {
      options: { manualRowSelectedKey },
    } = getInstance()

    let checked = false

    if (row.original?.[manualRowSelectedKey]) {
      checked = true
    } else {
      checked = row.getIsSelected()
    }

    return {
      onClick: e => e.stopPropagation(),
      onChange: e => row.toggleSelected(e.target.checked),
      checked,
      title: 'Toggle Row Selected',
      indeterminate: row.getIsSomeSelected(),
      ...props,
    }
  }

  row.getRowProps = composeReducer(
    row.getRowProps,
    ({ onClick, ...props }) => ({
      ...props,
      onClick: e => {
        if (getInstance().options.isAdditiveSelectEvent(e)) {
          row.toggleSelected()
        } else if (getInstance().options.isInclusiveSelectEvent(e)) {
          getInstance().addSelectionRange(row.id)
        } else {
          getInstance().setSelectedRows({})
          row.toggleSelected()
        }

        if (onClick) onClick(e)
      },
    })
  )
}

const selectRowById = (
  selectedRowIds,
  id,
  value,
  { rowsById, selectGroupingRows, selectSubRows }
) => {
  const row = rowsById[id]

  if (!row.getIsGrouped() || (row.getIsGrouped() && selectGroupingRows)) {
    if (value) {
      selectedRowIds[id] = true
    } else {
      delete selectedRowIds[id]
    }
  }

  if (selectSubRows && row.subRows) {
    return row.subRows.forEach(row =>
      selectRowById(selectedRowIds, row.id, value, {
        rowsById,
        selectGroupingRows,
        selectSubRows,
      })
    )
  }
}
