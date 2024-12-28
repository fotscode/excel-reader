import { describe, it, expect, vi } from 'vitest'
import { createSchemaFromJSON } from '@application/services/FormatSchema'
import { parseType } from '@infrastructure/repositories/DynamicFileRepo'

vi.mock('@infrastructure/repositories/DynamicFileRepo', () => ({
    parseType: vi.fn(),
}))

vi.mock('@application/services/FormatSchema', async importOriginal => {
    const original = await importOriginal()
    return {
        ...original,
    }
})

const mockImplementationParseType = (type: string, isRequired: boolean) => {
    switch (type) {
        case 'String':
            return { type: String, required: isRequired }
        case 'Number':
            return { type: Number, required: isRequired }
        default:
            throw new Error('Not valid type')
    }
}

describe('createSchemaFromJSON', () => {
    it('should convert simple schema with primitive types', () => {
        const jsonSchema = {
            name: 'String',
            age: 'Number',
        }

        const expectedSchema = {
            name: { type: String, required: true },
            age: { type: Number, required: true },
        }

        parseType.mockImplementation(mockImplementationParseType)

        const result = createSchemaFromJSON(jsonSchema)
        expect(result).toEqual(expectedSchema)
        expect(parseType).toHaveBeenCalledTimes(2)
        expect(parseType).toHaveBeenCalledWith('String', true)
        expect(parseType).toHaveBeenCalledWith('Number', true)

        parseType.mockClear()
    })

    it('should handle optional fields (key ends with "?")', () => {
        const jsonSchema = {
            name: 'String',
            'age?': 'Number',
        }

        const expectedSchema = {
            name: { type: String, required: true },
            age: { type: Number, required: false },
        }

        parseType.mockImplementation(mockImplementationParseType)

        const result = createSchemaFromJSON(jsonSchema)
        expect(result).toEqual(expectedSchema)
        expect(parseType).toHaveBeenCalledTimes(2)
        expect(parseType).toHaveBeenCalledWith('String', true)
        expect(parseType).toHaveBeenCalledWith('Number', false)
    })

    it('should handle nested objects', () => {
        const jsonSchema = {
            address: {
                street: 'String',
                city: 'String',
            },
        }

        const expectedSchema = {
            address: {
                street: { type: String, required: true },
                city: { type: String, required: true },
            },
        }

        parseType.mockImplementation(mockImplementationParseType)

        const result = createSchemaFromJSON(jsonSchema)
        expect(result).toEqual(expectedSchema)
    })

    it('should handle arrays with primitive types', () => {
        const jsonSchema = {
            hobbies: ['String'],
        }

        const expectedSchema = {
            hobbies: {
                type: [
                    {
                        type: String,
                        required: true,
                    },
                ],
                required: true,
            },
        }

        parseType.mockImplementation(mockImplementationParseType)

        const result = createSchemaFromJSON(jsonSchema)
        expect(result).toEqual(expectedSchema)
        expect(parseType).toHaveBeenCalledWith('String', true)
    })

    it('should handle arrays with nested objects', () => {
        const jsonSchema = {
            hobbies: [{ name: 'String' }],
        }

        const expectedSchema = {
            hobbies: {
                type: [
                    {
                        name: { type: String, required: true },
                    },
                ],
                required: true,
            },
        }

        parseType.mockImplementation(mockImplementationParseType)

        const result = createSchemaFromJSON(jsonSchema)
        expect(result).toEqual(expectedSchema)
    })

    it('should handle arrays with nested arrays', () => {
        const jsonSchema = {
            hobbies: [['String']],
        }

        const expectedSchema = {
            hobbies: {
                type: [
                    [
                        {
                            type: String,
                            required: true,
                        },
                    ],
                ],
                required: true,
            },
        }

        parseType.mockImplementation(mockImplementationParseType)

        const result = createSchemaFromJSON(jsonSchema)
        expect(result).toEqual(expectedSchema)
    })

    it('should throw an error for unsupported types', () => {
        const jsonSchema = {
            name: undefined,
        }

        expect(() => createSchemaFromJSON(jsonSchema)).toThrowError(
            'Unsupported type for key "name"',
        )
    })
})
