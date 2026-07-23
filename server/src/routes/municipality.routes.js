const express = require("express");
const router = express.Router();
const municipalityController = require("../controllers/municipality.controller");
const authMiddleware = require("../middlewares/auth.middleware");

router.get("/", authMiddleware, municipalityController.getMunicipalities);
router.get("/active", authMiddleware, municipalityController.getActiveMunicipalities);
router.get("/:municipalityId", authMiddleware, municipalityController.getMunicipalityById);
router.get("/province/:provinceId", authMiddleware, municipalityController.getMunicipalitiesByProvinceId);
router.post("/", authMiddleware, municipalityController.createMunicipality);
router.put("/:municipalityId", authMiddleware, municipalityController.updateMunicipality);
router.delete("/:municipalityId", authMiddleware, municipalityController.deleteMunicipality);

module.exports = router;