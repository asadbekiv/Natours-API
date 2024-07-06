const express = require('express');
const viewsController = require('./../controllers/viewsController');
const authentication = require('../controllers/authController.js');

const router = express.Router();
router.use(authentication.isLoggedIn);

router.get('/', viewsController.getOverview);
router.get('/tour/:slug', viewsController.getTour);
router.get('/login', viewsController.getLogin);

module.exports = router;
