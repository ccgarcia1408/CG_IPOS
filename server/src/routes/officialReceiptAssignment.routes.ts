import express from "express";
const router = express.Router();
import * as controller from "../controllers/officialReceiptAssignment.controller";
import authMiddleware from "../middlewares/auth.middleware";

router.get("/", authMiddleware, controller.getAssignments);
router.get("/me/active", authMiddleware, controller.getMyActiveAssignment);
router.get("/:orAssignmentId", authMiddleware, controller.getAssignmentById);
router.post("/", authMiddleware, controller.createAssignment);
router.put("/:orAssignmentId", authMiddleware, controller.updateAssignment);
router.delete("/:orAssignmentId", authMiddleware, controller.deleteAssignment);

export default router;
