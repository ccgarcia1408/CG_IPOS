import Joi from "joi";

const loginSchema = Joi.object({
  Username: Joi.string().trim().alphanum().min(3).max(50).required(),
  Password: Joi.string().trim().min(8).max(255).required()
});

const selectBranchSchema = Joi.object({
  TenantId: Joi.number().integer().positive().required(),
  BranchId: Joi.number().integer().positive().required()
});

export { loginSchema, selectBranchSchema };
