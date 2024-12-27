import express from 'express';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import uploadRouter from 'src/interface/routes/upload';
import statusRouter from 'src/interface/routes/status';
import { connectToDB } from '@infrastructure/db/mongooseConfig';

connectToDB()

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/upload', uploadRouter);
app.use('/status', statusRouter);

export default app
