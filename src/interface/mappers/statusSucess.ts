import { IUploadStatus } from "@domain/models/UploadStatus"
import { ProcessErrorsPaginatedResponse } from "@infrastructure/repositories/interfaces/ProcessErrorRepoInterfaces";

interface IStatusSucessResponse {
    uploadUUID: string;
    status: string;
    format: string;
    filename: string;
    errors: ProcessErrorsPaginatedResponse;
}

const getStatusSucessResponse = (uploadStatus: IUploadStatus, errors: ProcessErrorsPaginatedResponse): IStatusSucessResponse => {
    return {
        uploadUUID: uploadStatus.uploadUUID,
        status: uploadStatus.status,
        format: uploadStatus.format,
        filename: uploadStatus.filename,
        errors
    }
}

export { getStatusSucessResponse, IStatusSucessResponse }