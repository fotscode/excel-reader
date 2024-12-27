import { Model } from "mongoose";
import { BATCH_SIZE } from "@infrastructure/db/mongooseConfig";

/**
 * Saves a batch of data to the database.
 *
 * This function handles batch insertion of data into the database using the provided model.
 * - If the `data` array is empty, it does nothing.
 * - If the `data` array length is greater than or equal to the constant `BATCH_SIZE`, it saves the data to the database.
 * - If the `force` parameter is `true`, it saves the data to the database regardless of the array size (useful for the last batch).
 * - After saving, it resets the `data` array to an empty state.
*/
const saveBatch = async (model: Model<any>, data: any[], force: boolean | undefined = false) => {
    if (data.length === 0) {
        return;
    }
    if (data.length >= BATCH_SIZE || force) {
        await model.insertMany(data, { ordered: false });
        data.length = 0; // resets array
    }
}

export { saveBatch }