import {
  useCallback,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { SupplierContext, type Supplier } from "./SupplierContext";

type SupplierProviderProps = {
  children: ReactNode;
};

const SELECTED_SUPPLIER_STORAGE_KEY = "selectedSupplier";

function readStoredSupplier(): Supplier | null {
  try {
    const rawValue = window.localStorage.getItem(SELECTED_SUPPLIER_STORAGE_KEY);

    if (!rawValue) {
      return null;
    }

    return JSON.parse(rawValue) as Supplier;
  } catch {
    return null;
  }
}

export function SupplierProvider({ children }: SupplierProviderProps) {
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(() =>
    readStoredSupplier(),
  );

  const selectSupplier = useCallback((supplier: Supplier | null) => {
    setSelectedSupplier(supplier);

    try {
      if (supplier) {
        window.localStorage.setItem(
          SELECTED_SUPPLIER_STORAGE_KEY,
          JSON.stringify(supplier),
        );
      } else {
        window.localStorage.removeItem(SELECTED_SUPPLIER_STORAGE_KEY);
      }
    } catch {
      // optional: ignore storage errors
    }
  }, []);

  const clearSupplier = useCallback(() => {
    setSelectedSupplier(null);

    try {
      window.localStorage.removeItem(SELECTED_SUPPLIER_STORAGE_KEY);
    } catch {
      // optional: ignore storage errors
    }
  }, []);

  const value = useMemo(
    () => ({
      selectedSupplier,
      selectSupplier,
      clearSupplier,
    }),
    [selectedSupplier, selectSupplier, clearSupplier],
  );

  return (
    <SupplierContext.Provider value={value}>
      {children}
    </SupplierContext.Provider>
  );
}