const express = require('express');
const reviewController = require('./../controllers/reviewController.js');
const authController = require('./../controllers/authController.js');
const merge = require('nodemon/lib/utils/merge.js');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.protect,
    authController.restrictTo('user'),
    reviewController.createReview,
  );

router
  .route('/:id')
  .patch(reviewController.updateReview )
  .delete(reviewController.deleteReview);

module.exports = router;
