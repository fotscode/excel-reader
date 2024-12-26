import mongoose from 'mongoose';

// function to parse primitive types for mongoose schemas
function parseType(type, isRequired) {
    const setFn = (value) => {
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
            throw new Error(`Unsupported type "${type}"`);
    }
}

function createModelFromSchema(schema, modelName) {
    const model = mongoose.model(modelName, schema, modelName);
    return model;
}

export { parseType, createModelFromSchema }
export default { parseType, createModelFromSchema }