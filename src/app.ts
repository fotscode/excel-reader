import express from 'express';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import mongoose from 'mongoose';
import indexRouter from '@interface/routes/index';
import { connectRabbitMQ } from '@infrastructure/queues/publisher'

// move to infra and use in www
mongoose.connect('mongodb://127.0.0.1:27017/koibanx_challenge')
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err))

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// move to infra and use in www
connectRabbitMQ()
  .then(() => console.log("Connected to RabbitMQ"))
  .catch((err: any) => console.error("RabbitMQ connection error:", err));

app.use('/', indexRouter);

export default app
