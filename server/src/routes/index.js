const express = require("express");
const router = express.Router();

const userRoutes = require("./user.routes");
const loginRoutes = require("./login.routes");
const menuRoutes = require("./menu.routes");

router.use("/login", loginRoutes);

router.use("/users", userRoutes);

router.use("/menus", menuRoutes);

module.exports = router;