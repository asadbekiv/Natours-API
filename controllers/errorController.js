// const { stack } = require('../app');
const AppError = require('./../utils/appError.js');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}:${err.value}`;
  return new AppError(message, 400);
};
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    message: err.message,
    error: err,
    status: err.status,
    stack: err.stack,
  });
};
const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      message: err.message,
      status: err.status,
    });
  } else {
    console.error('ERROR ', err);
    res.status(500).json({
      ststus: 'error',
      message: 'some messy error happened !',
    });
  }
};

module.exports = (err, req, res, next) => {
  console.log(err.stack);
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'fail';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    if ((error.name = 'CastError')) error = handleCastErrorDB(error);
    sendErrorProd(err, res);
  }
};
