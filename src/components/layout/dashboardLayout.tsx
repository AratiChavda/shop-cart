import { Outlet, useLocation } from "react-router-dom";
import { Header } from "./header";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import React from "react";
import Footer from "./footer";

const DashboardLayout = () => {
  const location = useLocation();

  const navItems = [
    { title: "Dashboard", url: "/dashboard" },
    { title: "Profile", url: "/dashboard/profile" },
    { title: "User Profile", url: "/dashboard/viewUserProfile" },
    { title: "Orders", url: "/dashboard/orders" },
    { title: "Journal", url: "/dashboard/journal" },
    { title: "Shopping Cart", url: "/dashboard/cart" },
    { title: "Checkout", url: "/dashboard/checkout" },
    { title: "Customers", url: "/dashboard/customers" },
    { title: "Claim Dashboard", url: "/dashboard/claim" },
    { title: "Cancellation Dashboard", url: "/dashboard/cancellation" },
    { title: "Renewal Dashboard", url: "/dashboard/renewals" },
  ];

  const generateBreadcrumbs = (pathname: string) => {
    const segments = pathname.split("/").filter(Boolean);
    const breadcrumbs = [];

    let currentPath = "";
    for (const segment of segments) {
      currentPath += `/${segment}`;
      const match = navItems.find((item) => item.url === currentPath);
      if (match) breadcrumbs.push(match);
    }

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs(location.pathname);

  return (
    <div className="min-h-dvh flex flex-col justify-between bg-gradient-to-br from-gray-50 to-white">
      <Header />

      <main className="mt-20 px-4 flex justify-center mb-4">
        <div className="w-full max-w-6xl grid grid-cols-1 gap-6">
          <div className="backdrop-blur-md bg-gradient-to-tr from-primary via-primary/90 to-primary/75 rounded-xl p-4 shadow-xl">
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumbs.map((item, index) => (
                  <React.Fragment key={item.url}>
                    <BreadcrumbItem>
                      <BreadcrumbLink
                        href={item.url}
                        className="flex items-center gap-1 text-primary-foreground"
                      >
                        <span>{item.title}</span>
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    {index < breadcrumbs.length - 1 && (
                      <BreadcrumbSeparator className="text-primary-foreground" />
                    )}
                  </React.Fragment>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <div className="backdrop-blur-md bg-white/90 rounded-xl p-6 shadow-xl">
            <Outlet />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default DashboardLayout;
