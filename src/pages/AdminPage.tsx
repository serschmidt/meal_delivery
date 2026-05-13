import { useState } from "react";
import { UtensilsCrossed, CalendarDays, Truck, ShoppingBag } from "lucide-react";
import { cn } from "../lib/utils";
import { MealsAdmin } from "../components/admin/MealsAdmin";
import { WeeklyMenusAdmin } from "@/components/admin/WeeklyMenusAdmin";
import { SuppliersAdmin } from "@/components/admin/SuppliersAdmin";
import { OrdersAdmin } from "@/components/admin/OrdersAdmin";

type AdminSection = "meals" | "weekly-menus" | "suppliers" | "orders";

type NavItem = {
  key: AdminSection;
  label: string;
  icon: React.ReactNode;
};

const navItems: NavItem[] = [
  { key: "meals", label: "Mahlzeiten", icon: <UtensilsCrossed className="size-5" /> },
  { key: "weekly-menus", label: "Wochenmenüs", icon: <CalendarDays className="size-5" /> },
  { key: "suppliers", label: "Lieferanten", icon: <Truck className="size-5" /> },
  { key: "orders", label: "Bestellungen", icon: <ShoppingBag className="size-5" /> },
];

export function AdminPage() {
  const [activeSection, setActiveSection] = useState<AdminSection>("meals");

  return (
    <div className="flex min-h-screen">
      <aside className="w-56 shrink-0 border-r bg-muted/30">
        <div className="px-4 py-6">
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Administration
          </p>
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => (
              <button
                key={item.key}
                onClick={() => setActiveSection(item.key)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors text-left",
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
        </div>
      </aside>

      <main className="flex-1 p-8">
        {activeSection === "meals" && <MealsAdmin />}
        {activeSection === "weekly-menus" && <WeeklyMenusAdmin />}
        {activeSection === "suppliers" && <SuppliersAdmin />}
        {activeSection === "orders" && <OrdersAdmin />}
      </main>
    </div>
  );
}