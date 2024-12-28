import queues from '@infrastructure/queues/publisher'
import uploadRepo from '@infrastructure/repositories/UploadStatusRepo'
import { ECODES } from '@interface/mappers/error'
import { getSchemaAndModel } from '@application/services/FormatSchema'

async function UploadFile(
    format: string,
    filename: string,
): Promise<{ uploadUUID: string; err: ECODES | void }> {
    const savedStatus = await uploadRepo.createPendingUploadStatus(format, filename)
    const { err: errSchema } = getSchemaAndModel(savedStatus)
    if (errSchema) return { uploadUUID: '', err: errSchema }
    const { uploadUUID } = savedStatus
    const err = await queues.sendMessageToQueue({ uploadUUID, format, filename })
    return { uploadUUID, err }
}

export { UploadFile }
