import path from 'path'

const __dirname = path.resolve()
const uploadsPath = path.join(__dirname, 'uploads')
const multerUploadPath = 'uploads/'

enum SortDirection {
    ASC = 'asc',
    DESC = 'desc',
}

const paginationDefaults = {
    page: 1,
    limit: 10,
    sort: SortDirection.ASC,
}

const defaultSaltValue = (process.env.SALT_ROUNDS && parseInt(process.env.SALT_ROUNDS)) || 10

export { uploadsPath, paginationDefaults, multerUploadPath, SortDirection, defaultSaltValue }
