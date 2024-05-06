'use strict';

const { query } = require('express');
// const fs = require('fs');
const Tour = require('./../modules/tourModule.js');
const catchAsync = require('./../utils/catchAsync.js');
const APIFeatures = require('./../utils/apiFeatures.js');
const AppError = require('./../utils/appError.js');

exports.aliasTopTour = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getAllTours = catchAsync(async (req, res) => {
  // Execute Query
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFileds()
    .paginate();
  const tours = await features.query;
  // Sending Response
  res.status(200).json({
    status: 'success asad',
    result: tours.length,
    data: {
      tours,
    },
  });
});

exports.getTour = catchAsync(async (req, res) => {
  // console.log(req.body);
  // const id = req.params.id * 1;
  const tours = await Tour.findById(req.params.id);

  if (!tour) {
    return next(new AppError('No tour find with that ID', 404));
  }

  res.status(200).json({
    status: 'success asad',
    data: {
      tours,
    },
  });
});

exports.createTour = catchAsync(async (req, res) => {
  const newTour = await Tour.create(req.body); // Create a new tour using the request body
  res.status(201).json({
    status: 'success',
    data: {
      tour: newTour,
    },
  });
});

exports.updateTour = catchAsync(async (req, res) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
});

exports.deleteTour = catchAsync(async (req, res) => {
  await Tour.findByIdAndDelete(req.params.id);
  res.status(204).json({
    status: 'success',
    data: {
      tour: null,
    },
  });
});

exports.getTourStats = catchAsync(async (req, res) => {
  try {
    const stats = await Tour.aggregate([
      {
        $match: { ratingsAverage: { $gte: 4.5 } },
      },
      {
        $group: {
          _id: `$difficulty`,
          numRatings: { $sum: '$ratingsQuantity' },
          numTours: { $sum: 1 },
          avgRating: { $avg: '$ratingsAverage' },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
        },
      },
      {
        $sort: { avgPrice: 1 },
      },
      // {
      //     $match:{_id:{$ne:'medium'}}
      // }
    ]);

    res.status(200).json({
      message: 'Successfully',
      data: {
        stats,
      },
    });
  } catch (err) {
    res.status(404).json({
      message: 'fail',
      status: err.message,
    });
  }
});

exports.getMonthlyPlan = catchAsync(async (req, res) => {
  const year = req.params.year * 1;
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-21`),
        },
      },
    },
    {
      $group: {
        _id: { $month: `$startDates` },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: { _id: 0 },
    },
    {
      $sort: { numTourStarts: -1 },
    },
  ]);

  res.status(200).json({
    message: 'Successfully',
    lenth: plan.length,
    data: {
      plan,
    },
  });
});
