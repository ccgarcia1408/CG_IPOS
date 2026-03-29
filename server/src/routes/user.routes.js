const express = require("express");
const router = express.Router();

const userController = require("../controllers/user.controller");
const validate = require("../middlewares/validate.middleware");
const {
  createUserSchema,
  updateUserSchema
} = require("../validations/user.validation");
const authMiddleware = require("../middlewares/auth.middleware");

router.post("/", validate(createUserSchema), authMiddleware, userController.createUser);
router.get("/", authMiddleware, userController.getUsers);
router.get("/:id", authMiddleware, userController.getUserById);
router.put("/:id", validate(updateUserSchema), authMiddleware, userController.updateUser);
router.delete("/:id", authMiddleware, userController.deleteUser);

module.exports = router;