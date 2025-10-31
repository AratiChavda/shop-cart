import { fetchEntityData } from "@/api/apiServices";
import { useUser } from "@/hooks/useUser";
import { createContext, useState, type ReactNode } from "react";

interface CartContextType {
  cartCount: number;
  fetchCartCount: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartCount, setCartCount] = useState(0);
  const { user } = useUser();

  const fetchCartCount = async () => {
    if (!user?.id) return;
    try {
      const payload = {
        class: "ShoppingCart",
        filters: [
          {
            path: "user.id",
            operator: "equals",
            value: user?.id?.toString(),
          },
        ],
        fields: "cartItems.id",
      };
      const response = await fetchEntityData(payload);
      if (response.content?.length) {
        setCartCount(response.content?.[0]?.cartItems?.length || 0);
      }
    } catch (error: any) {
      console.error(error);
    }
  };

  return (
    <CartContext.Provider
      value={{
        fetchCartCount,
        cartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export { CartContext };
