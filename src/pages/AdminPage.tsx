import { useState } from "react";
import {
  UtensilsCrossed,
  CalendarDays,
  Truck,
  ShoppingBag,
  Users,
  LogOut,
} from "lucide-react";
import { cn } from "../lib/utils";
import { MealsAdmin } from "../components/admin/MealsAdmin";
import { WeeklyMenusAdmin } from "../components/admin/WeeklyMenusAdmin";
import { SuppliersAdmin } from "../components/admin/SuppliersAdmin";
import { OrdersAdmin } from "../components/admin/OrdersAdmin";
import { CustomersAdmin } from "../components/admin/CustomersAdmin";
import { useAdminAuth } from "../hooks/useAdminAuth";

type AdminSection =
  | "meals"
  | "weekly-menus"
  | "suppliers"
  | "orders"
  | "customers";

type NavItem = {
  key: AdminSection;
  label: string;
  icon: React.ReactNode;
};

const navItems: NavItem[] = [
  {
    key: "meals",
    label: "Mahlzeiten",
    icon: <UtensilsCrossed className="size-5" />,
  },
  {
    key: "weekly-menus",
    label: "Wochenmenüs",
    icon: <CalendarDays className="size-5" />,
  },
  {
    key: "suppliers",
    label: "Lieferanten",
    icon: <Truck className="size-5" />,
  },
  {
    key: "orders",
    label: "Bestellungen",
    icon: <ShoppingBag className="size-5" />,
  },
  {
    key: "customers",
    label: "Kunden",
    icon: <Users className="size-5" />,
  },
];

export function AdminPage() {
  const [activeSection, setActiveSection] = useState<AdminSection>("meals");
  const [email, setEmail] = useState("admin@liefermonopol.de");
  const [password, setPassword] = useState("admin");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    currentAdmin,
    isAuthenticated,
    isCheckingAuth,
    login,
    logout,
  } = useAdminAuth();

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login fehlgeschlagen.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleLogout() {
    await logout();
    setError("");
    setPassword("");
  }

  if (isCheckingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/20 p-6">
        <div className="rounded-xl border bg-background px-6 py-4 text-sm text-muted-foreground shadow-sm">
          Sitzung wird geprüft...
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !currentAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/20 p-6">
        <div className="w-full max-w-md rounded-xl border bg-background p-6 shadow-sm">
          <h1 className="text-2xl font-semibold">Admin-Login</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Bitte melde dich an, um den Adminbereich zu öffnen.
          </p>

          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <div className="space-y-2">
              <label htmlFor="admin-email" className="text-sm font-medium">
                E-Mail
              </label>
              <input
                id="admin-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                autoComplete="email"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="admin-password" className="text-sm font-medium">
                Passwort
              </label>
              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                autoComplete="current-password"
                required
              />
            </div>

            {error ? (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Anmeldung läuft..." : "Anmelden"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <aside className="w-56 shrink-0 border-r bg-muted/30">
        <div className="px-4 py-6">
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Administration
            </p>
            <p className="mt-3 text-sm font-medium">{currentAdmin.full_name}</p>
            <p className="text-xs text-muted-foreground">{currentAdmin.email}</p>
          </div>

          <nav className="flex flex-col gap-1">
            {navItems.map((item) => (
              <button
                key={item.key}
                onClick={() => setActiveSection(item.key)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium transition-colors",
                  activeSection === item.key
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>

          <button
            onClick={handleLogout}
            className="mt-6 flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <LogOut className="size-5" />
            Abmelden
          </button>
        </div>
      </aside>

      <main className="flex-1 p-8">
        {activeSection === "meals" && <MealsAdmin />}
        {activeSection === "weekly-menus" && <WeeklyMenusAdmin />}
        {activeSection === "suppliers" && <SuppliersAdmin />}
        {activeSection === "orders" && <OrdersAdmin />}
        {activeSection === "customers" && <CustomersAdmin />}
      </main>
    </div>
  );
}