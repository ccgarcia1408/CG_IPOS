import Joi from "joi";

// Deliberately excludes RoleId/IsActive/IsAccountVerified/Username/Password -- those are
// admin-only concepts (see user.validation.ts's updateUserSchema) and must never be settable
// through a self-service profile update.
const updateMeSchema = Joi.object({
  FirstName: Joi.string().trim().max(100),
  MiddleName: Joi.string().trim().max(100).allow("", null),
  LastName: Joi.string().trim().max(100),
  Email: Joi.string().trim().email().max(150),
  Age: Joi.number().integer().min(1).max(120).allow(null),
  Address: Joi.string().trim().max(255).allow("", null),
  ContactNo: Joi.string().trim().max(20).allow("", null)
}).min(1);

export { updateMeSchema };
