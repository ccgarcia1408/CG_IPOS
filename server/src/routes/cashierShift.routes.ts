import express from "express";
const router = express.Router();
import * as cashierShiftController from "../controllers/cashierShift.controller";
import authMiddleware from "../middlewares/auth.middleware";

router.get("/mine", authMiddleware, cashierShiftController.getMyOpenShift);
router.post("/", authMiddleware, cashierShiftController.openShift);
router.put("/:id/close", authMiddleware, cashierShiftController.closeShift);

export default router;
