const express = require("express");
const router = express.Router();
const controller = require("../controllers/officialReceiptAssignment.controller");
const authMiddleware = require("../middlewares/auth.middleware");

router.get("/", authMiddleware, controller.getAssignments);
router.get("/me/active", authMiddleware, controller.getMyActiveAssignment);
router.get("/:orAssignmentId", authMiddleware, controller.getAssignmentById);
router.post("/", authMiddleware, controller.createAssignment);
router.put("/:orAssignmentId", authMiddleware, controller.updateAssignment);
router.delete("/:orAssignmentId", authMiddleware, controller.deleteAssignment);

module.exports = router;
