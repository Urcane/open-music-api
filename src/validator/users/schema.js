const Joi = require('joi');

const UserPayloadSchema = Joi.object({
  fullname: Joi.string().required(),
  username: Joi.string().max(50).required(),
  password: Joi.string().required(),
});

module.exports = { UserPayloadSchema };
