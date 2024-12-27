import { IUploadStatus } from '@domain/models/UploadStatus'
import { ProcessErrorsPaginatedResponse } from '@infrastructure/repositories/interfaces/ProcessErrorRepoInterfaces'

interface IStatusSucessResponse {
    uploadUUID: string
    status: string
    format: string
    filename: string
    errors: ProcessErrorsPaginatedResponse
    timestamp_enqueued: string
    timestamp_started: string
    timestamp_finished: string
}

const getStatusSucessResponse = (
    uploadStatus: IUploadStatus,
    errors: ProcessErrorsPaginatedResponse,
): IStatusSucessResponse => {
    return {
        uploadUUID: uploadStatus.uploadUUID,
        status: uploadStatus.status,
        format: uploadStatus.format,
        filename: uploadStatus.filename,
        errors,
        timestamp_enqueued: uploadStatus.timestamp_enqueued,
        timestamp_started: uploadStatus.timestamp_started,
        timestamp_finished: uploadStatus.timestamp_finished,
    }
}

export { getStatusSucessResponse, IStatusSucessResponse }
