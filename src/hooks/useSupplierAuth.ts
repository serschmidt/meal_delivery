import { useContext } from "react";
import { SupplierAuthContext } from "../contexts/SupplierAuthContext";

export function useSupplierAuth() {
  const context = useContext(SupplierAuthContext);

  if (!context) {
    throw new Error("useSupplierAuth must be used inside SupplierAuthProvider");
  }

  return context;
}