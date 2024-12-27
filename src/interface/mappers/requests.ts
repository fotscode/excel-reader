import { IUser } from '@domain/models/auth/User'
import { Request } from 'express'

interface RequestWithUser extends Request {
    user?: IUser
}
interface RequestWithFile extends RequestWithUser {
    file?: Express.Multer.File
}

export { RequestWithUser, RequestWithFile }
