import "./App.css";
import { Navigate, Route, Routes } from "react-router-dom";
import { Login } from "@/pages/login";
import Layout from "@/components/layout";
import JournalPage from "@/pages/journalPage";
import ShoppingCart from "@/pages/shoppingCart";
import { ResetPassword } from "@/pages/resetPassword";
import { Register } from "@/pages/register";
import ProfilePage from "@/pages/profilePage";
import { useAuth } from "@/hooks/useAuth";
import CheckoutPage from "./pages/checkoutPage";
import SuccessPage from "./pages/successPage";
import AdminDashboardPage from "./pages/adminDashboardPage";
import CustomerPage from "./pages/customerPage";
import ClaimPage from "./pages/claimPage";
import CancellationPage from "./pages/cancellationPage";
import RenewalPage from "./pages/renewalPage";
import OrdersPage from "./pages/ordersPgae";
import { useClient } from "./hooks/useClient";
import PolicyPage from "./components/clients/UCP/policy";
import PrivacyStatement from "./components/clients/UCP/privacyStatement";
import JournalConfigPage from "./pages/journalConfigPage";
import OcMappingPage from "./pages/ocMappingPage";
import { useUser } from "./hooks/useUser";
import Error404 from "./components/layout/Error404";

function App() {
  const { isAuthenticated, bootstrapped } = useAuth();
  const { clientName } = useClient();

  const { role, user, isAdmin } = useUser();

  if (!bootstrapped || (isAuthenticated && !role)) {
    return <></>;
  }

  return (
    <Routes>
      {/* Root route: Redirect based on auth status */}
      <Route
        path="/"
        element={
          !isAuthenticated ? (
            <Navigate to="/login" />
          ) : (
            <Navigate to="/dashboard" />
          )
        }
      />
      {/* Public routes */}
      <Route path="login" element={<Login />} />
      <Route path="reset-password" element={<ResetPassword />} />
      <Route path="signup" element={<Register />} />
      <Route path="journal" element={<JournalPage user={user} />} />
      {/* Protected routes under dashboard */}
      <Route
        path="/dashboard"
        element={isAuthenticated ? <Layout /> : <Navigate to="/login" />}
      >
        {isAdmin ? (
          <>
            <Route index element={<AdminDashboardPage />} />
            <Route path="journal-config" element={<JournalConfigPage />} />
            <Route path="oc-mapping" element={<OcMappingPage />} />
            <Route path="customers" element={<CustomerPage />} />
            <Route path="claim" element={<ClaimPage />} />
            <Route path="cancellation" element={<CancellationPage />} />
            <Route path="renewals" element={<RenewalPage />} />
            <Route path="viewUserProfile/:id" element={<ProfilePage />} />
          </>
        ) : (
          <>
            <Route index element={<ProfilePage />} />
            {/* <Route index element={<DashboardPage />} /> */}
            <Route path="profile" element={<ProfilePage />} />
            <Route path="journal" element={<JournalPage user={user} />} />
            <Route path="cart" element={<ShoppingCart />} />
            <Route path="checkout" element={<CheckoutPage />} />
            <Route path="success" element={<SuccessPage />} />
          </>
        )}
        <Route path="orders" element={<OrdersPage />} />
      </Route>

      {clientName == "UCP" && (
        <>
          <Route path="policy" element={<PolicyPage />} />
          <Route path="privacyStatement" element={<PrivacyStatement />} />
        </>
      )}
      <Route path="*" element={<Error404 />} />
    </Routes>
  );
}

export default App;
