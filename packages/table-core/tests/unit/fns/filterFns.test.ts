import { describe, expect, it } from 'vitest'
import { generateTestRowsWithStateFromData } from '../../helpers/generateTestRows'
import {
  columnFilteringFeature,
  filterFn_equals,
  filterFn_equalsString,
  filterFn_equalsStringSensitive,
  filterFn_greaterThan,
  filterFn_greaterThanOrEqualTo,
  filterFn_includesString,
  filterFn_includesStringSensitive,
  filterFn_lessThan,
  filterFn_lessThanOrEqualTo,
  filterFn_weakEquals,
} from '../../../src'
import { getStaticTestData } from '../../fixtures/data/generateTestData'

// TODO - fix _features not being inferred correctly
const mockRows = generateTestRowsWithStateFromData(getStaticTestData(), {
  _features: {
    columnFilteringFeature,
  },
})

describe('Filter Functions', () => {
  describe('Basic Filters', () => {
    describe('filterFn_equals', () => {
      it('should match exact values', () => {
        const row = mockRows[0]!
        const columnId = 'firstName'
        const filterValue = 'John'
        const result = filterFn_equals(row as any, columnId, filterValue)
        expect(result).toBe(true)
      })
      it('should not match values with type coercion (e.g., "1" == 1)', () => {
        const row = mockRows[0]!
        const columnId = 'id'
        const filterValue = 1 // number instead of string
        const result = filterFn_equals(row as any, columnId, filterValue)
        expect(result).toBe(false)
      })
      it('should handle null/undefined values', () => {
        const row = mockRows[0]!
        const columnId = 'firstName'
        const filterValue = null
        const result = filterFn_equals(row as any, columnId, filterValue)
        expect(result).toBe(false)
      })
      it('should correctly identify non-matches', () => {
        const row = mockRows[0]!
        const columnId = 'firstName'
        const filterValue = 'Jane'
        const result = filterFn_equals(row as any, columnId, filterValue)
        expect(result).toBe(false)
      })
    })

    describe('filterFn_weakEquals', () => {
      it('should match exact values', () => {
        const row = mockRows[0]!
        const columnId = 'firstName'
        const filterValue = 'John'
        const result = filterFn_weakEquals(row as any, columnId, filterValue)
        expect(result).toBe(true)
      })
      it('should match values with type coercion (e.g., "1" == 1)', () => {
        const row = mockRows[0]!
        const columnId = 'id'
        const filterValue = 1 // number instead of string
        const result = filterFn_weakEquals(row as any, columnId, filterValue)
        expect(result).toBe(true)
      })
      it('should handle null/undefined values', () => {
        const row = mockRows[0]!
        const columnId = 'firstName'
        const filterValue = null
        const result = filterFn_weakEquals(row as any, columnId, filterValue)
        expect(result).toBe(false)
      })
      it('should correctly identify non-matches', () => {
        const row = mockRows[0]!
        const columnId = 'firstName'
        const filterValue = 'Jane'
        const result = filterFn_weakEquals(row as any, columnId, filterValue)
        expect(result).toBe(false)
      })
    })
  })

  describe('String Filters', () => {
    describe('filterFn_includesStringSensitive', () => {
      it('should match case-sensitive substrings', () => {
        const row = mockRows[0]!
        const columnId = 'firstName'
        const filterValue = 'John'
        const result = filterFn_includesStringSensitive(
          row as any,
          columnId,
          filterValue,
        )
        expect(result).toBe(true)
      })
      it('should not match different case substrings', () => {
        const row = mockRows[0]!
        const columnId = 'firstName'
        const filterValue = 'john' // lowercase
        const result = filterFn_includesStringSensitive(
          row as any,
          columnId,
          filterValue,
        )
        expect(result).toBe(false)
      })
      it('should handle partial matches', () => {
        const row = mockRows[0]!
        const columnId = 'firstName'
        const filterValue = 'ohn'
        const result = filterFn_includesStringSensitive(
          row as any,
          columnId,
          filterValue,
        )
        expect(result).toBe(true)
      })
    })

    describe('filterFn_includesString', () => {
      it('should match case-insensitive substrings', () => {
        const row = mockRows[0]!
        const columnId = 'firstName'
        const filterValue = 'John'
        const result = filterFn_includesString(
          row as any,
          columnId,
          filterValue,
        )
        expect(result).toBe(true)
      })
      it('should match different case substrings', () => {
        const row = mockRows[0]!
        const columnId = 'firstName'
        const filterValue = 'john' // lowercase
        const result = filterFn_includesString(
          row as any,
          columnId,
          filterValue,
        )
        expect(result).toBe(true)
      })
      it('should handle partial matches', () => {
        const row = mockRows[0]!
        const columnId = 'firstName'
        const filterValue = 'ohn'
        const result = filterFn_includesString(
          row as any,
          columnId,
          filterValue,
        )
        expect(result).toBe(true)
      })
    })

    describe('filterFn_equalsString', () => {
      it('should match exact strings', () => {
        const row = mockRows[0]!
        const columnId = 'firstName'
        const filterValue = 'John'
        const result = filterFn_equalsString(row as any, columnId, filterValue)
        expect(result).toBe(true)
      })
      it('should match case-insensitive exact strings', () => {
        const row = mockRows[0]!
        const columnId = 'firstName'
        const filterValue = 'john' // lowercase
        const result = filterFn_equalsString(row as any, columnId, filterValue)
        expect(result).toBe(true)
      })
      it('should not match partial strings', () => {
        const row = mockRows[0]!
        const columnId = 'firstName'
        const filterValue = 'ohn'
        const result = filterFn_equalsString(row as any, columnId, filterValue)
        expect(result).toBe(false)
      })
    })

    describe('filterFn_equalsStringSensitive', () => {
      it('should match case-sensitive exact strings', () => {
        const row = mockRows[0]!
        const columnId = 'firstName'
        const filterValue = 'John'
        const result = filterFn_equalsStringSensitive(
          row as any,
          columnId,
          filterValue,
        )
        expect(result).toBe(true)
      })
      it('should not match case-insensitive exact strings', () => {
        const row = mockRows[0]!
        const columnId = 'firstName'
        const filterValue = 'john'
        const result = filterFn_equalsStringSensitive(
          row as any,
          columnId,
          filterValue,
        )
        expect(result).toBe(false)
      })
      it('should not match partial strings', () => {
        const row = mockRows[0]!
        const columnId = 'firstName'
        const filterValue = 'ohn'
        const result = filterFn_equalsStringSensitive(
          row as any,
          columnId,
          filterValue,
        )
        expect(result).toBe(false)
      })
    })
  })

  describe('Number Filters', () => {
    describe('filterFn_greaterThan', () => {
      it('should match greater than values', () => {
        const row = mockRows[0]!
        const columnId = 'age' // number value 30
        const filterValue = 29
        const result = filterFn_greaterThan(row as any, columnId, filterValue)
        expect(result).toBe(true)
      })
      it('should not match equal values', () => {
        const row = mockRows[0]!
        const columnId = 'age' // number value 30
        const filterValue = 30
        const result = filterFn_greaterThan(row as any, columnId, filterValue)
        expect(result).toBe(false)
      })
      it('should not match less than values', () => {
        const row = mockRows[0]!
        const columnId = 'age' // number value 30
        const filterValue = 31
        const result = filterFn_greaterThan(row as any, columnId, filterValue)
        expect(result).toBe(false)
      })
      it('should match strings greater than numbers', () => {
        const row = mockRows[0]!
        const columnId = 'age' // number value 30
        const filterValue = '29'
        const result = filterFn_greaterThan(row as any, columnId, filterValue)
        expect(result).toBe(true)
      })
      it('should not match strings less than numbers', () => {
        const row = mockRows[0]!
        const columnId = 'age' // number value 30
        const filterValue = '31'
        const result = filterFn_greaterThan(row as any, columnId, filterValue)
        expect(result).toBe(false)
      })
      it('should match strings greater than other strings', () => {
        const row = mockRows[0]!
        const columnId = 'firstName' // 'John'
        const filterValue = 'a'
        const result = filterFn_greaterThan(row as any, columnId, filterValue)
        expect(result).toBe(true)
      })
      it('should not match strings less than other strings', () => {
        const row = mockRows[0]!
        const columnId = 'firstName' // 'John'
        const filterValue = 'z'
        const result = filterFn_greaterThan(row as any, columnId, filterValue)
        expect(result).toBe(false)
      })
      it('should not match strings equal to other strings', () => {
        const row = mockRows[0]!
        const columnId = 'firstName' // 'John'
        const filterValue = 'John'
        const result = filterFn_greaterThan(row as any, columnId, filterValue)
        expect(result).toBe(false)
      })
    })
    describe('filterFn_greaterThanOrEqualTo', () => {
      it('should match greater than values', () => {
        const row = mockRows[0]!
        const columnId = 'age' // number value 30
        const filterValue = 29
        const result = filterFn_greaterThanOrEqualTo(
          row as any,
          columnId,
          filterValue,
        )
        expect(result).toBe(true)
      })
      it('should match equal values', () => {
        const row = mockRows[0]!
        const columnId = 'age' // number value 30
        const filterValue = 30
        const result = filterFn_greaterThanOrEqualTo(
          row as any,
          columnId,
          filterValue,
        )
        expect(result).toBe(true)
      })
      it('should not match less than values', () => {
        const row = mockRows[0]!
        const columnId = 'age' // number value 30
        const filterValue = 31
        const result = filterFn_greaterThanOrEqualTo(
          row as any,
          columnId,
          filterValue,
        )
        expect(result).toBe(false)
      })
      it('should match strings greater than to numbers', () => {
        const row = mockRows[0]!
        const columnId = 'age' // number value 30
        const filterValue = '29'
        const result = filterFn_greaterThanOrEqualTo(
          row as any,
          columnId,
          filterValue,
        )
        expect(result).toBe(true)
      })
      it('should not match strings less than numbers', () => {
        const row = mockRows[0]!
        const columnId = 'age' // number value 30
        const filterValue = '31'
        const result = filterFn_greaterThanOrEqualTo(
          row as any,
          columnId,
          filterValue,
        )
        expect(result).toBe(false)
      })
      it('should match strings greater than other strings', () => {
        const row = mockRows[0]!
        const columnId = 'firstName' // 'John'
        const filterValue = 'a'
        const result = filterFn_greaterThanOrEqualTo(
          row as any,
          columnId,
          filterValue,
        )
        expect(result).toBe(true)
      })
      it('should not match strings less than other strings', () => {
        const row = mockRows[0]!
        const columnId = 'firstName' // 'John'
        const filterValue = 'z'
        const result = filterFn_greaterThanOrEqualTo(
          row as any,
          columnId,
          filterValue,
        )
        expect(result).toBe(false)
      })
      it('should match strings equal to other strings', () => {
        const row = mockRows[0]!
        const columnId = 'firstName' // 'John'
        const filterValue = 'John'
        const result = filterFn_greaterThanOrEqualTo(
          row as any,
          columnId,
          filterValue,
        )
        expect(result).toBe(true)
      })
    })
    describe('filterFn_lessThan', () => {
      it('should match less than values', () => {
        const row = mockRows[0]!
        const columnId = 'age' // number value 30
        const filterValue = 31
        const result = filterFn_lessThan(row as any, columnId, filterValue)
        expect(result).toBe(true)
      })
      it('should not match equal values', () => {
        const row = mockRows[0]!
        const columnId = 'age' // number value 30
        const filterValue = 30
        const result = filterFn_lessThan(row as any, columnId, filterValue)
        expect(result).toBe(false)
      })
      it('should not match greater than values', () => {
        const row = mockRows[0]!
        const columnId = 'age' // number value 30
        const filterValue = 29
        const result = filterFn_lessThan(row as any, columnId, filterValue)
        expect(result).toBe(false)
      })
      it('should match strings less than numbers', () => {
        const row = mockRows[0]!
        const columnId = 'age' // number value 30
        const filterValue = '31'
        const result = filterFn_lessThan(row as any, columnId, filterValue)
        expect(result).toBe(true)
      })
      it('should match strings less than other strings', () => {
        const row = mockRows[0]!
        const columnId = 'firstName' // 'John'
        const filterValue = 'z'
        const result = filterFn_lessThan(row as any, columnId, filterValue)
        expect(result).toBe(true)
      })
      it('should not match strings equal to other strings', () => {
        const row = mockRows[0]!
        const columnId = 'firstName' // 'John'
        const filterValue = 'John'
        const result = filterFn_lessThan(row as any, columnId, filterValue)
        expect(result).toBe(false)
      })
      it('should not match strings greater than other strings', () => {
        const row = mockRows[0]!
        const columnId = 'firstName' // 'John'
        const filterValue = 'a'
        const result = filterFn_lessThan(row as any, columnId, filterValue)
        expect(result).toBe(false)
      })
    })
    describe('filterFn_lessThanOrEqualTo', () => {
      it('should match less than values', () => {
        const row = mockRows[0]!
        const columnId = 'age' // number value 30
        const filterValue = 31
        const result = filterFn_lessThanOrEqualTo(
          row as any,
          columnId,
          filterValue,
        )
        expect(result).toBe(true)
      })
      it('should match equal values', () => {
        const row = mockRows[0]!
        const columnId = 'age' // number value 30
        const filterValue = 30
        const result = filterFn_lessThanOrEqualTo(
          row as any,
          columnId,
          filterValue,
        )
        expect(result).toBe(true)
      })
      it('should not match greater than values', () => {
        const row = mockRows[0]!
        const columnId = 'age' // number value 30
        const filterValue = 29
        const result = filterFn_lessThanOrEqualTo(
          row as any,
          columnId,
          filterValue,
        )
        expect(result).toBe(false)
      })
      it('should match strings less than to numbers', () => {
        const row = mockRows[0]!
        const columnId = 'age' // number value 30
        const filterValue = '31'
        const result = filterFn_lessThanOrEqualTo(
          row as any,
          columnId,
          filterValue,
        )
        expect(result).toBe(true)
      })
      it('should not match strings greater than numbers', () => {
        const row = mockRows[0]!
        const columnId = 'age' // number value 30
        const filterValue = '29'
        const result = filterFn_lessThanOrEqualTo(
          row as any,
          columnId,
          filterValue,
        )
        expect(result).toBe(false)
      })
      it('should match strings less than to other strings', () => {
        const row = mockRows[0]!
        const columnId = 'firstName' // 'John'
        const filterValue = 'z'
        const result = filterFn_lessThanOrEqualTo(
          row as any,
          columnId,
          filterValue,
        )
        expect(result).toBe(true)
      })
      it('should not match strings greater than other strings', () => {
        const row = mockRows[0]!
        const columnId = 'firstName' // 'John'
        const filterValue = 'a'
        const result = filterFn_lessThanOrEqualTo(
          row as any,
          columnId,
          filterValue,
        )
        expect(result).toBe(false)
      })
      it('should match strings equal to other strings', () => {
        const row = mockRows[0]!
        const columnId = 'firstName' // 'John'
        const filterValue = 'John'
        const result = filterFn_lessThanOrEqualTo(
          row as any,
          columnId,
          filterValue,
        )
        expect(result).toBe(true)
      })
    })
  })
})