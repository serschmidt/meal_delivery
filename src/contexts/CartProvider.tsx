import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useSupplier } from "./useSupplier";
import {
  CartContext,
  type CartContextType,
  type CartItem,
} from "./cart-context";

const CART_STORAGE_KEY = "meal_delivery_cart";

type CartProviderProps = {
  children: ReactNode;
};

export function CartProvider({ children }: CartProviderProps) {
  const { selectedSupplier } = useSupplier();

  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") return [];

    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (!savedCart) return [];

    try {
      const parsed = JSON.parse(savedCart);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = useCallback(
    (item: Omit<CartItem, "quantity" | "supplierId" | "supplierName">) => {
      setCartItems((prev) => {
        const currentSupplierId = selectedSupplier?.id ?? null;
        const currentSupplierName = selectedSupplier?.fullName ?? null;

        const existingItem = prev.find(
          (cartItem) =>
            cartItem.mealId === item.mealId &&
            cartItem.supplierId === currentSupplierId,
        );

        if (existingItem) {
          return prev.map((cartItem) =>
            cartItem.mealId === item.mealId &&
            cartItem.supplierId === currentSupplierId
              ? { ...cartItem, quantity: cartItem.quantity + 1 }
              : cartItem,
          );
        }

        return [
          ...prev,
          {
            ...item,
            quantity: 1,
            supplierId: currentSupplierId,
            supplierName: currentSupplierName,
          },
        ];
      });
    },
    [selectedSupplier],
  );

  const removeFromCart = useCallback((mealId: string) => {
    setCartItems((prev) => prev.filter((item) => item.mealId !== mealId));
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const updateQuantity = useCallback((mealId: string, quantity: number) => {
    if (quantity <= 0) {
      setCartItems((prev) => prev.filter((item) => item.mealId !== mealId));
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.mealId === mealId ? { ...item, quantity } : item,
      ),
    );
  }, []);

  const cartItemCount = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }, [cartItems]);

  const value: CartContextType = useMemo(
    () => ({
      cartItems,
      cartItemCount,
      addToCart,
      removeFromCart,
      clearCart,
      updateQuantity, // NEU
    }),
    [
      cartItems,
      cartItemCount,
      addToCart,
      removeFromCart,
      clearCart,
      updateQuantity,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
