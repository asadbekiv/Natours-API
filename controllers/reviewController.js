const Review = require('./../models/reviewModel.js');
const catchAsync = require('./../utils/catchAsync.js');
const factory = require('./handlerFactory.js');

exports.getAllReviews = catchAsync(async (req, res, next) => {
  let filter = {};
  if (req.params.tourId) filter = { tour: req.params.tourId };

  const reviews = await Review.find(filter);

  res.status(200).json({
    status: 'done',
    results: reviews.length,
    data: {
      reviews,
    },
  });
});

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
