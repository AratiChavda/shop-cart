import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Menu, X, User, LogOut } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useClient } from "@/hooks/useClient";
import { useAuth } from "@/context/authContext";

export const Header = ({ cartItems = [], userName = "Guest" }) => {
  const isAdmin = localStorage.getItem("role") == "Admin";
  const { logo } = useClient();
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const navMenu = [
    { title: "Dashboard", url: "/dashboard" },
    { title: "Orders", url: "/dashboard/orders" },
    // { title: "Contact Us", url: "/dashboard/contact" },
  ];

  const menuVariants = {
    closed: { y: "-100%", opacity: 0 },
    open: { y: 0, opacity: 1, transition: { duration: 0.3, ease: "easeOut" } },
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="w-full bg-white border-b shadow-md border-gray-200 fixed top-0 z-50">
      <div className="flex items-center justify-between px-2 py-3 sm:px-1 md:px-3">
        <div className="flex gap-1">
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

          <Button
            variant="ghost"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            className="md:hidden"
          >
            {menuOpen ? (
              <X className="w-5 h-5 text-gray-900" />
            ) : (
              <Menu className="w-5 h-5 text-gray-900" />
            )}
          </Button>

          <AnimatePresence>
            {menuOpen && (
              <motion.nav
                className="absolute left-0 top-14 w-full bg-white border-b border-gray-200 md:hidden"
                initial={menuVariants.closed}
                animate={menuVariants.open}
                exit={menuVariants.closed}
                variants={menuVariants}
              >
                <ul className="flex flex-col gap-2 p-4">
                  {navMenu.map((item, index) => (
                    <li key={index} className="relative">
                      <Link
                        to={item.url}
                        className={`block py-2 text-gray-900 hover:text-primary text-base transition-colors ${
                          location.pathname === item.url
                            ? "font-bold text-primary"
                            : ""
                        }`}
                        onClick={() => setMenuOpen(false)}
                      >
                        {item.title}
                        {location.pathname === item.url && (
                          <span className="absolute left-0 bottom-0 w-full h-0.5 bg-primary" />
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </motion.nav>
            )}
          </AnimatePresence>
        </div>

        <nav className="hidden md:flex md:items-center md:gap-6">
          <ul className="flex items-center gap-6">
            {navMenu.map((item, index) => (
              <li key={index} className="relative">
                <Link
                  to={item.url}
                  className={`text-gray-900 hover:text-primary text-base transition-colors ${
                    location.pathname === item.url
                      ? "font-bold text-primary"
                      : ""
                  }`}
                >
                  {item.title}
                  {location.pathname === item.url && (
                    <span className="absolute left-0 bottom-0 w-full h-0.5 bg-primary" />
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-1">
          {!isAdmin && (
            <Button
              variant="ghost"
              onClick={() => navigate("/dashboard/cart")}
              className="relative"
            >
              <ShoppingCart className="h-6 w-6" />
              {cartItems.length > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-blue-500 text-white">
                  {cartItems.length}
                </Badge>
              )}
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Avatar className="size-8 cursor-pointer border-2 border-primary-100 hover:border-primary-200 transition-colors">
                  <AvatarFallback className="bg-primary-100 text-primary-600 font-medium">
                    {(isAdmin ? "Admin" : userName)
                      ?.split(" ")
                      .map((word: string) => word[0].toUpperCase())
                      .slice(0, 2)
                      .join("")}
                  </AvatarFallback>
                </Avatar>
              </motion.div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 mt-2 shadow-xl rounded-xl border border-gray-100">
              <DropdownMenuLabel className="gap-2 cursor-pointer">
                <span className="ml-2">{isAdmin ? "Admin" : userName}</span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gray-100" />
              {!isAdmin && (
                <DropdownMenuItem
                  onClick={() => navigate("/dashboard/profile")}
                  className="gap-2 cursor-pointer"
                >
                  <User className="h-4 w-4 text-gray-500" />
                  <span>View Profile</span>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={handleLogout}
                className="gap-2 cursor-pointer text-red-500 hover:!text-red-600 focus:!text-red-600"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
