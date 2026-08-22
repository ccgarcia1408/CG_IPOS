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

router.post("/", validate(createUserSchema), authMiddleware, userController.createUser);
router.get("/", authMiddleware, userController.getUsers);
router.get("/:id", authMiddleware, userController.getUserById);
router.put("/:id", validate(updateUserSchema), authMiddleware, userController.updateUser);
router.put("/:id/profile-picture", authMiddleware, userController.updateProfilePicture);
router.delete("/:id", authMiddleware, userController.deleteUser);
router.get("/:id/branches", authMiddleware, userController.getUserBranches);
router.put("/:id/branches", validate(updateUserBranchesSchema), authMiddleware, userController.updateUserBranches);

module.exports = router;