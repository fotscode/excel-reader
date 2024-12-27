import { Response } from 'express'

enum ECODES {
    FILE_NOT_FOUND = 'FILE_NOT_FOUND',
    UPLOAD_STATUS_NOT_FOUND = 'UPLOAD_STATUS_NOT_FOUND',
    UPLOAD_UUID_NOT_PROVIDED = 'UPLOAD_UUID_NOT_PROVIDED',
    PAGE_MUST_BE_GREATER_THAN_ZERO = 'PAGE_MUST_BE_GREATER_THAN_ZERO',
    LIMIT_MUST_BE_GREATER_THAN_ZERO = 'LIMIT_MUST_BE_GREATER_THAN_ZERO',
    SCHEMA_ERROR = 'SCHEMA_ERROR',
    FILE_READ_ERROR = 'FILE_READ_ERROR',
    CHANNEL_NOT_CREATED = 'CHANNEL_NOT_CREATED',
    AUTHENTICATION_CREDENTIALS_FAILED = 'AUTHENTICATION_CREDENTIALS_FAILED',
    AUTHENTICATION_TYPE_INVALID = 'AUTHENTICATION_TYPE_INVALID',
    AUTHENTICATION_HEADER_MISSING = 'AUTHENTICATION_HEADER_MISSING',
    AUTHORIZATION_INSUFFICIENT_PERMISSIONS = 'AUTHORIZATION_INSUFFICIENT_PERMISSIONS',
}

type ErrorKeys = keyof typeof ECODES

interface IError {
    identifier: ECODES
    message: string
    httpCode: number
    timestamp?: string
    extra?: any
}

const ERRORS: Record<ErrorKeys, IError> = {
    FILE_NOT_FOUND: {
        identifier: ECODES.FILE_NOT_FOUND,
        message: 'File not found',
        httpCode: 404,
    },
    UPLOAD_STATUS_NOT_FOUND: {
        identifier: ECODES.UPLOAD_STATUS_NOT_FOUND,
        message: 'UploadStatus not found',
        httpCode: 404,
    },
    UPLOAD_UUID_NOT_PROVIDED: {
        identifier: ECODES.UPLOAD_UUID_NOT_PROVIDED,
        message: 'Upload UUID not provided',
        httpCode: 400,
    },
    PAGE_MUST_BE_GREATER_THAN_ZERO: {
        identifier: ECODES.PAGE_MUST_BE_GREATER_THAN_ZERO,
        message: 'Page must be greater than zero',
        httpCode: 400,
    },
    LIMIT_MUST_BE_GREATER_THAN_ZERO: {
        identifier: ECODES.LIMIT_MUST_BE_GREATER_THAN_ZERO,
        message: 'Limit must be greater than zero',
        httpCode: 400,
    },
    SCHEMA_ERROR: {
        identifier: ECODES.SCHEMA_ERROR,
        message: 'Error creating schema',
        httpCode: 500,
    },
    FILE_READ_ERROR: {
        identifier: ECODES.FILE_READ_ERROR,
        message: 'Error reading file',
        httpCode: 500,
    },
    CHANNEL_NOT_CREATED: {
        identifier: ECODES.CHANNEL_NOT_CREATED,
        message: 'Channel not created',
        httpCode: 503,
    },
    AUTHENTICATION_CREDENTIALS_FAILED: {
        identifier: ECODES.AUTHENTICATION_CREDENTIALS_FAILED,
        message: 'Authorization credentials are not correct',
        httpCode: 401,
    },
    AUTHENTICATION_TYPE_INVALID: {
        identifier: ECODES.AUTHENTICATION_TYPE_INVALID,
        message: 'Authorization type is invalid',
        httpCode: 401,
    },
    AUTHENTICATION_HEADER_MISSING: {
        identifier: ECODES.AUTHENTICATION_HEADER_MISSING,
        message: 'Authorization header is missing',
        httpCode: 401,
    },
    AUTHORIZATION_INSUFFICIENT_PERMISSIONS: {
        identifier: ECODES.AUTHORIZATION_INSUFFICIENT_PERMISSIONS,
        message: 'Insufficient permissions',
        httpCode: 403,
    },
}

const findError = (identifier: ECODES, extra: any = undefined): IError => {
    const err = ERRORS[identifier]
    err.timestamp = new Date().toISOString()
    if (extra) err.extra = { extra }
    return err
}

const makeHTTPError = (res: Response, identifier: ECODES, extra: any = undefined) => {
    const err = findError(identifier, extra)
    res.status(err.httpCode).json(err)
}

export { IError, findError, ECODES, makeHTTPError }
