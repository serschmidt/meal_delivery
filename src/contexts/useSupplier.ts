import { useContext } from "react";
import { SupplierContext } from "./SupplierContext";

export function useSupplier() {
  const context = useContext(SupplierContext);

  if (context === undefined) {
    throw new Error("useSupplier must be used within a SupplierProvider");
  }

  return context;
}