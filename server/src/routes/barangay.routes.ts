import express from "express";
const router = express.Router();
import * as barangayController from "../controllers/barangay.controller";
import authMiddleware from "../middlewares/auth.middleware";

router.get("/", authMiddleware, barangayController.getBarangays);
router.get("/active", authMiddleware, barangayController.getActiveBarangays);
router.get("/:barangayId", authMiddleware, barangayController.getBarangayById);
router.get("/municipality/:municipalityId", authMiddleware, barangayController.getBarangaysByMunicipalityId);
router.post("/", authMiddleware, barangayController.createBarangay);
router.put("/:barangayId", authMiddleware, barangayController.updateBarangay);
router.delete("/:barangayId", authMiddleware, barangayController.deleteBarangay);

export default router;