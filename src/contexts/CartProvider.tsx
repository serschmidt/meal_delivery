import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import {
  CartContext,
  type CartContextType,
  type CartItem,
} from "./cart-context";
import { isOrderable } from "../lib/orderability";

const CART_STORAGE_KEY = "meal_delivery_cart";

type CartProviderProps = {
  children: ReactNode;
};

type SanitizedCartResult = {
  items: CartItem[];
  removedCount: number;
};

function sanitizeStoredCartItem(raw: unknown): CartItem | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const item = raw as Record<string, unknown>;

  if (
    typeof item.mealId !== "string" ||
    typeof item.weeklyMenuEntryId !== "string" ||
    typeof item.weeklyMenuId !== "string" ||
    typeof item.name !== "string" ||
    typeof item.description !== "string" ||
    typeof item.price !== "number" ||
    typeof item.quantity !== "number"
  ) {
    return null;
  }

  return {
    mealId: item.mealId,
    weeklyMenuEntryId: item.weeklyMenuEntryId,
    weeklyMenuId: item.weeklyMenuId,
    weeklyMenuLabel:
      typeof item.weeklyMenuLabel === "string" ? item.weeklyMenuLabel : undefined,
    deliveryDate:
      typeof item.deliveryDate === "string" || item.deliveryDate === null
        ? item.deliveryDate
        : null,
    name: item.name,
    description: item.description,
    price: item.price,
    imageUrl: typeof item.imageUrl === "string" ? item.imageUrl : undefined,
    quantity: item.quantity,
  };
}

function sanitizeCartItems(items: CartItem[]): SanitizedCartResult {
  const validItems = items.filter((item) => isOrderable(item.deliveryDate));

  return {
    items: validItems,
    removedCount: items.length - validItems.length,
  };
}

function readCartFromStorage(): SanitizedCartResult {
  if (typeof window === "undefined") {
    return { items: [], removedCount: 0 };
  }

  const savedCart = localStorage.getItem(CART_STORAGE_KEY);
  if (!savedCart) {
    return { items: [], removedCount: 0 };
  }

  try {
    const parsed = JSON.parse(savedCart);
    if (!Array.isArray(parsed)) {
      return { items: [], removedCount: 0 };
    }

    const migratedItems = parsed
      .map(sanitizeStoredCartItem)
      .filter((item): item is CartItem => item !== null);

    return sanitizeCartItems(migratedItems);
  } catch {
    return { items: [], removedCount: 0 };
  }
}

export function CartProvider({ children }: CartProviderProps) {
  const [initialCartState] = useState<SanitizedCartResult>(() =>
    readCartFromStorage(),
  );

  const [cartItems, setCartItems] = useState<CartItem[]>(initialCartState.items);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    if (initialCartState.removedCount <= 0) return;

    toast.warning("Warenkorb wurde aktualisiert", {
      description:
        initialCartState.removedCount === 1
          ? "Eine nicht mehr bestellbare Mahlzeit wurde aus dem Warenkorb entfernt."
          : `${initialCartState.removedCount} nicht mehr bestellbare Mahlzeiten wurden aus dem Warenkorb entfernt.`,
    });
  }, [initialCartState.removedCount]);

  const addToCart = useCallback((item: Omit<CartItem, "quantity">) => {
    setCartItems((prev) => {
      const existingItem = prev.find(
        (cartItem) =>
          cartItem.mealId === item.mealId &&
          cartItem.weeklyMenuEntryId === item.weeklyMenuEntryId,
      );

      if (existingItem) {
        return prev.map((cartItem) =>
          cartItem.mealId === item.mealId &&
          cartItem.weeklyMenuEntryId === item.weeklyMenuEntryId
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem,
        );
      }

      return [
        ...prev,
        {
          ...item,
          quantity: 1,
        },
      ];
    });
  }, []);

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

  const removeItemsBy = useCallback((predicate: (item: CartItem) => boolean) => {
    setCartItems((prev) => prev.filter((item) => !predicate(item)));
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
      updateQuantity,
      removeItemsBy,
    }),
    [
      cartItems,
      cartItemCount,
      addToCart,
      removeFromCart,
      clearCart,
      updateQuantity,
      removeItemsBy,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}