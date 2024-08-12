const catchAsync = require('./../utils/catchAsync');
const Tour = require('../models/tourModel.js');
const User = require('../models/userModel.js');
const Booking = require('../models/bookingModel.js');
// const app = require('../app');
const AppError = require('../utils/appError');

exports.getOverview = catchAsync(async (req, res, next) => {
  // 1 Get tour Collections From the Data
  const tours = await Tour.find();

  res.status(200).render('overview.pug', { title: 'All Tours ', tours });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    select: 'review rating user',
  });

  // let arrTour = Object.entries(tour);

  if (!tour) {
    return next(new AppError('There is not Tour with that ID', 404));
  }

  // 1 Get the Data,for the requested Tour(including reviews,guides)
  res
    .set(
      'Content-Security-Policy',
      "default-src * self blob: data: gap:; style-src * self 'unsafe-inline' blob: data: gap:; script-src * 'self' 'unsafe-eval' 'unsafe-inline' blob: data: gap:; object-src * 'self' blob: data: gap:; img-src * self 'unsafe-inline' blob: data: gap:; connect-src self * 'unsafe-inline' blob: data: gap:; frame-src * self blob: data: gap:;",
    )
    .status(200)
    .render('tour.pug', { title: `${tour.name} Tour`, tour });
});

exports.getLogin = (req, res, next) => {
  res.status(200).render('_login.pug', { title: 'Log into your account  ' });
};
exports.getAccount = (req, res, next) => {
  res.status(200).render('account.pug', { title: 'Your account ' });
};
exports.getSignup = (req, res, next) => {
  res.status(200).render('_signup.pug', { title: 'Create your account!  ' });
};

exports.getMyTours = async (req, res, next) => {
  // 1 find all booking
  const bookings = await Booking.find({ user: req.user.id });

  // 2 find tours with the returned ID's

  // const userIDs = bookings.map((el) => el.user);
  // const users = await Tour.find({ _id: { $in: userIDs } });
  const tourIDs = bookings.map((el) => el.tour);
  const tours = await Tour.find({ _id: { $in: tourIDs } });

  res.status(200).render('overview.pug', { title: 'My Tours ', tours });
};

exports.updateUserData = catchAsync(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    {
      new: true,
      runValidators: true,
    },
  );

  // console.log(req.user.id, req.body.name, req.body.email);

  res
    .status(200)
    .render('account.pug', { title: 'Your account ', user: updatedUser });
});
