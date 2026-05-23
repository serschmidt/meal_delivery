import { useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { SupplierOrdersPanel } from "../components/supplier/SupplierOrdersPanel";
import { SupplierProfilePanel } from "../components/supplier/SupplierProfilePanel";
import { SupplierPasswordPanel } from "../components/supplier/SupplierPasswordPanel";
import { Button } from "../components/ui/button";
import { useSupplierAuth } from "../hooks/useSupplierAuth";

type SettingsView = "none" | "profile" | "password";

export function SupplierPage() {
  const {
    currentSupplier,
    isAuthenticated,
    isCheckingAuth,
    logout,
  } = useSupplierAuth();

  const [settingsView, setSettingsView] = useState<SettingsView>("none");
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const supplierName = useMemo(() => {
    if (!currentSupplier?.full_name) {
      return "Partner";
    }

    return currentSupplier.full_name;
  }, [currentSupplier]);

  if (isCheckingAuth) {
    return (
      <main className="mx-auto flex min-h-[60vh] w-full max-w-7xl items-center justify-center px-4 py-10">
        <div className="text-sm text-muted-foreground">
          Partnerbereich wird geladen...
        </div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/partner-login" replace />;
  }

  async function handleLogout() {
    try {
      setIsLoggingOut(true);
      await logout();
    } finally {
      setIsLoggingOut(false);
    }
  }

  function toggleSettingsView(nextView: Exclude<SettingsView, "none">) {
    setSettingsView((current) => (current === nextView ? "none" : nextView));
  }

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 md:px-6 lg:px-8">
      <section className="rounded-[2rem] border bg-background px-6 py-8 shadow-sm md:px-8 md:py-10">
        <div className="flex flex-col gap-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Partnerbereich
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="shrink-0 rounded-full"
            >
              {isLoggingOut ? "Abmelden..." : "Abmelden"}
            </Button>
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl font-semibold tracking-tight text-foreground md:text-5xl lg:text-6xl">
              Willkommen, {supplierName}
            </h1>

            <p className="max-w-3xl text-base text-muted-foreground md:text-lg">
              Hier sehen Sie Ihre Bestellungen und können deren Status
              aktualisieren.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border bg-background px-6 py-6 shadow-sm md:px-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight">
              Einstellungen
            </h2>
            <p className="text-sm text-muted-foreground md:text-base">
              Verwalten Sie hier bei Bedarf Ihr Profil und Ihr Passwort.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              type="button"
              variant={settingsView === "profile" ? "default" : "outline"}
              onClick={() => toggleSettingsView("profile")}
              className="rounded-full"
            >
              Profil bearbeiten
            </Button>

            <Button
              type="button"
              variant={settingsView === "password" ? "default" : "outline"}
              onClick={() => toggleSettingsView("password")}
              className="rounded-full"
            >
              Passwort ändern
            </Button>
          </div>
        </div>
      </section>

      {settingsView === "profile" ? (
        <SupplierProfilePanel onClose={() => setSettingsView("none")} />
      ) : null}

      {settingsView === "password" ? (
        <SupplierPasswordPanel onClose={() => setSettingsView("none")} />
      ) : null}

      <SupplierOrdersPanel />
    </main>
  );
}