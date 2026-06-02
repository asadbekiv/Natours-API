const express = require('express');
const viewsController = require('../controllers/views-controller');
const authController = require('../controllers/auth-controller.js');
const bookinngController = require('../controllers/booking-controller.js');

const router = express.Router();

router.use(viewsController.alerts);

router.get(
  '/',
  // bookinngController.createBookingCheckout,
  authController.isLoggedIn,
  viewsController.getOverview,
);
router.get('/tour/:slug', authController.isLoggedIn, viewsController.getTour);
router.get('/login', authController.isLoggedIn, viewsController.getLogin);
router.get('/signup', viewsController.getSignup);
router.get('/me', authController.protect, viewsController.getAccount);

router.get('/my-tours', authController.protect, viewsController.getMyTours);

router.post(
  '/submit-user-data',
  authController.protect,
  viewsController.updateUserData,
);

module.exports = router;
