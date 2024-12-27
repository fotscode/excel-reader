import { Router } from 'express'
import upload, { RequestWithFile } from '@infrastructure/middleware/upload'
import queues from '@infrastructure/queues/publisher'
import uploadRepo from '@infrastructure/repositories/UploadStatusRepo'
import { ECODES, makeHTTPError } from '@interface/mappers/error'

const router = Router()

router.post('/', upload.single('file'), async (req: RequestWithFile, res) => {
    if (!req.file) {
        makeHTTPError(res, ECODES.FILE_NOT_FOUND)
        return
    }
    const savedStatus = await uploadRepo.createPendingUploadStatus(
        req.body.format,
        req.file.filename,
    )
    const { uploadUUID, format, filename } = savedStatus
    const err = await queues.sendMessageToQueue({ uploadUUID, format, filename })
    if (err) {
        makeHTTPError(res, err)
        return
    }
    res.json({ uploadUUID })
})

export default router
