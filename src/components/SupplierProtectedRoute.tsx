import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useSupplierAuth } from "../hooks/useSupplierAuth";

export function SupplierProtectedRoute({
  children,
}: {
  children: ReactNode;
}) {
  const { isAuthenticated, isCheckingAuth } = useSupplierAuth();

  if (isCheckingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/20 p-6">
        <div className="rounded-xl border bg-background px-6 py-4 text-sm text-muted-foreground shadow-sm">
          Sitzung wird geprüft...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/partner-login" replace />;
  }

  return <>{children}</>;
}