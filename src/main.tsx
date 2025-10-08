import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter } from "react-router-dom";
import { getClientKey, clients } from "@/config/clients.ts";
import { AuthProvider } from "@/context/authContext.tsx";
import { CartProvider } from "@/context/cartContext.tsx";
import { Toaster } from "@/components/ui/sonner.tsx";
import { UserProvider } from "./context/userContext.tsx";

const clientKey = getClientKey();
const theme = clients[clientKey];
if (theme?.variables) {
  Object.entries(theme.variables).forEach(([key, val]) =>
    document.documentElement.style.setProperty(key, val)
  );
}

(window as any).__CLIENT_KEY__ = clientKey;

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <StrictMode>
      <AuthProvider>
        <CartProvider>
          <UserProvider>
            <App />
            <Toaster />
          </UserProvider>
        </CartProvider>
      </AuthProvider>
    </StrictMode>
  </BrowserRouter>
);
