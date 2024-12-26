import { parseType } from '../../infrastructure/repositories/DynamicFileRepo.js';

// converts format string to json format
// e.g: "{test: Array<String>}" => {test:["String"]}
// e.g: "{test: Array<Array<Number>>}" => {test:[["Number"]]}
// e.g: "{name: String, age: Number,nums?:Array<Number>}" 
//    => {name:"String",age:"Number","nums?":["Number"]}
function convertStringToJson(format) {
    return JSON.parse(format.replaceAll("Array<", "[").replaceAll(">", "]").replace(/\b(\w+\??)/g, '"$1"'));
}

// parses primitive types to functions depending on underlying database (parseType implementation)
// e.g: "String" => { type: String, set: setFn, required: true } in case of mongoose
// e.g: "Number" => { type: Number, set: setFn, required: true } in case of mongoose
function createSchemaFromJSON(jsonSchema) {
    const schema = {};

    Object.entries(jsonSchema).forEach(([key, value]) => {
        let isRequired = !key.endsWith("?") // key is required if it doesn't end with "?"
        if (typeof value === 'string') {
            schema[key] = parseType(value, isRequired);
        } else if (typeof value === 'object' && !Array.isArray(value)) {
            schema[key] = createSchemaFromJSON(value); // recursive for nested objects
        } else if (isValidArray(value, key)) {
            let nested = value[0]
            let newArr = []
            while (isValidArray(nested, key)) {
                newArr = [newArr]
                nested = nested[0]
            }
            let finalValue;
            if (typeof nested === 'string') {
                finalValue = parseType(nested);
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

// inserts value in nested array
function insertValueNested(value, arr) {
    while (Array.isArray(arr[0])) {
        arr = arr[0]
    }
    arr.push(value)
}

// checks if array format is valid
// needs to be an array with only one element
function isValidArray(arr, key) {
    if (!Array.isArray(arr)) {
        return false
    }
    if (arr.length === 1) {
        return true
    }
    throw new Error(`Invalid array definition for key "${key}"`);
}

function getRowErrors(row, errors, schema) {
    let schemaKeys = Object.keys(schema)
    let errorKeys = Object.keys(errors)
    let res = []
    for (let e of errorKeys) {
        let index = schemaKeys.indexOf(e)
        if (index !== -1) {
            res.push({ row, col: index + 1 })
        }
    }
    return res
}

function fillRowObject(row, values, schema) {
    let schemaKeys = Object.keys(schema)
    let schemaValues = Object.values(schema)
    for (let i = 0; i < schemaKeys.length; i++) {
        let finalValue = values[i]
        if (typeof values[i] === "string" && values[i].includes(",")) {
            finalValue = values[i].split(",")
                .map((v) => v.trim())
            let type = schemaValues[i].type[0].type
            if (type === Number) {
                finalValue = finalValue.map(type).sort((a, b) => a - b)
            }
        }
        row[schemaKeys[i]] = finalValue
    }
    return row
}

export { convertStringToJson, createSchemaFromJSON, getRowErrors, fillRowObject }
export default { convertStringToJson, createSchemaFromJSON, getRowErrors, fillRowObject }