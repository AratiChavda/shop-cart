import { createContext, useContext, useState, type ReactNode } from "react";

interface CartItem {
  jcode: string;
  name: string;
  issue: string;
  description: string;
  quantity: number;
  price: number;
  image: string;
  customerCategory: "Individual" | "Institutional";
  region: string;
}

interface CartContextType {
  cartItems: CartItem[];
  totalPrice: number;
  addToCart: (item: CartItem) => void;
  removeFromCart: (jcode: string) => void;
  updateCartItem: (jcode: string, updatedItem: Partial<CartItem>) => void;
  updateTotalPrice: (price: number) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [totalPrice, setTotalPrice] = useState<number>(0);

  const addToCart = (item: CartItem) => {
    setCartItems((prev) => {
      const existingItem = prev.find((i) => i.jcode === item.jcode);
      if (existingItem) {
        return prev.map((i) =>
          i.jcode === item.jcode
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      }
      return [...prev, item];
    });
  };

  const removeFromCart = (jcode: string) => {
    setCartItems((prev) => prev.filter((item) => item.jcode !== jcode));
  };

  const updateCartItem = (jcode: string, updatedItem: Partial<CartItem>) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.jcode === jcode ? { ...item, ...updatedItem } : item
      )
    );
  };

  const updateTotalPrice = (price: number) => {
    setTotalPrice(price);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        totalPrice,
        addToCart,
        removeFromCart,
        updateCartItem,
        updateTotalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
