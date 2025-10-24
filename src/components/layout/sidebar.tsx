import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { Icons } from "../icons";
import { Link } from "react-router-dom";
import { useClient } from "@/hooks/useClient";
const navItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Icons.dashboard,
  },
  {
    title: "Profile",
    url: "/dashboard/profile",
    icon: Icons.user,
  },
  {
    title: "Orders",
    url: "/dashboard/orders",
    icon: Icons.order,
  },
   {
    title: "Shopping Cart",
    url: "/dashboard/cart",
    icon: Icons.cart,
  },
];
export function SidebarNav() {
  const navigate = useNavigate();
  const pathname = window.location.pathname;
  const { logo } = useClient();
  return (
    <Sidebar
      collapsible="offcanvas"
      variant="inset"
      className="relative bg-gray-50 transition-[width] duration-300 ease-in-out"
    >
      <SidebarHeader>
        <div className="px-4 py-2">
          <div
            className="flex items-center space-x-2 cursor-pointer group"
            onClick={() => navigate("/")}
          >
            <Link
              to="/"
              className="hover:opacity-80 transition-opacity duration-200"
            >
              <img
                src={logo}
                alt="logo"
                className="h-8 w-auto object-contain sm:h-10"
              />
            </Link>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {navItems.map((item) => {
              const isActive = pathname === item.url;
              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md transition-colors"
                    )}
                  >
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
