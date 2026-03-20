const express = require("express");
const router = express.Router();

const userRoutes = require("./user.routes");
const loginRoutes = require("./login.routes");

router.use("/login", loginRoutes);

router.use("/users", userRoutes);

module.exports = router;