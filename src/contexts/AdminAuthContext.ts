import { createContext } from "react";
import type { CurrentAdminResponse, LoginResponse } from "../lib/auth";

export type AdminAuthContextValue = {
  currentAdmin: CurrentAdminResponse | null;
  isAuthenticated: boolean;
  isCheckingAuth: boolean;
  login: (email: string, password: string) => Promise<LoginResponse>;
  logout: () => Promise<void>;
  clearAuth: () => void;
  restoreSession: () => Promise<void>;
};

export const AdminAuthContext = createContext<AdminAuthContextValue | undefined>(undefined);