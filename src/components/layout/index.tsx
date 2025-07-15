import { useLocation } from "react-router-dom";
import DashboardLayout from "./dashboardLayout";
import PublicLayout from "./publicLayout";

const Layout = () => {
  const path = useLocation().pathname;
  return path?.includes("/dashboard") ? <DashboardLayout /> : <PublicLayout />;
};
export default Layout;
