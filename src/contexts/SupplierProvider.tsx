import { useState, type ReactNode } from "react";
import {
  SupplierContext,
  type Supplier,
} from "./supplier-context";

type SupplierProviderProps = {
  children: ReactNode;
};

export function SupplierProvider({ children }: SupplierProviderProps) {
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  const selectSupplier = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
  };

  const clearSupplier = () => {
    setSelectedSupplier(null);
  };

  return (
    <SupplierContext.Provider
      value={{ selectedSupplier, selectSupplier, clearSupplier }}
    >
      {children}
    </SupplierContext.Provider>
  );
}