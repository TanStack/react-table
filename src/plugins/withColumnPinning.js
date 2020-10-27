import React from 'react'

import {
  useGetLatest,
  functionalUpdate,
  getFirstDefined,
  buildHeaderGroups,
  recurseHeaderForSpans,
  flattenBy,
} from '../utils'

import {
  withColumnPinning as name,
  withColumnVisibility,
  withColumnOrder,
} from '../Constants'

export const withColumnPinning = {
  name,
  after: [withColumnVisibility, withColumnOrder],
  plugs: {
    useReduceOptions,
    useInstanceAfterState,
    decorateColumn,
    useReduceLeafColumns,
    useReduceHeaderGroups,
    useReduceFooterGroups,
    useReduceFlatHeaders,
  },
}

function useReduceOptions(options) {
  return {
    ...options,
    initialState: {
      ...options.initialState,
      columnPinning: {
        left: [],
        right: [],
        ...options.initialState.columnPinning,
      },
    },
  }
}

function useInstanceAfterState(instance) {
  const { setState } = instance

  instance.resetColumnPinning = React.useCallback(
    () =>
      setState(
        old => ({
          ...old,
          columnPinning: instance.initialState.columnPinning || [],
        }),
        {
          type: 'resetColumnPinning',
        }
      ),
    [instance.initialState.columnPinning, setState]
  )

  instance.setColumnPinning = React.useCallback(
    columnPinning =>
      setState(
        old => ({
          ...old,
          columnPinning: functionalUpdate(columnPinning, old.columnPinning),
        }),
        {
          type: 'setColumnPinning',
        }
      ),
    [setState]
  )

  instance.toggleColumnPinning = React.useCallback(
    (columnId, side, value) => {
      setState(
        old => {
          const isIncluded = old.columnPinning[side].includes(columnId)

          value = typeof value !== 'undefined' ? value : !isIncluded

          return {
            ...old,
            columnPinning: {
              ...old.columnPinning,
              [side]: value
                ? [...old.columnPinning[side], columnId]
                : old.columnPinning[side].filter(d => d !== columnId),
            },
          }
        },
        {
          type: 'setColumnPinning',
        }
      )
    },
    [setState]
  )

  instance.getColumnCanPin = React.useCallback(
    columnId => {
      const column = instance.leafColumns.find(d => d.id === columnId)

      if (!column) {
        return false
      }

      return getFirstDefined(
        instance.options.disablePinning ? false : undefined,
        column.disablePinning ? false : undefined,
        column.defaultCanPin,
        !!column.accessor
      )
    },
    [instance.leafColumns, instance.options.disablePinning]
  )

  instance.getColumnIsPinned = React.useCallback(
    columnId =>
      instance.state.columnPinning.left.includes(columnId)
        ? 'left'
        : instance.state.columnPinning.right.includes(columnId)
        ? 'right'
        : false,
    [instance.state.columnPinning.left, instance.state.columnPinning.right]
  )

  instance.getColumnPinnedIndex = React.useCallback(
    columnId => {
      const side = instance.getColumnIsPinned()
      return instance.state.columnPinning[side].indexOf(columnId)
    },
    [instance]
  )
}

function decorateColumn(column, { instance }) {
  column.getCanPin = () => instance.getColumnCanPin(column.id)
  column.getPinnedIndex = () => instance.getColumnPinnedIndex(column.id)
  column.getIsPinned = () => instance.getColumnIsPinned(column.id)
  column.togglePinning = (side, value) =>
    instance.toggleColumnPinning(column.id, side, value)
}

function useReduceLeafColumns(leafColumns, { instance }) {
  const {
    state: {
      columnPinning: { left, right },
    },
  } = instance

  console.log(instance)

  instance.centerLeafColumns = React.useMemo(() => {
    if (left.length || right.length) {
      return leafColumns.filter(
        column => !left.includes(column.id) && !right.includes(column.id)
      )
    }
    return leafColumns
  }, [leafColumns, left, right])

  instance.leftLeafColumns = React.useMemo(() => {
    return left
      .map(columnId => leafColumns.find(d => d.id === columnId))
      .filter(Boolean)
  }, [leafColumns, left])

  instance.rightLeafColumns = React.useMemo(() => {
    return right
      .map(columnId => leafColumns.find(d => d.id === columnId))
      .filter(Boolean)
  }, [leafColumns, right])

  return leafColumns
}

function useReduceHeaderGroups(headerGroups, { instance }) {
  const {
    columns,
    centerLeafColumns,
    leftLeafColumns,
    rightLeafColumns,
  } = instance

  instance.centerHeaderGroups = React.useMemo(
    () => buildHeaderGroups(columns, centerLeafColumns, { instance }),
    [centerLeafColumns, columns, instance]
  )

  instance.leftHeaderGroups = React.useMemo(
    () => buildHeaderGroups(columns, leftLeafColumns, { instance }),
    [columns, instance, leftLeafColumns]
  )

  instance.rightHeaderGroups = React.useMemo(
    () => buildHeaderGroups(columns, rightLeafColumns, { instance }),
    [columns, instance, rightLeafColumns]
  )

  instance.centerHeaderGroups[0].headers.forEach(header =>
    recurseHeaderForSpans(header)
  )
  instance.leftHeaderGroups[0].headers.forEach(header =>
    recurseHeaderForSpans(header)
  )
  instance.rightHeaderGroups[0].headers.forEach(header =>
    recurseHeaderForSpans(header)
  )

  return headerGroups
}

function useReduceFooterGroups(headerGroups, { instance }) {
  const { centerHeaderGroups, leftHeaderGroups, rightHeaderGroups } = instance

  instance.centerHeaderGroups = React.useMemo(
    () => [...centerHeaderGroups].reverse(),
    [centerHeaderGroups]
  )

  instance.leftHeaderGroups = React.useMemo(
    () => [...leftHeaderGroups].reverse(),
    [leftHeaderGroups]
  )

  instance.rightHeaderGroups = React.useMemo(
    () => [...rightHeaderGroups].reverse(),
    [rightHeaderGroups]
  )

  return headerGroups
}

function useReduceFlatHeaders(_, { instance }) {
  const { centerHeaderGroups, leftHeaderGroups, rightHeaderGroups } = instance

  return flattenBy(
    [...centerHeaderGroups, ...leftHeaderGroups, ...rightHeaderGroups],
    'headers',
    true
  )
}
