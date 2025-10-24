import { useLocation } from "react-router-dom";
import DashboardLayout from "./dashboardLayout";
import PublicLayout from "./publicLayout";
import { useUser } from "@/hooks/useUser";
import UserDashboardLayout from "./userDashboardLayout";

const Layout = () => {
  const { isAdmin } = useUser();
  const path = useLocation().pathname;
  return path?.includes("/dashboard") ? (
    isAdmin ? (
      <DashboardLayout />
    ) : (
      <UserDashboardLayout />
    )
  ) : (
    <PublicLayout />
  );
};
export default Layout;
