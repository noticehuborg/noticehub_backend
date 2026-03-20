const Joi = require('joi');

exports.createResourceSchema = Joi.object({
  title: Joi.string()
    .max(255)
    .required(),

  description: Joi.string()
    .max(300)
    .optional(),

  type: Joi.string()
    .valid('telegram', 'drive', 'youtube', 'file')
    .required(),

  // 🔗 URL required ONLY for non-file types
  url: Joi.when('type', {
    is: Joi.valid('telegram', 'drive', 'youtube'),
    then: Joi.string().uri().required(),
    otherwise: Joi.forbidden(),
  }),

  // 👥 Only useful for telegram (optional)
  member_count: Joi.number()
    .integer()
    .optional(),

  // 🎯 Level filter
   level: Joi.number()
    .valid(100, 200, 300, 400)
    .optional()
    .allow(null),
});