const express = require("express");
const router = express.Router();

const MeController = require("../controllers/me.controller");
const authMiddleware = require("../middlewares/auth.middleware");

router.get("/me", authMiddleware, MeController.me);
router.put("/me/profile-picture", authMiddleware, MeController.updateProfilePicture);
router.post("/logout", authMiddleware, MeController.logout);

module.exports = router;