const express = require("express");
const router = express.Router();

const userRoutes = require("./user.routes");
const loginRoutes = require("./login.routes");
const menuRoutes = require("./menu.routes");
const meRoutes = require("./me.routes");
const branchRoutes = require("./branch.routes");
const tenantRoutes = require("./tenant.routes");
const dashboardRoutes = require("./dashboard.routes");
const cashierShiftRoutes = require("./cashierShift.routes");
const terminalRoutes = require("./terminal.routes");
const productRoutes = require("./product.routes");
const provinceRoutes = require("./province.routes");
const municipalityRoutes = require("./municipality.routes");
const barangayRoutes = require("./barangay.routes");
const paymentMethodRoutes = require("./payment-method.routes");
const categoryRoutes = require("./category.routes");
const supplierRoutes = require("./supplier.routes");
const inventoryRoutes = require("./inventory.routes");
const roleRoutes = require("./role.routes");
const purchaseRoutes = require("./purchase.routes");
const saleRoutes = require("./sale.routes");
const officialReceiptAssignmentRoutes = require("./officialReceiptAssignment.routes");
const discountRoutes = require("./discount.routes");
const taxRoutes = require("./tax.routes");

router.use("/login", loginRoutes);

router.use("/users", userRoutes);

router.use("/menus", menuRoutes);

router.use("/auth", meRoutes);

router.use("/branches", branchRoutes);

router.use("/tenants", tenantRoutes);

router.use("/dashboard", dashboardRoutes);

router.use("/cashier-shifts", cashierShiftRoutes);

router.use("/terminals", terminalRoutes);

router.use("/products", productRoutes);

router.use("/provinces", provinceRoutes);

router.use("/municipalities", municipalityRoutes);

router.use("/barangays", barangayRoutes);

router.use("/payment-methods", paymentMethodRoutes);

router.use("/categories", categoryRoutes);

router.use("/suppliers", supplierRoutes);

router.use("/inventory", inventoryRoutes);

router.use("/roles", roleRoutes);

router.use("/purchases", purchaseRoutes);

router.use("/sales", saleRoutes);

router.use("/or-assignments", officialReceiptAssignmentRoutes);

router.use("/discounts", discountRoutes);

router.use("/taxes", taxRoutes);

module.exports = router;
