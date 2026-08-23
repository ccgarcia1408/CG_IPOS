const express = require("express");
const router = express.Router();

const userController = require("../controllers/user.controller");
const validate = require("../middlewares/validate.middleware");
const {
  createUserSchema,
  updateUserSchema,
  updateUserBranchesSchema
} = require("../validations/user.validation");
const authMiddleware = require("../middlewares/auth.middleware");
const requireAdmin = require("../middlewares/requireAdmin.middleware");

// User Maintenance is an admin-only feature (already sidebar-gated via menu_roles), but until
// now nothing enforced that server-side -- any authenticated user could call these mutating
// endpoints directly, including on their own account (e.g. PUT /:id with RoleId:1 to self-promote
// to Administrator, or DELETE /:id on any other user). requireAdmin closes that gap on every
// mutation; the read-only GET routes are left as-is, matching the rest of the app's convention.
router.post("/", validate(createUserSchema), authMiddleware, requireAdmin, userController.createUser);
router.get("/", authMiddleware, userController.getUsers);
router.get("/:id", authMiddleware, userController.getUserById);
router.put("/:id", validate(updateUserSchema), authMiddleware, requireAdmin, userController.updateUser);
router.put("/:id/profile-picture", authMiddleware, requireAdmin, userController.updateProfilePicture);
router.delete("/:id", authMiddleware, requireAdmin, userController.deleteUser);
router.get("/:id/branches", authMiddleware, userController.getUserBranches);
router.put("/:id/branches", validate(updateUserBranchesSchema), authMiddleware, requireAdmin, userController.updateUserBranches);

module.exports = router;