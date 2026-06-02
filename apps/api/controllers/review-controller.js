const Review = require('../models/review-model.js');
const catchAsync = require('../utils/catch-async.js');
const factory = require('./handler-factory.js');

exports.getAllReviews = factory.getAll(Review);

exports.createReview = catchAsync(async (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;

  const createdReview = await Review.create(req.body);
  // if(!req.body.tour) req.body.tour=req.params.tourId,
  // if(!req.body.user) req.body.user=req.user.id

  res.status(201).json({
    status: 'done',
    data: {
      review: createdReview,
    },
  });
});
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);
exports.getReview = factory.getOne(Review);
