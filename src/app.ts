import express from 'express'
import cookieParser from 'cookie-parser'
import logger from 'morgan'
import uploadRouter from '@interface/routes/upload'
import statusRouter from '@interface/routes/status'
import { connectToDB } from '@infrastructure/db/mongooseConfig'
import seed from '@infrastructure/db/seed'
import { authenticate } from '@infrastructure/middleware/authentication'

connectToDB()
seed()

const app = express()

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())

app.use(authenticate) // our auth

app.use('/upload', uploadRouter)
app.use('/status', statusRouter)

export default app
