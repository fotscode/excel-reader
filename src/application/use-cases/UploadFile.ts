import queues from '@infrastructure/queues/publisher'
import uploadRepo from '@infrastructure/repositories/UploadStatusRepo'
import { ECODES } from 'src/interface/mappers/error'

async function UploadFile(
    format: string,
    filename: string,
): Promise<{ uploadUUID: string; err: ECODES | void }> {
    const savedStatus = await uploadRepo.createPendingUploadStatus(format, filename)
    const { uploadUUID } = savedStatus
    const err = await queues.sendMessageToQueue({ uploadUUID, format, filename })
    return { uploadUUID, err }
}

export { UploadFile }
