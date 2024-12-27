import { makeHTTPError } from '@interface/mappers/error'
import { SortDirection } from '@shared/config'
import { Request, Response } from 'express'
import { RequestStatus } from '@application/use-cases/RequestStatus'

const getStatus = async (req: Request, res: Response) => {
    const uploadUUID = req.params.uploadUUID
    const page = req.query.page ? parseInt(req.query.page as string) : 1
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10
    const sort = req.query.sort ? (req.query.sort as string) : 'asc'
    const sortDirection = sort === 'asc' ? SortDirection.ASC : SortDirection.DESC

    const requestParams = { uploadUUID, page, limit, sort: sortDirection }

    const { statusRes, err } = await RequestStatus(requestParams)
    if (err) {
        makeHTTPError(res, err)
        return
    }

    res.json(statusRes)
}

export default { getStatus }
