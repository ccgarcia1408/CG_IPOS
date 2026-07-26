const express = require("express");
const router = express.Router();
const branchController = require("../controllers/branch.controller");
const authMiddleware = require("../middlewares/auth.middleware");

router.get("/", authMiddleware, branchController.getBranches);
router.get("/active", authMiddleware, branchController.getActiveBranches);
router.get("/:branchId", authMiddleware, branchController.getBranchById);
router.post("/", authMiddleware, branchController.createBranch);
router.put("/:branchId", authMiddleware, branchController.updateBranch);
router.delete("/:branchId", authMiddleware, branchController.deleteBranch);

module.exports = router;