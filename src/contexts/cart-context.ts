import { createContext } from "react";

export type CartItem = {
  mealId: string;
  weeklyMenuEntryId: string;
  weeklyMenuId: string;
  weeklyMenuLabel?: string;
  deliveryDate: string | null;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  quantity: number;
};

export type CartContextType = {
  cartItems: CartItem[];
  cartItemCount: number;
  addToCart: (item: Omit<CartItem, "quantity">) => void;
  removeFromCart: (mealId: string) => void;
  clearCart: () => void;
  updateQuantity: (mealId: string, quantity: number) => void;
  removeItemsBy: (predicate: (item: CartItem) => boolean) => void;
};

export const CartContext = createContext<CartContextType | undefined>(undefined);