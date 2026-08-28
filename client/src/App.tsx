import { BrowserRouter as Router, Routes, Route } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
// import SignUp from "./pages/AuthPages/SignUp";
import ForgotPassword from "./pages/AuthPages/ForgotPassword";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Videos from "./pages/UiElements/Videos";
import Images from "./pages/UiElements/Images";
import Alerts from "./pages/UiElements/Alerts";
import Badges from "./pages/UiElements/Badges";
import Avatars from "./pages/UiElements/Avatars";
import Buttons from "./pages/UiElements/Buttons";
import LineChart from "./pages/Charts/LineChart";
import BarChart from "./pages/Charts/BarChart";
import Calendar from "./pages/Calendar";
import BasicTables from "./pages/Tables/BasicTables";
import FormElements from "./pages/Forms/FormElements";
import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import UserMaintenance from "./pages/References/UserMaintenance";
import TenantMaintenance from "./pages/References/TenantMaintenance";
import CategoryMaintenance from "./pages/References/CategoryMaintenance";
import BranchMaintenance from "./pages/References/BranchMaintenance";
import PaymentMethodMaintenance from "./pages/References/PaymentMethodMaintenance";
import SupplierMaintenance from "./pages/References/SupplierMaintenance";
import TerminalMaintenance from "./pages/References/TerminalMaintenance";
import Products from "./pages/Main/Products";
import Inventory from "./pages/Main/Inventory";
import Purchasing from "./pages/Main/Purchasing";
import POS from "./pages/Main/POS";
import SalesHistory from "./pages/Main/SalesHistory";
import OfficialReceiptAssignment from "./pages/References/OfficialReceiptAssignment";
import DiscountMaintenance from "./pages/References/DiscountMaintenance";
import TaxMaintenance from "./pages/References/TaxMaintenance";
import InventoryLogs from "./pages/Main/InventoryLogs";
import DatabaseMaintenance from "./pages/System/DatabaseMaintenance";
import SalesSummaryReport from "./pages/Reports/SalesSummaryReport";
import SalesTrendReport from "./pages/Reports/SalesTrendReport";
import SalesByPaymentMethodReport from "./pages/Reports/SalesByPaymentMethodReport";
import SalesByBranchReport from "./pages/Reports/SalesByBranchReport";
import SalesByTerminalReport from "./pages/Reports/SalesByTerminalReport";
import TopProductsReport from "./pages/Reports/TopProductsReport";
import TopCategoriesReport from "./pages/Reports/TopCategoriesReport";
import VoidedSalesReport from "./pages/Reports/VoidedSalesReport";
import ReturnReasonsReport from "./pages/Reports/ReturnReasonsReport";
import TopReturnedProductsReport from "./pages/Reports/TopReturnedProductsReport";
import SalesDetailReport from "./pages/Reports/SalesDetailReport";
import InventorySummaryReport from "./pages/Reports/InventorySummaryReport";
import LowStockReport from "./pages/Reports/LowStockReport";
import OutOfStockReport from "./pages/Reports/OutOfStockReport";
import ExpiringProductsReport from "./pages/Reports/ExpiringProductsReport";
import StockAdjustmentSummaryReport from "./pages/Reports/StockAdjustmentSummaryReport";
import StockAdjustmentDetailReport from "./pages/Reports/StockAdjustmentDetailReport";
import PurchasingSummaryReport from "./pages/Reports/PurchasingSummaryReport";
import PendingPurchasesReport from "./pages/Reports/PendingPurchasesReport";
import SupplierSummaryReport from "./pages/Reports/SupplierSummaryReport";
import PurchaseDetailReport from "./pages/Reports/PurchaseDetailReport";
import CashierPerformanceReport from "./pages/Reports/CashierPerformanceReport";
import ActiveShiftsReport from "./pages/Reports/ActiveShiftsReport";
import ShiftClosingReport from "./pages/Reports/ShiftClosingReport";
import TerminalStatusReport from "./pages/Reports/TerminalStatusReport";
import OfficialReceiptSummaryReport from "./pages/Reports/OfficialReceiptSummaryReport";
import OrAssignmentStatusReport from "./pages/Reports/OrAssignmentStatusReport";
import AuditLogReport from "./pages/Reports/AuditLogReport";
import { Toaster } from "sonner";

