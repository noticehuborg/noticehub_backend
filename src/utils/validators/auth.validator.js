const Joi = require('joi');
const { PROGRAMS, LEVELS } = require('../constants');

const register = Joi.object({
  full_name: Joi.string().min(2).max(150).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  // Program existence + level-range validation is done in the controller
  // (programs are dynamic DB records, so we just check format here)
  program: Joi.string().min(2).max(150).required(),
  level: Joi.string().valid(...LEVELS).required(),
});

const login = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const verifyOtp = Joi.object({
  email: Joi.string().email().required(),
  otp: Joi.string().length(4).required(),
});

const resendOtp = Joi.object({
  email: Joi.string().email().required(),
});

const forgotPassword = Joi.object({
  email: Joi.string().email().required(),
});

const resetPassword = Joi.object({
  token: Joi.string().required(),
  password: Joi.string().min(8).required(),
});

const newPassword = Joi.object({
  password: Joi.string().min(8).required(),
});

const refresh = Joi.object({
  refresh_token: Joi.string().required(),
});

module.exports = { register, login, verifyOtp, resendOtp, forgotPassword, resetPassword, newPassword, refresh };
