import { useContext } from "react";
import { SupplierContext } from "./supplier-context";

export function useSupplier() {
  const context = useContext(SupplierContext);

  if (!context) {
    throw new Error("useSupplier must be used within a SupplierProvider");
  }

  return context;
}