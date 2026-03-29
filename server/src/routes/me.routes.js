const express = require("express");
const router = express.Router();

const MeController = require("../controllers/me.controller");
const authMiddleware = require("../middlewares/auth.middleware");

router.get("/me", authMiddleware, MeController.me);

module.exports = router;