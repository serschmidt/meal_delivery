import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import supplierImage from "../assets/liefer.png";
import { useSupplierAuth } from "../hooks/useSupplierAuth";

export function SupplierLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();
  const { login, isAuthenticated, isCheckingAuth, currentSupplier } =
    useSupplierAuth();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      await login(email, password);
      navigate("/supplier");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Login fehlgeschlagen.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isCheckingAuth && isAuthenticated && currentSupplier) {
    return <Navigate to="/supplier" replace />;
  }

  return (
    <div className="w-full px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-5xl space-y-10">
        <section className="rounded-3xl bg-muted/40 px-6 py-10">
          <div className="grid items-center gap-8 lg:grid-cols-[1.4fr_0.9fr]">
            <div className="space-y-5 text-left">
              <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                Partnerbereich
              </p>

              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                Login für Lieferanten
              </h1>

              <div className="space-y-4 text-base text-muted-foreground sm:text-lg">
                <p>
                  Melden Sie sich als Lieferpartner an, um Ihre Bestellungen
                  einzusehen und den Bearbeitungsstatus zu aktualisieren.
                </p>
                <p>
                  Im geschützten Bereich erhalten Sie eine Übersicht Ihrer
                  Bestellungen und Ihrer Kundinnen und Kunden.
                </p>
              </div>
            </div>

            <div className="flex justify-center lg:justify-end">
              <div className="w-full max-w-xs overflow-hidden rounded-3xl border bg-background p-3 shadow-sm sm:max-w-sm">
                <img
                  src={supplierImage}
                  alt="Lieferpartner im geschützten Bereich"
                  className="h-[240px] w-full rounded-2xl object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border bg-background p-6 shadow-sm">
          <div className="mx-auto max-w-md space-y-6">
            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-semibold">Partner-Login</h2>
              <p className="text-sm text-muted-foreground">
                Bitte melden Sie sich mit Ihren Lieferanten-Zugangsdaten an.
              </p>
            </div>

            {errorMessage && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {errorMessage}
              </div>
            )}

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  E-Mail
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@beispiel.de"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Passwort
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Passwort eingeben"
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Anmeldung läuft..." : "Anmelden"}
              </Button>
            </form>

            <div className="rounded-2xl border bg-muted/30 px-4 py-4 text-sm">
              <p className="font-medium text-foreground">
                Noch kein Lieferant?
              </p>
              <p className="mt-2 text-muted-foreground">
                Wenn Sie noch kein Partner von Liefermonopol sind, können Sie
                sich direkt als Lieferant registrieren.
              </p>

              <div className="mt-4">
                <Link to="/lieferant-werden">
                  <Button variant="outline" className="w-full">
                    Als Lieferant registrieren
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}