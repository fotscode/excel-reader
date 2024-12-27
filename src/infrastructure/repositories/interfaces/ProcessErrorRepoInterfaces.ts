import { IProcessError } from '@domain/models/ProcessError'
import { SortDirection } from '@shared/config'

interface ProcessErrorsPaginatedResponse {
    page: number
    limit: number
    totalErrors: number
    totalPages: number
    data: IProcessError[]
}

interface FindErrorsPaginatedAndSortedParams {
    uploadUUID: string
    page?: number
    limit?: number
    sort?: SortDirection
}

export { ProcessErrorsPaginatedResponse, FindErrorsPaginatedAndSortedParams }
