import { IUploadStatus } from '@domain/models/UploadStatus'
import {
    convertStringToJson,
    createSchemaFromJSON,
    populateRowWithValues,
    getRowErrors,
} from '@application/services/FormatSchema'
import { createModelFromSchema } from '@infrastructure/repositories/DynamicFileRepo'
import { ReadXLSXFile } from '@application/services/ReadXLSX'
import { IProcessError } from '@domain/models/ProcessError'
import errorRepo from '@infrastructure/repositories/ProcessErrorRepo'
import { BATCH_SIZE } from '@infrastructure/db/mongooseConfig'
import { saveBatch } from '@infrastructure/repositories/common'
import { uploadsPath } from '@shared/config'
import { Model } from 'mongoose'
import { ECODES } from '@interface/mappers/error'

function getSchemaAndModel(uploadStatus: IUploadStatus): { schema: any; model: any; err?: ECODES } {
    try {
        const format = convertStringToJson(uploadStatus.format)
        const schema = createSchemaFromJSON(format)
        const DynamicModel = createModelFromSchema(schema, uploadStatus.uploadUUID)
        return { schema, model: DynamicModel }
    } catch (error) {
        return { schema: null, model: null, err: ECODES.SCHEMA_ERROR }
    }
}

function initializeVariables(model: Model<any>): {
    rows: any[]
    errors: IProcessError[]
    rowNumber: number
} {
    const rows = [] as (typeof model)[]
    const errors = [] as IProcessError[]
    const rowNumber = 0
    return { rows, errors, rowNumber }
}

async function ProcessFile(uploadStatus: IUploadStatus): Promise<void | ECODES> {
    const { schema, model: DynamicModel, err: errSchema } = getSchemaAndModel(uploadStatus)
    if (errSchema) return errSchema
    let { rows, errors, rowNumber } = initializeVariables(DynamicModel)

    const { data, err: errXLSX } = ReadXLSXFile(`${uploadsPath}/${uploadStatus.filename}`)
    if (errXLSX) return errXLSX

    console.debug(`Processing data with ${data.length} rows and batch size of ${BATCH_SIZE}`)
    for (const row of data) {
        rowNumber++
        const entity = new DynamicModel()
        populateRowWithValues(entity, row, schema)
        const error = entity.validateSync()
        if (error) {
            const rowErrors = getRowErrors(rowNumber, error.errors, schema)
            for (const rowCol of rowErrors) {
                // row and col where the error occurred
                errors.push(errorRepo.createProcessError(uploadStatus, rowCol))
            }
            await errorRepo.saveBatchErrors(errors)
            continue
        }
        rows.push(entity)
        await saveBatch(DynamicModel, rows)
    }

    // save remaining rows
    await saveBatch(DynamicModel, rows, true)
    await errorRepo.saveBatchErrors(errors, true)
}

export { ProcessFile }
