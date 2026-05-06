const express = require("express");
const router = express.Router();

const userRoutes = require("./user.routes");
const loginRoutes = require("./login.routes");
const menuRoutes = require("./menu.routes");
const meRoutes = require("./me.routes");
const terminalRoutes = require("./terminal.routes");

router.use("/login", loginRoutes);

router.use("/users", userRoutes);

router.use("/menus", menuRoutes);

router.use("/auth", meRoutes);

router.use("/terminals", terminalRoutes);

module.exports = router;