export default function App() {
  return (
    <>
      <Toaster richColors position="top-right" visibleToasts={3} closeButton/>
      <Router>
        <ScrollToTop />
        <Routes>
          <Route index path="/" element={<SignIn />} />

          {/* Dashboard Layout */}
          <Route element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>}
          >
          
            <Route path="/dashboard" element={<Home />} />

            {/* Maintenance Page Links*/}
            <Route path="/user-maintenance" element={<UserMaintenance />} />
            <Route path="/tenant-maintenance" element={<TenantMaintenance />} />
            <Route path="/category-maintenance" element={<CategoryMaintenance />} />
            <Route path="/branch-maintenance" element={<BranchMaintenance />} />
            <Route path="/payment-method-maintenance" element={<PaymentMethodMaintenance />} /> 
            <Route path="/supplier-maintenance" element={<SupplierMaintenance />} /> 
            <Route path="/terminal-maintenance" element={<TerminalMaintenance />} />
            <Route path="/or-assignment-maintenance" element={<OfficialReceiptAssignment />} />
            <Route path="/discount-maintenance" element={<DiscountMaintenance />} />
            <Route path="/tax-maintenance" element={<TaxMaintenance />} />

            {/* System Configuration */}
            <Route path="/database-maintenance" element={<DatabaseMaintenance />} />

            {/* Reports */}
            <Route path="/reports/sales-summary" element={<SalesSummaryReport />} />
            <Route path="/reports/sales-trend" element={<SalesTrendReport />} />
            <Route path="/reports/sales-by-payment-method" element={<SalesByPaymentMethodReport />} />
            <Route path="/reports/sales-by-branch" element={<SalesByBranchReport />} />
            <Route path="/reports/sales-by-terminal" element={<SalesByTerminalReport />} />
            <Route path="/reports/top-products" element={<TopProductsReport />} />
            <Route path="/reports/top-categories" element={<TopCategoriesReport />} />
            <Route path="/reports/voided-sales" element={<VoidedSalesReport />} />
            <Route path="/reports/return-reasons" element={<ReturnReasonsReport />} />
            <Route path="/reports/top-returned-products" element={<TopReturnedProductsReport />} />
            <Route path="/reports/sales-detail" element={<SalesDetailReport />} />
            <Route path="/reports/inventory-summary" element={<InventorySummaryReport />} />
            <Route path="/reports/low-stock" element={<LowStockReport />} />
            <Route path="/reports/out-of-stock" element={<OutOfStockReport />} />
            <Route path="/reports/expiring-products" element={<ExpiringProductsReport />} />
            <Route path="/reports/stock-adjustment-summary" element={<StockAdjustmentSummaryReport />} />
            <Route path="/reports/stock-adjustment-detail" element={<StockAdjustmentDetailReport />} />
            <Route path="/reports/purchasing-summary" element={<PurchasingSummaryReport />} />
            <Route path="/reports/pending-purchases" element={<PendingPurchasesReport />} />
            <Route path="/reports/supplier-summary" element={<SupplierSummaryReport />} />
            <Route path="/reports/purchase-detail" element={<PurchaseDetailReport />} />
            <Route path="/reports/cashier-performance" element={<CashierPerformanceReport />} />
            <Route path="/reports/active-shifts" element={<ActiveShiftsReport />} />
            <Route path="/reports/shift-closing" element={<ShiftClosingReport />} />
            <Route path="/reports/terminal-status" element={<TerminalStatusReport />} />
            <Route path="/reports/official-receipt-summary" element={<OfficialReceiptSummaryReport />} />
            <Route path="/reports/or-assignment-status" element={<OrAssignmentStatusReport />} />
            <Route path="/reports/audit-log" element={<AuditLogReport />} />

            {/* Main Pages Links */}
            <Route path="/products" element={<Products />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/inventory-logs" element={<InventoryLogs />} />
            <Route path="/purchasing" element={<Purchasing />} />
            <Route path="/pos" element={<POS />} />
            <Route path="/sales-history" element={<SalesHistory />} />
            
            {/* Others Page */}
            <Route path="/profile" element={<UserProfiles />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/blank" element={<Blank />} />

            {/* Forms */}
            <Route path="/form-elements" element={<FormElements />} />

            {/* Tables */}
            <Route path="/basic-tables" element={<BasicTables />} />

            {/* Ui Elements */}
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/avatars" element={<Avatars />} />
            <Route path="/badge" element={<Badges />} />
            <Route path="/buttons" element={<Buttons />} />
            <Route path="/images" element={<Images />} />
            <Route path="/videos" element={<Videos />} />

            {/* Charts */}
            <Route path="/line-chart" element={<LineChart />} />
            <Route path="/bar-chart" element={<BarChart />} />
          </Route>

          {/* Auth Layout */}
          <Route path="/login" element={<SignIn />} />
          {/* <Route path="/signup" element={<SignUp />} /> */}
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}
