const express = require("express");
const router = express.Router();
const branchController = require("../controllers/branch.controller");
const authMiddleware = require("../middlewares/auth.middleware");

router.get("/", authMiddleware, branchController.getBranches);
router.get("/active", authMiddleware, branchController.getActiveBranches);

module.exports = router;