const Tour = require('../models/tour-model.js');
const Booking = require('../models/booking-model.js');
const User = require('../models/user-model.js');
const catchAsync = require('../utils/catch-async.js');
const AppError = require('../utils/app-error.js');
const factory = require('./handler-factory.js');

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // Get Cuurently booked tour
  const tour = await Tour.findById(req.params.tourId);

  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }

  // Create checkout sesstion

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}/my-tours?alert=booking`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
            images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
          },
          unit_amount: tour.price * 100,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
  });

  res.status(200).json({
    status: 'success',
    session,
  });
});

// exports.createBookingCheckout = catchAsync(async (req, res, next) => {
//   // This is Temperoroy , couse it is UNSECURE Every one can make booking wihtout paying.
//   const { tour, user, price } = req.query;
//   if (!tour && !user && !price) {
//     return next();
//   }

//   // console.log(req.originalUrl());

//   await Booking.create({ tour, user, price });
//   res.redirect(req.originalUrl('?')[0]);
// });

const createBookingCheckout = async (session) => {
  const tour = session.client_reference_id;
  const user = await User.findOne({ email: session.customer_email });
  if (!user) {
    throw new Error(`No user found for email ${session.customer_email}`);
  }
  const price = session.amount_total / 100; // amount_total is in the smallest currency unit
  await Booking.create({ tour, user: user.id, price });
};
exports.webhookCheckout = async (req, res) => {
  const signature = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (error) {
    return res.status(400).send(`Webhook error: ${error.message}`);
  }

  try {
    if (event.type === 'checkout.session.completed') {
      await createBookingCheckout(event.data.object);
    }
  } catch (error) {
    // Return a non-2xx status so Stripe retries delivery instead of
    // silently losing the booking.
    console.error('Error creating booking from webhook:', error);
    return res.status(500).send('Failed to process checkout session');
  }

  res.status(200).json({ received: true });
};
exports.createBooking = factory.createOne(Booking);
exports.getBooking = factory.getOne(Booking);
exports.getAllBookings = factory.getAll(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
