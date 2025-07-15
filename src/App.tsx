import "./App.css";
import { Navigate, Route, Routes } from "react-router-dom";
import { Login } from "@/pages/login";
import Layout from "@/components/layout";
import JournalPage from "@/pages/journalPage";
import ShoppingCart from "@/pages/shoppingCart";
import { ResetPassword } from "@/pages/resetPassword";
import { Register } from "@/pages/register";
import ProfilePage from "@/pages/profilePage";
import { useAuth } from "./context/authContext";
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

function App() {
  const { isAuthenticated, bootstrapped } = useAuth();
  const { key } = useClient();
  const isAdmin = localStorage.getItem("role") == "Admin";
  if (!bootstrapped) return null;
  return (
    <Routes>
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
      <Route path="login" element={<Login />} />
      <Route path="reset-password" element={<ResetPassword />} />
      <Route path="signup" element={<Register />} />

      <Route
        path="/dashboard"
        element={isAuthenticated ? <Layout /> : <Navigate to="/" />}
      >
        {isAdmin ? (
          <>
            <Route index element={<AdminDashboardPage />} />
            <Route path="customers" element={<CustomerPage />} />
            <Route path="claim" element={<ClaimPage />} />
            <Route path="cancellation" element={<CancellationPage />} />
            <Route path="renewals" element={<RenewalPage />} />
            <Route path="viewUserProfile/:id" element={<ProfilePage />} />
          </>
        ) : (
          <>
            {/* <Route index element={<DashboardPage />} /> */}
            <Route path="profile" element={<ProfilePage />} />
            <Route path="journal" element={<JournalPage />} />
            <Route path="cart" element={<ShoppingCart />} />
            <Route path="checkout" element={<CheckoutPage />} />
            <Route path="success" element={<SuccessPage />} />
          </>
        )}
        <Route path="orders" element={<OrdersPage />} />
      </Route>
      <Route path="journal" element={<JournalPage />} />

      {key == "UCP" && (
        <>
          <Route path="policy" element={<PolicyPage />} />
          <Route path="privacyStatement" element={<PrivacyStatement />} />
        </>
      )}
    </Routes>
  );
}

export default App;
