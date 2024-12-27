import { Router } from 'express'

import Permission from '@domain/models/auth/Permission'
import { P } from '@infrastructure/middleware/authorization'
import statusController from '@interface/controllers/status'

const router = Router()

router.get('/:uploadUUID', P(Permission.REQUEST), statusController.getStatus)

export default router
