import mongoose, { Model } from 'mongoose';
import { IMongooseType } from './interfaces/DynamicFileRepoInterfaces';


// function to parse primitive types for mongoose schemas
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