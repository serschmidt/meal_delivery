import { createContext } from "react";

export type Supplier = {
  id: string;
  fullName: string;
  email: string;
  address?: {
    street: string;
    houseNumber: string;
    postalCode: string;
    city: string;
  };
};

export type SupplierContextType = {
  selectedSupplier: Supplier | null;
  selectSupplier: (supplier: Supplier) => void;
  clearSupplier: () => void;
};

export const SupplierContext = createContext<SupplierContextType | undefined>(
  undefined
);