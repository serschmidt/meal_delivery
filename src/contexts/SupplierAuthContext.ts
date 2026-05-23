import { createContext } from "react";
import type {
  CurrentSupplierResponse,
  SupplierLoginResponse,
} from "../lib/supplier-auth";

export type SupplierAuthContextValue = {
  currentSupplier: CurrentSupplierResponse | null;
  isAuthenticated: boolean;
  isCheckingAuth: boolean;
  login: (email: string, password: string) => Promise<SupplierLoginResponse>;
  logout: () => Promise<void>;
  clearAuth: () => void;
  restoreSession: () => Promise<void>;
};

export const SupplierAuthContext =
  createContext<SupplierAuthContextValue | undefined>(undefined);