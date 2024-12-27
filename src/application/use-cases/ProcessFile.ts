import { IUploadStatus } from "src/domain/models/UploadStatus";
import { convertStringToJson, createSchemaFromJSON, fillRowObject, getRowErrors } from "@application/services/FormatSchema";
import { createModelFromSchema } from "@infrastructure/repositories/DynamicFileRepo";
import { ReadXLSXFile } from "@application/services/ReadXLSX";
import { IProcessError } from "@domain/models/ProcessError";
import errorRepo from "@infrastructure/repositories/ProcessErrorRepo";
import { BATCH_SIZE } from "@infrastructure/db/mongooseConfig";
import { saveBatch } from "@infrastructure/repositories/common";
import { uploadsPath } from "@shared/config";
import { Model } from "mongoose";

function getSchemaAndModel(uploadStatus: IUploadStatus): { schema: any, model: any } {
    let format = convertStringToJson(uploadStatus.format)
    let schema = createSchemaFromJSON(format);
    const DynamicModel = createModelFromSchema(schema, uploadStatus.uploadUUID);
    return { schema, model: DynamicModel }
}

function initializeVariables(model: Model<any>): { rows: any[], errors: IProcessError[], index: number } {
    let rows = [] as typeof model[];
    let errors = [] as IProcessError[];
    let index = 0;
    return { rows, errors, index }
}

async function ProcessFile(uploadStatus: IUploadStatus) {
    const { schema, model: DynamicModel } = getSchemaAndModel(uploadStatus);
    let { rows, errors, index } = initializeVariables(DynamicModel);

    const data = ReadXLSXFile(`${uploadsPath}/${uploadStatus.filename}`);

    console.debug(`Processing data with ${data.length} rows and batch size of ${BATCH_SIZE}`);
    for (let row of data) {
        index++;
        let obj = new DynamicModel()
        fillRowObject(obj, row, schema)
        let error = obj.validateSync();
        if (error) {
            let rowErrors = getRowErrors(index, error.errors, schema)
            for (let rowError of rowErrors) {
                errors.push(errorRepo.createProcessError(uploadStatus, rowError))
            }
            await errorRepo.saveBatchErrors(errors)
            continue
        }
        rows.push(obj)
        await saveBatch(DynamicModel, rows)
    }

    // save remaining rows
    await saveBatch(DynamicModel, rows, true)
    await errorRepo.saveBatchErrors(errors, true)
}

export { ProcessFile };