import { useLocation } from "react-router-dom";
import PublicLayout from "./publicLayout";
import UserDashboardLayout from "./userDashboardLayout";

const Layout = () => {
  const path = useLocation().pathname;
  return path?.includes("/dashboard") ? (
    <UserDashboardLayout />
  ) : (
    <PublicLayout />
  );
};
export default Layout;
