import mongoose, { Model } from 'mongoose';
import { IMongooseType } from './interfaces/DynamicFileRepoInterfaces';


/**
 * Parses a primitive type for use in a Mongoose schema.
 * 
 * This function maps a type string to its corresponding Mongoose schema type configuration. 
 * It also applies a setter function to validate values based on the specified type.
 * 
 * @example
 * const stringField = parseType("string", true);
 * console.log(stringField);
 * // Output: { type: String, set: [Function: setFn], required: true }
 * 
 * const numberField = parseType("number", false);
 * console.log(numberField);
 * // Output: { type: Number, set: [Function: setFn], required: false }
 * 
 * const dateField = parseType("date", true);
 * console.log(dateField);
 * // Output: { type: Date, required: true }
 */
const parseType = (type: string, isRequired: boolean): IMongooseType => {
    const setFn = (value: any) => {
        if (typeof value != type.toLowerCase()) {
            throw new Error("Not valid type")
        }
        return value
    }
    switch (type.toLowerCase()) {
        case 'string':
            return { type: String, set: setFn, required: isRequired };
        case 'number':
            return { type: Number, set: setFn, required: isRequired };
        case 'boolean':
            return { type: Boolean, set: setFn, required: isRequired };
        case 'date':
            return { type: Date, required: isRequired };
        case 'objectid':
            return { type: mongoose.Schema.Types.ObjectId, set: setFn, required: isRequired };
        default:
            return { type: mongoose.Schema.Types.Mixed };
    }
}

const createModelFromSchema = (schema: any, modelName: string): Model<any> => {
    return mongoose.model(modelName, schema, modelName);
}

export { parseType, createModelFromSchema }
export default { parseType, createModelFromSchema }