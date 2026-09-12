import express from "express";
const router = express.Router();
import * as municipalityController from "../controllers/municipality.controller";
import authMiddleware from "../middlewares/auth.middleware";

router.get("/", authMiddleware, municipalityController.getMunicipalities);
router.get("/active", authMiddleware, municipalityController.getActiveMunicipalities);
router.get("/:municipalityId", authMiddleware, municipalityController.getMunicipalityById);
router.get("/province/:provinceId", authMiddleware, municipalityController.getMunicipalitiesByProvinceId);
router.post("/", authMiddleware, municipalityController.createMunicipality);
router.put("/:municipalityId", authMiddleware, municipalityController.updateMunicipality);
router.delete("/:municipalityId", authMiddleware, municipalityController.deleteMunicipality);

export default router;