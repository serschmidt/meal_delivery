import { createContext } from "react";

export type CartItem = {
  mealId: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  quantity: number;
  supplierId: string | null;
  supplierName: string | null;
};

export type CartContextType = {
  cartItems: CartItem[];
  cartItemCount: number;
  addToCart: (
    item: Omit<CartItem, "quantity" | "supplierId" | "supplierName">
  ) => void;
  removeFromCart: (mealId: string) => void;
  clearCart: () => void;
};

export const CartContext = createContext<CartContextType | undefined>(undefined);