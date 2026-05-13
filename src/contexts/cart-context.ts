import { createContext } from "react";

export type CartItem = {
  mealId: string;
  weeklyMenuEntryId: string;
  weeklyMenuId: string;
  weeklyMenuLabel?: string;
  deliveryDate?: string | null;
  name: string;           // NEU
  description: string;    // NEU
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
  updateQuantity: (mealId: string, quantity: number) => void;
};

export const CartContext = createContext<CartContextType | undefined>(undefined);