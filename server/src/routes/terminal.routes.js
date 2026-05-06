const express = require("express");
const router = express.Router();
const terminalController = require("../controllers/terminal.controller");
const authMiddleware = require("../middlewares/auth.middleware");

router.get("/", authMiddleware, terminalController.getTerminals);

module.exports = router;