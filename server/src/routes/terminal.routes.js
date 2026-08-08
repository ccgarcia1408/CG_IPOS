const express = require("express");
const router = express.Router();
const terminalController = require("../controllers/terminal.controller");
const authMiddleware = require("../middlewares/auth.middleware");

router.get("/", authMiddleware, terminalController.getTerminals);
router.get("/active", authMiddleware, terminalController.getActiveTerminals);
router.get("/:terminalId", authMiddleware, terminalController.getTerminalById);
router.post("/", authMiddleware, terminalController.createTerminal);
router.put("/:terminalId", authMiddleware, terminalController.updateTerminal);
router.delete("/:terminalId", authMiddleware, terminalController.deleteTerminal);

module.exports = router;
