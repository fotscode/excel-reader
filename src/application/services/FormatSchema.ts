import { parseType } from '@infrastructure/repositories/DynamicFileRepo';
import RowCol from '@application/interfaces/RowCol';

/**
 * Converts a format string to JSON format.
 * 
 * This function takes a string representing a format and converts it into a JSON-like structure.
 * It supports `Array` types and optional fields (indicated with `?`).
 *
 * @example
 * const format = "{test: Array<String>}";
 * const json = convertStringToJson(format);
 * console.log(json); // Output: { test: ["String"] }
 */
function convertStringToJson(format: string) {
    return JSON.parse(format.replace(/Array</g, "[").replace(/>/g, "]").replace(/\b(\w+\??)/g, '"$1"'));
}

/**
 * Converts a JSON schema to a format compatible with the underlying database.
 * 
 * This function parses primitive types and nested objects into database schema format 
 * (such as Mongoose). The `parseType` function is used to transform primitive types into 
 * proper database schema definitions (e.g., `{ type: String, set: setFn, required: true }` for Mongoose).
 * It also handles arrays and nested objects recursively, converting them into an appropriate schema.
 *
 * @throws {Error} Throws an error if the schema type is not supported.
 * 
 * @example
 * const jsonSchema = {
 *   name: "String",
 *   age: "Number",
 *   address: {
 *     street: "String",
 *     city: "String",
 *   },
 *   hobbies?: ["String"]
 * };
 * const schema = createSchemaFromJSON(jsonSchema);
 * console.log(schema);
 * // Output: {
 * //   name: { type: String, set: setFn, required: true },
 * //   age: { type: Number, set: setFn, required: true },
 * //   address: {
 * //     street: { type: String, set: setFn, required: true },
 * //     city: { type: String, set: setFn, required: true },
 * //   },
 * //   "hobbies?": { type: [String], required: false }
 * // }
 */
function createSchemaFromJSON(jsonSchema: any) {
    const schema = {} as { [key: string]: any };

    Object.entries(jsonSchema).forEach(([key, value]) => {
        let isRequired = !key.endsWith("?") // key is required if it doesn't end with "?"
        if (typeof value === 'string') {
            schema[key] = parseType(value, isRequired);
        } else if (typeof value === 'object' && !Array.isArray(value)) {
            schema[key] = createSchemaFromJSON(value); // recursive for nested objects
        } else if (isValidArray(value, key)) {
            let nested = (value as any[])[0]
            let newArr = [] as any[]
            while (isValidArray(nested, key)) {
                newArr = [newArr]
                nested = nested[0]
            }
            let finalValue;
            if (typeof nested === 'string') {
                finalValue = parseType(nested, true);
            } else if (typeof nested === 'object') {
                finalValue = createSchemaFromJSON(nested); // recursive for nested objects
            }
            insertValueNested(finalValue, newArr)
            schema[key] = { type: newArr, required: isRequired }
        } else {
            throw new Error(`Unsupported type for key "${key}"`);
        }
    });
    return schema;
}

/**
 * Inserts a value into a nested array, flattening the array structure if necessary.
 * 
 * This function recursively traverses the outer arrays in the nested array and inserts 
 * the value into the innermost array.
 * 
 * @example
 * const nestedArray = [[[]]];
 * insertValueNested(42, nestedArray);
 * console.log(nestedArray); // Output: [[[42]]]
 */
function insertValueNested(value: any, arr: any[]) {
    while (Array.isArray(arr[0])) {
        arr = arr[0]
    }
    arr.push(value)
}

/**
 * Checks if the array format is valid.
 * 
 * This function validates that the provided value is an array with exactly one element.
 * If the array has more than one element or is not an array, it throws an error.
 *
 * @throws {Error} Throws an error if the array is not valid.
 * 
 * @example
 * const validArray = ["String"];
 * console.log(isValidArray(validArray, "example")); // Output: true
 * 
 * const invalidArray = ["String", "Number"];
 * try {
 *     console.log(isValidArray(invalidArray, "example")); // Throws error
 * } catch (e) {
 *     console.log(e.message); // Output: Invalid array definition for key "example"
 * }
 */
function isValidArray(arr: any, key: string) {
    if (!Array.isArray(arr)) {
        return false
    }
    if (arr.length === 1) {
        return true
    }
    throw new Error(`Invalid array definition for key "${key}"`);
}

/**
 * Retrieves the row and column information for errors based on the schema and error data.
 * 
 * This function compares the keys in the `errors` object with the keys in the `schema` object. 
 * If a key from the `errors` object exists in the `schema`, it adds the corresponding row and column 
 * information to the result array. The row is provided as an argument, and the column is determined 
 * by the index of the schema key.
 * 
 * @throws {Error} Throws an error if the `errors` or `schema` are not objects.
 * 
 * @example
 * const schema = { name: { type: String }, email: { type: String } };
 * const errors = { email: "Email is invalid" };
 * const row = 1;
 * const result = getRowErrors(row, errors, schema);
 * console.log(result);
 * // Output: [{ row: 1, col: 2 }]
 */
function getRowErrors(row: number, errors: any, schema: any): RowCol[] {
    let schemaKeys = Object.keys(schema)
    let errorKeys = Object.keys(errors)
    let res = [] as RowCol[]
    for (let e of errorKeys) {
        let index = schemaKeys.indexOf(e)
        if (index !== -1) {
            res.push({ row, col: index + 1 })
        }
    }
    return res
}

/**
 * Populates a row object with values mapped to a schema.
 * 
 * This function takes a row object, an array of values, and a schema, and populates the row object 
 * with values based on the schema's keys and types. It also handles specific transformations:
 * - If a value is a comma-separated string, it is split into an array.
 * - If the schema type is `Number`, the resulting array is converted to numbers and sorted in ascending order.
 * 
 * @throws {Error} Throws an error if the schema keys and values are not arrays of the same length.
 * 
 * @example
 * const row = {};
 * const values = ["John", 25, "1,3,2"];
 * const schema = {
 *   name: { type: String },
 *   age: { type: Number },
 *   scores: { type: [Number] }
 * };
 * const result = populateRowWithValues(row, values, schema);
 * console.log(result);
 * // Output: { name: "John", age: 25, scores: [1, 2, 3] }
 */
function populateRowWithValues(row: any, values: any[], schema: { [key: string]: any }) {
    let schemaKeys = Object.keys(schema)
    let schemaValues = Object.values(schema)
    for (let i = 0; i < schemaKeys.length; i++) {
        let finalValue = values[i] // RNF #1
        if (typeof values[i] === "string" && values[i].includes(",")) {
            finalValue = values[i].split(",")
                .map((v: string) => v.trim())
            let type = schemaValues[i].type[0].type
            if (type === Number) {
                finalValue = finalValue.map(type).sort((a: number, b: number) => a - b) // RNF #4
            }
        }
        row[schemaKeys[i]] = finalValue
    }
    return row
}

export { convertStringToJson, createSchemaFromJSON, getRowErrors, populateRowWithValues }
export default { convertStringToJson, createSchemaFromJSON, getRowErrors, populateRowWithValues }