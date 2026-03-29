const Joi = require('joi');
const { PROGRAMS, LEVELS, ANNOUNCEMENT_CATEGORIES } = require('../constants');

const createSchema = Joi.object({
  title: Joi.string().max(255).required(),
  body: Joi.string().required(),
  category: Joi.string().valid(...ANNOUNCEMENT_CATEGORIES).required(),
  // Course name tag e.g. "Data Structures" — optional, auto-omitted for general notices
  course: Joi.string().max(150).optional().allow(null, ''),
  status: Joi.string().valid('draft', 'published').default('draft'),
  deadline: Joi.string().isoDate().optional().allow(null, ''),
  useful_links: Joi.string().optional().allow(null, ''), // JSON string of array
  // Only relevant for admin; course_rep + lecturer values are overridden server-side
  program: Joi.string().valid(...PROGRAMS).optional(),
  level: Joi.string().valid(...LEVELS).optional(),
});

const updateSchema = Joi.object({
  title: Joi.string().max(255).optional(),
  body: Joi.string().optional(),
  category: Joi.string().valid(...ANNOUNCEMENT_CATEGORIES).optional(),
  course: Joi.string().max(150).optional().allow(null, ''),
  deadline: Joi.string().isoDate().optional().allow(null, ''),
  useful_links: Joi.string().optional().allow(null, ''),
  remove_attachment_ids: Joi.alternatives()
    .try(Joi.array().items(Joi.string().uuid()), Joi.string().uuid())
    .optional(),
});

const querySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  category: Joi.string().valid(...ANNOUNCEMENT_CATEGORIES).optional(),
  sort: Joi.string().valid('newest', 'oldest', 'deadline').default('newest'),
  search: Joi.string().optional(),
  status: Joi.string().valid('all', 'draft', 'published', 'archived').optional(),
  pinned: Joi.string().valid('true', 'false').optional(),
});

module.exports = { createSchema, updateSchema, querySchema };
