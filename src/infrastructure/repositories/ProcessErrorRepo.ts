import ProcessError, { IProcessError } from "@domain/models/ProcessError";
import RowCol from "@application/interfaces/RowCol";
import { IUploadStatus } from "@domain/models/UploadStatus";
import { saveBatch } from "./common";
import { ProcessErrorsPaginatedResponse } from "./interfaces/ProcessErrorRepoInterfaces";
import { ECODES, findError, IError } from "@interface/mappers/error";
import { paginationDefaults } from "@shared/config";

const findErrorsPaginatedAndSorted = async (uploadUUID: string, page: number, limit: number, sort = 'asc'): Promise<ProcessErrorsPaginatedResponse | IError> => {
    if (!uploadUUID) return findError(ECODES.UPLOAD_UUID_NOT_PROVIDED)
    if (page === undefined) page = paginationDefaults.page
    if (limit === undefined) limit = paginationDefaults.limit
    if (sort === undefined) sort = paginationDefaults.sort
    if (page < 1 || isNaN(page)) return findError(ECODES.PAGE_MUST_BE_GREATER_THAN_ZERO)
    if (limit < 1 || isNaN(limit)) return findError(ECODES.LIMIT_MUST_BE_GREATER_THAN_ZERO)

    const sortDirection = sort === 'asc' ? 1 : -1;
    const skip = (page - 1) * limit;
    const errors = await ProcessError.find({ uploadUUID })
        .select('row col -_id')
        .sort({ row: sortDirection, col: sortDirection })  // sort by row, then by col ascending
        .skip(skip)
        .limit(limit);

    const totalErrors = await ProcessError.countDocuments({ uploadUUID });
    return {
        page,
        limit,
        totalErrors,
        totalPages: Math.ceil(totalErrors / limit),
        data: errors
    }
}

const createProcessError = (uploadStatus: IUploadStatus, rowCol: RowCol) => {
    const processError = new ProcessError({
        _upload: uploadStatus._id,
        uploadUUID: uploadStatus.uploadUUID,
        row: rowCol.row,
        col: rowCol.col,
    });
    return processError
}

const saveBatchErrors = async (errors: IProcessError[], force: boolean | undefined = false) => {
    await saveBatch(ProcessError, errors, force);
}

export default { findErrorsPaginatedAndSorted, createProcessError, saveBatchErrors }