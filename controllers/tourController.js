'use strict';

const { query } = require('express');
// const fs = require('fs');
const Tour = require('./../models/tourModel.js');
const catchAsync = require('./../utils/catchAsync.js');
const AppError = require('./../utils/appError.js');
const factory = require('./handlerFactory.js');
// const { Model } = require('mongoose');

exports.aliasTopTour = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getTour = factory.getOne(Tour, { path: 'reviews' });

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

exports.getAllTours = factory.getAll(Tour);
exports.createTour = factory.createOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);
exports.updateTour = factory.updateOne(Tour);

// /tours-within/:distance/center/:41.27796394756191,69.33892211514004/unit/:unit
// latlng=41.27796394756191, 69.33892211514004

exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitude,longitude in format : lat,lng',
        400,
      ),
    );
  }

  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  res.status(200).json({
    results: tours.length,
    status: 'success !',
    data: { data: tours },
  });
});

exports.getDistances = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitude,longitude in format : lat,lng',
        400,
      ),
    );
  }

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: 'distance',
        distanceMultiplier: unit === 'mi' ? 0.000621371 : 0.001, // Convert meters to miles or kilometers
        spherical: true,
      },
    },
    {
      $project: { distance: 1, name: 1 },
    },
  ]);
  console.log(distances);

  res.status(200).json({
    status: 'success !',
    result: distances.length,
    data: { data: distances },
  });
});
