'use strict';
const express = require('express');
const tourController = require('../controllers/tourController');
const router = express.Router();
const authController = require('./../controllers/authController.js');
const reviewController = require('./../controllers/reviewController.js');
const reviewRouter = require('./../routes/reviewRoute.js');

// router.param('id',tourController.checkID)

router.route('/tour-stats').get(tourController.getTourStats);

router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);


router.use('/:tourId/reviews',reviewRouter)

router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTour, tourController.getAllTours);

router
  .route('/')
  .get(authController.protect, tourController.getAllTours)
  .post(tourController.createTour);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour,
  );

// router
//   .route('/:tourId/reviews')
//   .post(
//     authController.protect,
//     authController.restrictTo('user'),
//     reviewController.createReview,
//   );

module.exports = router;
