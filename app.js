'use strict';

const fs = require('fs');

const path = require('path');

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
const cookieParser = require('cookie-parser');
const reviewRouter = require('./routes/reviewRoute.js');
const viewRouter = require('./routes/viewsRoute.js');

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.use('/media', express.static(`${__dirname}/public`));

// app.use(helmet());
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'", 'data:', 'blob:'],

      baseUri: ["'self'"],

      fontSrc: ["'self'", 'https:', 'data:'],

      scriptSrc: ["'self'", 'https://*.cloudflare.com'],

      scriptSrc: ["'self'", 'https://*.stripe.com'],

      scriptSrc: ["'self'", 'http:', 'https://*.mapbox.com', 'data:'],

      frameSrc: ["'self'", 'https://*.stripe.com'],

      objectSrc: ["'none'"],

      styleSrc: ["'self'", 'https:', 'unsafe-inline'],

      workerSrc: ["'self'", 'data:', 'blob:'],

      childSrc: ["'self'", 'blob:'],

      imgSrc: ["'self'", 'data:', 'blob:'],

      connectSrc: ["'self'", 'blob:', 'https://*.mapbox.com'],

      upgradeInsecureRequests: [],
    },
  }),
);
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
app.use(cookieParser());
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

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  console.log(req.cookies);
  next();
});

// Routes
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/reviews', reviewRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can not find ${req.originalUrl} on this sever !`, 404));
});

app.use(globalErrorHandler);

// Start the server
module.exports = app;
