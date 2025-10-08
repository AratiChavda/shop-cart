import { createContext, useEffect, useState, type ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import { fetchUserDetails } from "@/api/apiServices";
import { USER_ROLE } from "@/constant/userRoles";
import type { User } from "@/types";

export interface UserContextType {
  user: User | null;
  role: string | null;
  isAdmin: boolean;
  bootstrapped: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: User;
}

export const UserProvider = ({ children }: UserProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const { isAuthenticated, bootstrapped } = useAuth();

  useEffect(() => {
    const fetchRole = async () => {
      const token = localStorage.getItem("access_token");
      if (!isAuthenticated || !token) {
        setUser(null);
        setRole(null);
        return;
      }

      try {
        const response = (await fetchUserDetails(token)) as ApiResponse;
        const userRole = response?.data?.userRoles?.[0]?.role?.name;
        setUser(response?.data);
        setRole(userRole);
      } catch (err) {
        console.error("Failed to fetch user details", err);
        setUser(null);
        setRole(null);
        localStorage.removeItem("access_token");
      }
    };

    fetchRole();
  }, [isAuthenticated]);

  const isAdmin = role === USER_ROLE.SUPER_ADMIN || role === USER_ROLE.ADMIN;

  return (
    <UserContext.Provider value={{ user, role, isAdmin, bootstrapped }}>
      {children}
    </UserContext.Provider>
  );
};

export { UserContext };
