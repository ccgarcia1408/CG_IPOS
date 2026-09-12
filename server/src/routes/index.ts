import express from "express";
const router = express.Router();

import userRoutes from "./user.routes";
import loginRoutes from "./login.routes";
import menuRoutes from "./menu.routes";
import meRoutes from "./me.routes";
import branchRoutes from "./branch.routes";
import tenantRoutes from "./tenant.routes";
import dashboardRoutes from "./dashboard.routes";
import cashierShiftRoutes from "./cashierShift.routes";
import terminalRoutes from "./terminal.routes";
import productRoutes from "./product.routes";
import provinceRoutes from "./province.routes";
import municipalityRoutes from "./municipality.routes";
import barangayRoutes from "./barangay.routes";
import paymentMethodRoutes from "./payment-method.routes";
import categoryRoutes from "./category.routes";
import supplierRoutes from "./supplier.routes";
import inventoryRoutes from "./inventory.routes";
import roleRoutes from "./role.routes";
import purchaseRoutes from "./purchase.routes";
import saleRoutes from "./sale.routes";
import officialReceiptAssignmentRoutes from "./officialReceiptAssignment.routes";
import discountRoutes from "./discount.routes";
import taxRoutes from "./tax.routes";
import forgotPasswordRoutes from "./forgotPassword.routes";
import databaseMaintenanceRoutes from "./databaseMaintenance.routes";

router.use("/login", loginRoutes);

router.use("/forgot-password", forgotPasswordRoutes);

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

router.use("/database-maintenance", databaseMaintenanceRoutes);

export default router;
