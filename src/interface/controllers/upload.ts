import { ECODES, makeHTTPError } from '@interface/mappers/error'
import { RequestWithFile } from '@interface/mappers/requests'
import { Response } from 'express'
import { UploadFile } from '@application/use-cases/UploadFile'

const uploadFile = async (req: RequestWithFile, res: Response) => {
    if (!req.file) {
        makeHTTPError(res, ECODES.FILE_NOT_FOUND)
        return
    }

    const { uploadUUID, err } = await UploadFile(req.body.format, req.file.filename)
    if (err) {
        makeHTTPError(res, err)
        return
    }
    res.json({ uploadUUID })
}

export default { uploadFile }
