const Joi = require("joi");

const createUserSchema = Joi.object({
  FirstName: Joi.string().trim().max(100).required(),
  MiddleName: Joi.string().trim().max(100).allow("", null),
  LastName: Joi.string().trim().max(100).required(),
  Email: Joi.string().trim().email().max(150).required(),
  Age: Joi.number().integer().min(1).max(120).allow(null),
  Address: Joi.string().trim().max(255).allow("", null),
  ContactNo: Joi.string().trim().max(20).allow("", null),
  Username: Joi.string().trim().alphanum().min(3).max(50).required(),
  Password: Joi.string().trim().min(8).max(255).required(),
  RoleId: Joi.number().integer().positive().required()
});

const updateUserSchema = Joi.object({
  FirstName: Joi.string().trim().max(100),
  MiddleName: Joi.string().trim().max(100).allow("", null),
  LastName: Joi.string().trim().max(100),
  Email: Joi.string().trim().email().max(150),
  Age: Joi.number().integer().min(1).max(120).allow(null),
  Address: Joi.string().trim().max(255).allow("", null),
  ContactNo: Joi.string().trim().max(20).allow("", null),
  Username: Joi.string().trim().alphanum().min(3).max(50),
  Password: Joi.string().trim().min(8).max(255).allow(""),
  RoleId: Joi.number().integer().positive(),
  IsActive: Joi.number().integer().valid(0, 1),
  IsAccountVerified: Joi.number().integer().valid(0, 1)
}).min(1);

const updateUserBranchesSchema = Joi.object({
  BranchIds: Joi.array().items(Joi.number().integer().positive()).min(0).required()
});

module.exports = {
  createUserSchema,
  updateUserSchema,
  updateUserBranchesSchema
};