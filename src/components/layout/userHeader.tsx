import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { Icons } from "@/components/icons";
import { useUser } from "@/hooks/useUser";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "../ui/breadcrumb";
import { SidebarTrigger } from "../ui/sidebar";
import { Separator } from "../ui/separator";
import { useCart } from "@/hooks/useCart";

export const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const { user, isAdmin } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [language, setLanguage] = useState("en");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { cartCount, fetchCartCount } = useCart();

  useEffect(() => {
    if (!user) return;
    fetchCartCount();
  }, [fetchCartCount, user]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/dashboard/search?q=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
    }
  };

  const handleLanguageChange = (value: string) => {
    setLanguage(value);
    console.log("Language changed to:", value);
  };

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

  const handleLogout = () => {
    logout();
  };

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
    <header className="sticky top-0 z-50 flex h-12 items-center justify-between backdrop-blur-lg rounded-t-lg px-4 lg:px-6 border-b border-primary/10">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="p-1.5 rounded-md hover:bg-primary/10" />
        <Separator orientation="vertical" className="h-5 bg-gray-200" />
        <Breadcrumb>
          <BreadcrumbList className="text-xs text-gray-500">
            {breadcrumbs.map((item, index) => (
              <BreadcrumbItem key={item.url}>
                <BreadcrumbLink
                  href={item.url}
                  className="hover:text-primary font-medium"
                >
                  {item.title}
                </BreadcrumbLink>
                {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
              </BreadcrumbItem>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative sm:hidden">
          <Button
            variant="ghost"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="p-1.5 rounded-md"
            aria-label="Toggle search"
          >
            <Icons.search className="h-4 w-4 text-gray-600" />
          </Button>
          {isSearchOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute top-12 right-0 w-48 bg-white border border-gray-200 rounded-md shadow-md p-2"
            >
              <form onSubmit={handleSearch}>
                <Input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-sm border-none focus:ring-0"
                  aria-label="Search"
                />
              </form>
            </motion.div>
          )}
        </div>

        <form onSubmit={handleSearch} className="hidden sm:block">
          <Input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-32 lg:w-48 text-sm border-gray-200 rounded-md focus:ring-primary/50"
            aria-label="Search"
          />
        </form>

        <Select value={language} onValueChange={handleLanguageChange}>
          <SelectTrigger className="w-20 text-xs border-gray-200 rounded-md">
            <SelectValue placeholder="Lang" />
          </SelectTrigger>
          <SelectContent className="rounded-md border-gray-200">
            <SelectItem value="en">EN</SelectItem>
            <SelectItem value="fr">FR</SelectItem>
          </SelectContent>
        </Select>

        {!isAdmin && (
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard/cart")}
            className="relative p-1.5 rounded-md hover:bg-primary/10"
            aria-label="Shopping Cart"
          >
            <Icons.cart className="h-4 w-4 text-gray-600" />
            {cartCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center rounded-full bg-primary text-white text-[10px]">
                {cartCount}
              </Badge>
            )}
          </Button>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Avatar className="h-7 w-7 border border-primary/20 hover:border-primary cursor-pointer">
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                  {user?.username
                    ?.split(" ")
                    .map((word: string) => word[0].toUpperCase())
                    .slice(0, 2)
                    .join("")}
                </AvatarFallback>
              </Avatar>
            </motion.div>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-48 mt-1 rounded-md border-gray-200 bg-white">
            <DropdownMenuLabel className="text-sm text-gray-800">
              {user?.username}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {!isAdmin && (
              <DropdownMenuItem
                onClick={() => navigate("/dashboard/profile")}
                className="text-sm text-gray-700 hover:bg-primary/10"
              >
                <Icons.user className="h-4 w-4 mr-2" />
                View Profile
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-sm text-red-500 hover:bg-red-50 hover:text-red-600"
            >
              <Icons.logout className="h-4 w-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
