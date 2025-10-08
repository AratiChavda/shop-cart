import { createContext, useState, useEffect, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";

export interface AuthContextType {
  isAuthenticated: boolean;
  login: (data: Record<string, string>) => void;
  logout: () => void;
  bootstrapped: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [bootstrapped, setBootstrapped] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      setIsAuthenticated(true);
    }
    setBootstrapped(true);
  }, []);

  const login = (data: Record<string, string>) => {
    localStorage.setItem("access_token", data?.jwtToken);
    localStorage.setItem("user_id", data?.username);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_id");
    localStorage.removeItem("role");
    setIsAuthenticated(false);
    navigate("/");
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, login, logout, bootstrapped }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext };
