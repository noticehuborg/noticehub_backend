const Joi = require('joi');
const { PROGRAMS, LEVELS, ROLES } = require('../constants');

const updateMe = Joi.object({
  full_name: Joi.string().min(2).max(150),
});

const changePassword = Joi.object({
  current_password: Joi.string().required(),
  new_password: Joi.string().min(8).required(),
});

const levelCorrectionRequest = Joi.object({
  requested_level: Joi.string().valid(...LEVELS).required(),
  reason: Joi.string().max(500).optional(),
});

const adminUpdateUser = Joi.object({
  full_name: Joi.string().min(2).max(150),
  email: Joi.string().email(),
  role: Joi.string().valid(...Object.values(ROLES)),
  program: Joi.string().valid(...PROGRAMS),
  level: Joi.string().valid(...LEVELS),
  is_active: Joi.boolean(),
}).min(1);

const createRep = Joi.object({
  full_name: Joi.string().min(2).max(150).required(),
  email: Joi.string().email().required(),
  program: Joi.string().valid(...PROGRAMS).required(),
  level: Joi.string().valid(...LEVELS).required(),
});

module.exports = { updateMe, changePassword, levelCorrectionRequest, adminUpdateUser, createRep };
