const express = require('express');
const catchAsync = require('./../utils/catchAsync');
const Tour = require('./../models/tourModel');
// const app = require('../app');
const AppError = require('../utils/appError');

exports.getOverview = catchAsync(async (req, res, next) => {
  // 1 Get tour Collections From the Data
  const tours = await Tour.find();

  console.log(tours.length);
  console.log(tours);
  res.status(200).render('overview.pug', { title: 'All Tours', tours });
});

exports.getTour = catchAsync(async (req, res, next) => {
  console.log(12345);
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    select: 'review rating user',
  });

  // let arrTour = Object.entries(tour);

  console.log(tour);
  if (!tour) {
    return next(new AppError('There is not Tour with that ID', 404));
  }

  // 1 Get the Data,for the requested Tour(including reviews,guides)
  res.status(200).render('tour.pug', { title: `${tour.name} Tour`, tour });
});

exports.getLogin = catchAsync(async (req, res, next) => {
  res.status(200).render('_login.pug', { title: 'Log into your account ' });
});
