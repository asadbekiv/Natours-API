'use strict';

const fs = require('fs');
const tourRouter = require('./routes/tourRoute');
const usersRouter = require('./routes/usersRoute');
const morgan = require('morgan');
const express = require('express');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController.js');

const app = express();

// Our first Middlware
// console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json()); // Middlware
app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// Routes
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', usersRouter);

app.all('*', (req, res, next) => {
  next(new AppError((`Can not find ${req.originalUrl} on this sever !`, 404)));
});

app.use(globalErrorHandler);

// Start the server
module.exports = app;
