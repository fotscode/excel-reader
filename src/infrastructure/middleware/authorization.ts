import Permission from '@domain/models/auth/Permission'
import { RequestWithUser } from '@interface/mappers/requests'
import { Response, NextFunction } from 'express'
import { ECODES, makeHTTPError } from '@interface/mappers/error'

const P = (requiredPermission: Permission) => {
    return (req: RequestWithUser, res: Response, next: NextFunction) => {
        const user = req.user
        if (!user) {
            makeHTTPError(res, ECODES.AUTHENTICATION_CREDENTIALS_FAILED)
            return
        }
        if (!user.role) {
            makeHTTPError(res, ECODES.AUTHORIZATION_INSUFFICIENT_PERMISSIONS)
            return
        }
        if (!user.role.permissions.includes(requiredPermission)) {
            makeHTTPError(res, ECODES.AUTHORIZATION_INSUFFICIENT_PERMISSIONS)
            return
        }
        next()
    }
}

export { P }
