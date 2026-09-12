import express from "express";
const router = express.Router();

import * as userController from "../controllers/user.controller";
import validate from "../middlewares/validate.middleware";
import {
  createUserSchema,
  updateUserSchema,
  updateUserBranchesSchema
} from "../validations/user.validation";
import authMiddleware from "../middlewares/auth.middleware";
import requireAdmin from "../middlewares/requireAdmin.middleware";

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

export default router;