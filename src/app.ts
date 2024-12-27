import express from 'express';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import indexRouter from '@interface/routes/index';
import { connectToDB } from '@infrastructure/db/mongooseConfig';

connectToDB()

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/', indexRouter);

export default app
