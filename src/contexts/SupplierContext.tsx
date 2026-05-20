import {
  createContext,
  useCallback,
  useMemo,
  useState,
  type ReactNode,
} from "react";

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
  fullName: string;
  email: string;
  phone: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  address: SupplierAddress;
  payment: SupplierPayment;
};

type SupplierContextType = {
  selectedSupplier: Supplier | null;
  selectSupplier: (supplier: Supplier | null) => void;
  clearSupplier: () => void;
};

export const SupplierContext = createContext<SupplierContextType | undefined>(
  undefined,
);

type SupplierProviderProps = {
  children: ReactNode;
};

export function SupplierProvider({ children }: SupplierProviderProps) {
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  const selectSupplier = useCallback((supplier: Supplier | null) => {
    setSelectedSupplier(supplier);
  }, []);

  const clearSupplier = useCallback(() => {
    setSelectedSupplier(null);
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