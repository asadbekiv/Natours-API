'use strict'
const express = require('express');
const userController = require('./../controllers/usersController')



const router = express.Router();

router.route('/api/v1/users').get(userController.getAllUsers).post(userController.createUser);
router.route('/:id').get(userController.getUser).patch(userController.updateUser).delete(userController.deleteUser);

module.exports=router;