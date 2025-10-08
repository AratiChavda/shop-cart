import { useEffect } from "react";
import { currentClient } from "@/config/clients";

export const useClient = () => {
  useEffect(() => {
    if (!currentClient || !currentClient.variables) return;

    const root = document.documentElement;
    Object.entries(currentClient.variables).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
  }, []);
  
  return currentClient || {};
};
