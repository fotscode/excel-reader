import { describe, it, expect } from 'vitest'

import { populateRowWithValues } from '@application/services/FormatSchema'

describe('populateRowWithValues', () => {
    it('should correctly populate row with values based on schema', () => {
        const row = {}
        const values = ['John', 25, '1,3,2']
        const schema = {
            name: { type: String },
            age: { type: Number },
            scores: { type: [{ type: Number }] },
        }

        const expectedResult = {
            name: 'John',
            age: 25,
            scores: [1, 2, 3],
        }

        const result = populateRowWithValues(row, values, schema)
        expect(result).toEqual(expectedResult)
    })
})
