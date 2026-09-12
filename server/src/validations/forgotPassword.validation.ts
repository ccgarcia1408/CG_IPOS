import Joi from "joi";

const requestResetSchema = Joi.object({
  Email: Joi.string().trim().email({ tlds: false }).required()
});

const verifyCodeSchema = Joi.object({
  Email: Joi.string().trim().email({ tlds: false }).required(),
  Code: Joi.string().trim().length(6).pattern(/^\d+$/).required()
});

const resetPasswordSchema = Joi.object({
  Email: Joi.string().trim().email({ tlds: false }).required(),
  Code: Joi.string().trim().length(6).pattern(/^\d+$/).required(),
  NewPassword: Joi.string().trim().min(8).max(255).required()
});

export { requestResetSchema, verifyCodeSchema, resetPasswordSchema };
