import ProcessError from "@domain/models/ProcessError";

const findErrorsPaginatedAndSorted = async (uploadUUID: string, page: number, limit: number, sort = 'asc') => {
    if (!uploadUUID) {
        return new Error('Upload UUID is required');
    }
    // TODO: CONFIG DEFAULTS
    if (page === undefined) {
        page = 1;
    }
    if (limit === undefined) {
        limit = 10;
    }
    if (sort === undefined) {
        sort = 'asc';
    }
    if (page < 1) {
        return new Error('Page must be greater than 0');
    }
    if (limit < 1) {
        return new Error('Limit must be greater than 0'); // TODO: make custom error
    }
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

export default { findErrorsPaginatedAndSorted }