'use strict';
const express = require('express');
// const {getAllTours,createTour,getTour,updateTour,deleteTour} = require('./../controllers/tourController');
const tourController = require('../controllers/tourController');
const router = express.Router();

// router.param('id',tourController.checkID)

router.route('/tour-stats').get(tourController.getTourStats);

router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);

router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTour, tourController.getAllTours);

router
  .route('/')
  .get(tourController.getAllTours)
  .post(tourController.createTour);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

// app.use('/api/v1/tours',tourRouter);

module.exports = router;
