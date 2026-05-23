import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  getCurrentSupplier,
  loginSupplier,
  logoutSupplier,
  refreshSupplierSession,
  type CurrentSupplierResponse,
  type SupplierLoginResponse,
} from "../lib/supplier-auth";
import {
  setAccessToken,
  setRefreshRoute,
  setUnauthorizedHandler,
} from "../lib/api";
import {
  SupplierAuthContext,
  type SupplierAuthContextValue,
} from "./SupplierAuthContext";

export function SupplierAuthProvider({ children }: { children: ReactNode }) {
  const [currentSupplier, setCurrentSupplier] =
    useState<CurrentSupplierResponse | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const restoreStartedRef = useRef(false);

  async function restoreSession() {
    try {
      await refreshSupplierSession();
      const supplier = await getCurrentSupplier();
      setCurrentSupplier(supplier);
    } catch {
      setCurrentSupplier(null);
      setAccessToken(null);
    } finally {
      setIsCheckingAuth(false);
    }
  }

  async function login(
    email: string,
    password: string,
  ): Promise<SupplierLoginResponse> {
    const result = await loginSupplier(email, password);
    const supplier = await getCurrentSupplier();
    setCurrentSupplier(supplier);
    return result;
  }

  async function logout() {
    try {
      await logoutSupplier();
    } finally {
      setCurrentSupplier(null);
      setAccessToken(null);
    }
  }

  function clearAuth() {
    setCurrentSupplier(null);
    setAccessToken(null);
  }

  useEffect(() => {
    setRefreshRoute("supplier-auth/refresh");

    if (restoreStartedRef.current) {
      return;
    }

    restoreStartedRef.current = true;
    restoreSession();
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearAuth();
      setIsCheckingAuth(false);
    });

    return () => {
      setUnauthorizedHandler(null);
    };
  }, []);

  const value = useMemo<SupplierAuthContextValue>(
    () => ({
      currentSupplier,
      isAuthenticated: currentSupplier !== null,
      isCheckingAuth,
      login,
      logout,
      clearAuth,
      restoreSession,
    }),
    [currentSupplier, isCheckingAuth],
  );

  return (
    <SupplierAuthContext.Provider value={value}>
      {children}
    </SupplierAuthContext.Provider>
  );
}
