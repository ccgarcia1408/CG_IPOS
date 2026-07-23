const express = require("express");
const router = express.Router();
const provinceController = require("../controllers/province.controller");
const authMiddleware = require("../middlewares/auth.middleware");

router.get("/", authMiddleware, provinceController.getProvinces);
router.get("/active", authMiddleware, provinceController.getActiveProvinces);
router.get("/:provinceId", authMiddleware, provinceController.getProvinceById);
router.post("/", authMiddleware, provinceController.createProvince);
router.put("/:provinceId", authMiddleware, provinceController.updateProvince);
router.delete("/:provinceId", authMiddleware, provinceController.deleteProvince);

module.exports = router;