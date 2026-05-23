import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  getCurrentAdmin,
  loginAdmin,
  logoutAdmin,
  refreshAdminSession,
  type CurrentAdminResponse,
  type LoginResponse,
} from "../lib/auth";
import {
  setAccessToken,
  setRefreshRoute,
  setUnauthorizedHandler,
} from "../lib/api";
import {
  AdminAuthContext,
  type AdminAuthContextValue,
} from "./AdminAuthContext";

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [currentAdmin, setCurrentAdmin] = useState<CurrentAdminResponse | null>(
    null,
  );
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const restoreStartedRef = useRef(false);

  async function restoreSession() {
    try {
      await refreshAdminSession();
      const admin = await getCurrentAdmin();
      setCurrentAdmin(admin);
    } catch {
      setCurrentAdmin(null);
      setAccessToken(null);
    } finally {
      setIsCheckingAuth(false);
    }
  }

  async function login(
    email: string,
    password: string,
  ): Promise<LoginResponse> {
    const result = await loginAdmin(email, password);
    const admin = await getCurrentAdmin();
    setCurrentAdmin(admin);
    return result;
  }

  async function logout() {
    try {
      await logoutAdmin();
    } finally {
      setCurrentAdmin(null);
      setAccessToken(null);
    }
  }

  function clearAuth() {
    setCurrentAdmin(null);
    setAccessToken(null);
  }

  useEffect(() => {
    setRefreshRoute("auth/refresh");

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

  const value = useMemo<AdminAuthContextValue>(
    () => ({
      currentAdmin,
      isAuthenticated: currentAdmin !== null,
      isCheckingAuth,
      login,
      logout,
      clearAuth,
      restoreSession,
    }),
    [currentAdmin, isCheckingAuth],
  );

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}
