import { Response, NextFunction } from 'express'
import userRepo from '@infrastructure/repositories/UserRepo'
import { RequestWithUser } from '@interface/mappers/requests'
import { ECODES, makeHTTPError } from '@interface/mappers/error'

const authenticate = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    const authHeader = req.headers['authorization'] as string

    if (!authHeader) {
        makeHTTPError(res, ECODES.AUTHENTICATION_HEADER_MISSING)
        return
    }

    const [authType, encodedCredentials] = authHeader.split(' ')

    if (authType !== 'Basic') {
        makeHTTPError(res, ECODES.AUTHENTICATION_TYPE_INVALID)
        return
    }

    const decodedCredentials = Buffer.from(encodedCredentials, 'base64').toString('utf-8')
    const [username, password] = decodedCredentials.split(':')

    if (!username || !password) {
        makeHTTPError(res, ECODES.AUTHENTICATION_CREDENTIALS_FAILED)
        return
    }

    const user = await userRepo.findUserByUsername(username)

    if (!user) {
        makeHTTPError(res, ECODES.AUTHENTICATION_CREDENTIALS_FAILED)
        return
    }

    if (!(await user.comparePassword(password))) {
        makeHTTPError(res, ECODES.AUTHENTICATION_CREDENTIALS_FAILED)
        return
    }

    req.user = user

    next()
}

export { authenticate }
