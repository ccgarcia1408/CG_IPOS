import express from "express";
const router = express.Router();
import * as menuController from "../controllers/menu.controller";
import authMiddleware from "../middlewares/auth.middleware";

router.get("/", authMiddleware, menuController.getMenus);

export default router;