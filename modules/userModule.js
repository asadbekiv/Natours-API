const mongoose = require('mongoose');
const { validate } = require('./tourModule');
const validator = require('validator');
const bcrypt = require('bcryptjs');

// I should create => email,name,photo,password,passwordConfirm

const userSchema = new mongoose.Schema({
  name: { type: String },
  email: {
    type: String,
    lowercase: true,
    unique: true,
    required: [true, 'Email adress required,enter email addres'],
    validate: [validator.isEmail, 'Please provide  a vaild email !'],
  },
  photo: { data: Buffer, contentType: String },
  password: {
    type: String,
    required: [true, 'please provide a password !'],
    minlength: 6,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'confirm password'],
    validate: {
      validator: function (value) {
        return this.password === value;
      },
      message: 'Password confirmation does not match.',
    },
  },
  passwordChangedAt: Date,
});

userSchema.pre('save', async function (next) {
  // this function only works , when password modefied
  if (!this.isModified('password')) return next();

  //   Hashing the passowrd with const 12

  this.password = await bcrypt.hash(this.password, 12);
  //   Hideing passwordConfirm
  this.passwordConfirm = undefined;
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePssword,
  userPassword,
) {
  return await bcrypt.compare(candidatePssword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = this.passwordChangedAt.getTime();
    console.log(changedTimestamp, JWTTimestamp);
  }
  return false;
};
const User = mongoose.model('User', userSchema);

module.exports = User;
