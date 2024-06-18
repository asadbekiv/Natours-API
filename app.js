'use strict';

const fs = require('fs');

const tourRouter = require('./routes/tourRoute.js');
const usersRouter = require('./routes/usersRoute.js');
const morgan = require('morgan');
const express = require('express');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController.js');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const reviewRouter = require('./routes/reviewRoute.js');

const app = express();

// Our first Middlware
// console.log(process.env.NODE_ENV);
// Set Security HTTP headers
app.use(helmet());

// Developmet logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
// Limit request  from the samw API
const limiter = rateLimit({
  max: 100,
  window: 60 * 60 * 1000,
  message: 'Too many request from his IP,please try again later',
});

app.use('/api', limiter);

// Body parser reafiing data from body into req.body
app.use(express.json({ limit: '10kb' })); // Middlware
app.use(mongoSanitize());

app.use(xss());

app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  }),
);

app.use('/media', express.static(`${__dirname}/public`));

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.headers);
  next();
});

// Routes
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/reviews', reviewRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can not find ${req.originalUrl} on this sever !`, 404));
});

app.use(globalErrorHandler);

// Start the server
module.exports = app;
