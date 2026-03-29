const express = require("express");
const router = express.Router();
const menuController = require("../controllers/menu.controller");
const authMiddleware = require("../middlewares/auth.middleware");

router.get("/", authMiddleware, menuController.getMenus);

module.exports = router;