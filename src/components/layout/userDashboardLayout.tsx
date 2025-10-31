import { Outlet } from "react-router-dom";
import { SidebarInset, SidebarProvider } from "../ui/sidebar";
import { SidebarNav } from "./sidebar";
import { Header } from "./userHeader";
import Footer from "./footer";

const UserDashboardLayout = () => {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full flex-col">
        <div className="flex flex-1">
          <SidebarNav />
          <SidebarInset className="flex-1 bg-background">
            <Header />
            <div className="flex flex-1 flex-col">
              <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
                <Outlet />
              </div>
            </div>
          </SidebarInset>
        </div>
        <Footer />
      </div>
    </SidebarProvider>
  );
};
export default UserDashboardLayout;
