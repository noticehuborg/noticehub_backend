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
  full_name:  Joi.string().min(2).max(150),
  email:      Joi.string().email(),
  role:       Joi.string().valid(...Object.values(ROLES)),
  program:    Joi.string().min(2).max(150),  // validated against programs table in controller
  level:      Joi.string().valid(...LEVELS),
  position:   Joi.string().max(100).allow(null, ''),
  is_active:  Joi.boolean(),
}).min(1);

const createRep = Joi.object({
  full_name: Joi.string().min(2).max(150).required(),
  email: Joi.string().email().required(),
  program: Joi.string().min(2).max(150).required(),  // validated against programs table in controller
  level: Joi.string().valid(...LEVELS).required(),
});

// Lecturer creation — program + level are no longer on the lecturer profile.
// Courses are linked via the lecturer_courses junction table.
// position is optional (admin/non-teaching staff may not have one).
// course_ids is an optional array of existing course UUIDs to assign on creation.
const createLecturer = Joi.object({
  full_name:  Joi.string().min(2).max(150).required(),
  email:      Joi.string().email().required(),
  position:   Joi.string().max(100).optional().allow(null, ''),
  course_ids: Joi.array().items(Joi.string().uuid()).optional(),
});

module.exports = { updateMe, changePassword, levelCorrectionRequest, adminUpdateUser, createRep, createLecturer };
