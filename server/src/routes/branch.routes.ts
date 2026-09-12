import express from "express";
const router = express.Router();
import * as branchController from "../controllers/branch.controller";
import authMiddleware from "../middlewares/auth.middleware";

router.get("/", authMiddleware, branchController.getBranches);
router.get("/active", authMiddleware, branchController.getActiveBranches);
router.get("/:branchId", authMiddleware, branchController.getBranchById);
router.post("/", authMiddleware, branchController.createBranch);
router.put("/:branchId", authMiddleware, branchController.updateBranch);
router.delete("/:branchId", authMiddleware, branchController.deleteBranch);

export default router;