import { describe, it, expect } from 'vitest'

import { getRowErrors } from '@application/services/FormatSchema'
import RowCol from '@application/interfaces/RowCol'

describe('getRowErrors', () => {
    it('should return row and column for matching error and schema keys', () => {
        const schema = { name: { type: String }, email: { type: String } }
        const errors = { email: 'Email is invalid' }
        const row = 1

        const expectedResult: RowCol[] = [{ row: 1, col: 2 }]
        const result = getRowErrors(row, errors, schema)
        expect(result).toEqual(expectedResult)
    })

    it('should return multiple row and column pairs for multiple errors', () => {
        const schema = {
            name: { type: String },
            email: { type: String },
            age: { type: Number },
        }
        const errors = {
            email: 'Email is invalid',
            age: 'Age is invalid',
        }
        const row = 1

        const expectedResult: RowCol[] = [
            { row: 1, col: 2 }, // email
            { row: 1, col: 3 }, // age
        ]
        const result = getRowErrors(row, errors, schema)
        expect(result).toEqual(expectedResult)
    })

    it('should return an empty array if no error keys match schema keys', () => {
        const schema = { name: { type: String }, email: { type: String } }
        const errors = { address: 'Address is missing' }
        const row = 1

        const result = getRowErrors(row, errors, schema)
        expect(result).toEqual([])
    })

    it('should throw an error if "errors" is not an object', () => {
        const schema = { name: { type: String }, email: { type: String } }
        const row = 1

        expect(() => {
            getRowErrors(row, null, schema) // Invalid "errors"
        }).toThrowError('Cannot convert undefined or null to object')
    })

    it('should throw an error if "schema" is not an object', () => {
        const errors = { email: 'Email is invalid' }
        const row = 1

        expect(() => {
            getRowErrors(row, errors, null) // Invalid "schema"
        }).toThrowError('Cannot convert undefined or null to object')
    })
})
