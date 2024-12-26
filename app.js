var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mongoose = require('mongoose');

var indexRouter = require('./interface/routes/index');
const { connectRabbitMQ } = require("./infrastructure/queues/publisher.js");

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
  .catch((err) => console.error("RabbitMQ connection error:", err));

app.use('/', indexRouter);

module.exports = app;
