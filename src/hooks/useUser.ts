import { UserContext, type UserContextType } from "@/context/userContext";
import { useContext } from "react";
export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
