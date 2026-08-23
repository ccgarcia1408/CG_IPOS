const express = require("express");
const router = express.Router();

const MeController = require("../controllers/me.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validate.middleware");
const { updateMeSchema } = require("../validations/me.validation");

router.get("/me", authMiddleware, MeController.me);
router.put("/me", authMiddleware, validate(updateMeSchema), MeController.updateProfile);
router.put("/me/profile-picture", authMiddleware, MeController.updateProfilePicture);
router.post("/logout", authMiddleware, MeController.logout);

module.exports = router;