const express = require('express');
const viewsController = require('./../controllers/viewsController');
const authentication = require('../controllers/authController.js');
const bookinngController = require('../controllers/bookingController.js');

const router = express.Router();

router.get(
  '/',
  bookinngController.createBookingCheckout,
  authentication.isLoggedIn,
  viewsController.getOverview,
);
router.get('/tour/:slug', authentication.isLoggedIn, viewsController.getTour);
router.get('/login', authentication.isLoggedIn, viewsController.getLogin);
router.get('/me', authentication.protect, viewsController.getAccount);

router.post(
  '/submit-user-data',
  authentication.protect,
  viewsController.updateUserData,
);

module.exports = router;
