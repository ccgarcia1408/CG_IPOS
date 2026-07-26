const express = require("express");
const router = express.Router();

const userRoutes = require("./user.routes");
const loginRoutes = require("./login.routes");
const menuRoutes = require("./menu.routes");
const meRoutes = require("./me.routes");
const branchRoutes = require("./branch.routes");
const terminalRoutes = require("./terminal.routes");
const productRoutes = require("./product.routes");
const provinceRoutes = require("./province.routes");
const municipalityRoutes = require("./municipality.routes");
const barangayRoutes = require("./barangay.routes");
const paymentMethodRoutes = require("./payment-method.routes");

router.use("/login", loginRoutes);

router.use("/users", userRoutes);

router.use("/menus", menuRoutes);

router.use("/auth", meRoutes);

router.use("/branches", branchRoutes);

router.use("/terminals", terminalRoutes);

router.use("/products", productRoutes);

router.use("/provinces", provinceRoutes);

router.use("/municipalities", municipalityRoutes);

router.use("/barangays", barangayRoutes);

router.use("/payment-methods", paymentMethodRoutes);

module.exports = router;