const express = require("express");
const router = express.Router();
const barangayController = require("../controllers/barangay.controller");
const authMiddleware = require("../middlewares/auth.middleware");

router.get("/", authMiddleware, barangayController.getBarangays);
router.get("/active", authMiddleware, barangayController.getActiveBarangays);
router.get("/:barangayId", authMiddleware, barangayController.getBarangayById);
router.get("/municipality/:municipalityId", authMiddleware, barangayController.getBarangaysByMunicipalityId);
router.post("/", authMiddleware, barangayController.createBarangay);
router.put("/:barangayId", authMiddleware, barangayController.updateBarangay);
router.delete("/:barangayId", authMiddleware, barangayController.deleteBarangay);

module.exports = router;