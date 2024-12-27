import { Router } from 'express'
import uploadRepo from '@infrastructure/repositories/UploadStatusRepo'
import errorsRepo from '@infrastructure/repositories/ProcessErrorRepo'
import { ECODES, makeHTTPError } from '@interface/mappers/error'
import { getStatusSucessResponse } from '@interface/mappers/statusSucess'
import { SortDirection } from '@shared/config'
import Permission from '@domain/models/auth/Permission'
import { P } from '@infrastructure/middleware/authorization'

const router = Router()

router.get('/:uploadUUID', P(Permission.REQUEST), async (req, res) => {
    const uploadUUID = req.params.uploadUUID
    const uploadStatus = await uploadRepo.findUploadStatusByUUID(uploadUUID)
    if (!uploadStatus) {
        makeHTTPError(res, ECODES.UPLOAD_STATUS_NOT_FOUND)
        return
    }
    const page = req.query.page ? parseInt(req.query.page as string) : 1
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10
    const sort = req.query.sort ? (req.query.sort as string) : 'asc'
    const sortDirection = sort === 'asc' ? SortDirection.ASC : SortDirection.DESC

    const errors = await errorsRepo.findErrorsPaginatedAndSorted(
        uploadUUID,
        page,
        limit,
        sortDirection,
    )
    if ('identifier' in errors) {
        makeHTTPError(res, errors.identifier)
        return
    }
    res.json(getStatusSucessResponse(uploadStatus, errors))
})

export default router
