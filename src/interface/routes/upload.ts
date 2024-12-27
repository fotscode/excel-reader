import { Router } from 'express'
import upload from '@infrastructure/middleware/upload'
import { P } from '@infrastructure/middleware/authorization'
import Permission from '@domain/models/auth/Permission'
import uploadController from '@interface/controllers/upload'

const router = Router()

router.post('/', P(Permission.UPLOAD), upload.single('file'), uploadController.uploadFile)

export default router
