'use strict';
const express = require('express');
const bookingController = require('../controllers/bookingController.js');
const authController = require('./../controllers/authController.js');

const router = express.Router();

router.get(
  '/checkout-session/:tourID',
  authController.protect,
  bookingController.getCheckoutSession,
);

module.exports = router;
