import express from "express";
const router = express.Router();
import * as terminalController from "../controllers/terminal.controller";
import authMiddleware from "../middlewares/auth.middleware";

router.get("/", authMiddleware, terminalController.getTerminals);
router.get("/active", authMiddleware, terminalController.getActiveTerminals);
router.get("/:terminalId", authMiddleware, terminalController.getTerminalById);
router.post("/", authMiddleware, terminalController.createTerminal);
router.put("/:terminalId", authMiddleware, terminalController.updateTerminal);
router.delete("/:terminalId", authMiddleware, terminalController.deleteTerminal);

export default router;
