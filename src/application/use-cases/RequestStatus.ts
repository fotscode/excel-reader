import { ECODES } from '@interface/mappers/error'
import { getStatusSucessResponse, IStatusSucessResponse } from '@interface/mappers/statusMappers'
import uploadRepo from '@infrastructure/repositories/UploadStatusRepo'
import errorsRepo from '@infrastructure/repositories/ProcessErrorRepo'
import { FindErrorsPaginatedAndSortedParams } from '@infrastructure/repositories/interfaces/ProcessErrorRepoInterfaces'

async function RequestStatus(
    requestParams: FindErrorsPaginatedAndSortedParams,
): Promise<{ statusRes: IStatusSucessResponse | null; err: ECODES | null }> {
    const uploadStatus = await uploadRepo.findUploadStatusByUUID(requestParams.uploadUUID)
    if (!uploadStatus) {
        return { statusRes: null, err: ECODES.UPLOAD_STATUS_NOT_FOUND }
    }

    const errors = await errorsRepo.findErrorsPaginatedAndSorted(requestParams)
    if ('identifier' in errors) {
        return { statusRes: null, err: errors.identifier }
    }
    return { statusRes: getStatusSucessResponse(uploadStatus, errors), err: null }
}

export { RequestStatus }
