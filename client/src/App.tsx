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
import CategoryMaintenance from "./pages/References/CategoryMaintenance";
import BranchMaintenance from "./pages/References/BranchMaintenance";
import PaymentMethodMaintenance from "./pages/References/PaymentMethodMaintenance";
import SupplierMaintenance from "./pages/References/SupplierMaintenance";
import TerminalMaintenance from "./pages/References/TerminalMaintenance";
import Inventory from "./pages/Main/Inventory";
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
            <Route path="/category-maintenance" element={<CategoryMaintenance />} />
            <Route path="/branch-maintenance" element={<BranchMaintenance />} />
            <Route path="/payment-method-maintenance" element={<PaymentMethodMaintenance />} /> 
            <Route path="/supplier-maintenance" element={<SupplierMaintenance />} /> 
            <Route path="/terminal-maintenance" element={<TerminalMaintenance />} /> 

            {/* Main Pages Links */}
            <Route path="/inventory" element={<Inventory />} />  
            
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
