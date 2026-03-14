const Joi = require("joi");

const createUserSchema = Joi.object({
  FirstName: Joi.string().trim().max(100).required(),
  LastName: Joi.string().trim().max(100).required(),
  Email: Joi.string().trim().email().max(150).required(),
  Age: Joi.number().integer().min(1).max(120).allow(null),
  Address: Joi.string().trim().max(255).allow("", null)
});

const updateUserSchema = Joi.object({
  FirstName: Joi.string().trim().max(100),
  LastName: Joi.string().trim().max(100),
  Email: Joi.string().trim().email().max(150),
  Age: Joi.number().integer().min(1).max(120).allow(null),
  Address: Joi.string().trim().max(255).allow("", null)
}).min(1);

module.exports = {
  createUserSchema,
  updateUserSchema
};