const express = require("express");
const router = express.Router();
const cashierShiftController = require("../controllers/cashierShift.controller");
const authMiddleware = require("../middlewares/auth.middleware");

router.get("/mine", authMiddleware, cashierShiftController.getMyOpenShift);
router.post("/", authMiddleware, cashierShiftController.openShift);
router.put("/:id/close", authMiddleware, cashierShiftController.closeShift);

module.exports = router;
