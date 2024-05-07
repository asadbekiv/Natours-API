'use strict';

const User = require('./../models/userModel.js');
const catchAsync = require('./../utils/catchAsync.js');

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();
  // Sending Response
  res.status(200).json({
    status: 'success ',
    results: users.length,
    data: {
      users,
    },
  });
});
exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined !',
  });
};
exports.getUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined !',
  });
};
exports.updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined !',
  });
};
exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined !',
  });
};
