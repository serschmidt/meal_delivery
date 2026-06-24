import { createContext } from "react";

export type SupplierAddress = {
  street: string;
  houseNumber: string;
  postalCode: string;
  city: string;
};

export type SupplierPayment = {
  accountHolder: string | null;
  iban: string | null;
  paypalLink: string | null;
};

export type Supplier = {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  fullName: string;
  businessName?: string | null;
  email: string;
  phone: string | null;
  website?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  address: SupplierAddress;
  payment: SupplierPayment;
};

export type SupplierContextType = {
  selectedSupplier: Supplier | null;
  selectSupplier: (supplier: Supplier | null) => void;
  clearSupplier: () => void;
};

export const SupplierContext = createContext<SupplierContextType | undefined>(
  undefined,
);