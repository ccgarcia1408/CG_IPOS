import express from "express";
const router = express.Router();
import * as provinceController from "../controllers/province.controller";
import authMiddleware from "../middlewares/auth.middleware";

router.get("/", authMiddleware, provinceController.getProvinces);
router.get("/active", authMiddleware, provinceController.getActiveProvinces);
router.get("/:provinceId", authMiddleware, provinceController.getProvinceById);
router.post("/", authMiddleware, provinceController.createProvince);
router.put("/:provinceId", authMiddleware, provinceController.updateProvince);
router.delete("/:provinceId", authMiddleware, provinceController.deleteProvince);

export default router;