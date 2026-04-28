import { useEffect, useMemo, useState } from "react";
import { ClipboardList, Store, Users, Utensils } from "lucide-react";
import { Sidebar, type AdminSection } from "../Sidebar";

const API_BASE_URL = "http://localhost:8080";

type ApiUser = {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  surname?: string;
  role?: string;
};

type ApiMeal = {
  id: string;
  name: string;
  description?: string;
  price?: number;
  available?: boolean;
};

type ApiOrder = {
  id: string;
  status?: string;
  totalPrice?: number;
  customerId?: string;
};

type ApiWeeklyMenu = {
  id: string;
  title?: string;
  name?: string;
  weekLabel?: string;
};

type AdminDashboardData = {
  users: ApiUser[];
  meals: ApiMeal[];
  orders: ApiOrder[];
  weeklyMenus: ApiWeeklyMenu[];
};

export function AdminDashboard() {
  const [activeSection, setActiveSection] = useState<AdminSection>("dashboard");
  const [data, setData] = useState<AdminDashboardData>({
    users: [],
    meals: [],
    orders: [],
    weeklyMenus: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadAdminData = async () => {
      setIsLoading(true);
      setError("");

      try {
        const [usersRes, mealsRes, ordersRes, weeklyMenusRes] =
          await Promise.all([
            fetch(`${API_BASE_URL}/api/users`),
            fetch(`${API_BASE_URL}/api/meals`),
            fetch(`${API_BASE_URL}/api/orders`),
            fetch(`${API_BASE_URL}/api/weekly-menus`),
          ]);

        if (!usersRes.ok || !mealsRes.ok || !ordersRes.ok || !weeklyMenusRes.ok) {
          throw new Error("Mindestens ein API-Request war nicht erfolgreich.");
        }

        const [users, meals, orders, weeklyMenus] = await Promise.all([
          usersRes.json(),
          mealsRes.json(),
          ordersRes.json(),
          weeklyMenusRes.json(),
        ]);

        setData({
          users: Array.isArray(users) ? users : [],
          meals: Array.isArray(meals) ? meals : [],
          orders: Array.isArray(orders) ? orders : [],
          weeklyMenus: Array.isArray(weeklyMenus) ? weeklyMenus : [],
        });
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Fehler beim Laden der Admin-Daten."
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadAdminData();
  }, []);

  const supplierCount = useMemo(() => {
    return data.users.filter((user) => user.role === "SUPPLIER").length;
  }, [data.users]);

  const customerCount = useMemo(() => {
    return data.users.filter((user) => user.role === "CUSTOMER").length;
  }, [data.users]);

  const stats = [
    {
      title: "Benutzer",
      value: data.users.length,
      description: `${customerCount} Kunden im System`,
      icon: Users,
    },
    {
      title: "Lieferanten",
      value: supplierCount,
      description: "Aktive Supplier-Konten",
      icon: Store,
    },
    {
      title: "Bestellungen",
      value: data.orders.length,
      description: "Gesamtzahl geladener Orders",
      icon: ClipboardList,
    },
    {
      title: "Gerichte",
      value: data.meals.length,
      description: `${data.weeklyMenus.length} Wochenmenüs vorhanden`,
      icon: Utensils,
    },
  ];

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <p className="text-muted-foreground">Admin-Daten werden geladen...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="rounded-xl border border-destructive/40 bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Fehler beim Laden</h2>
          <p className="mt-2 text-sm text-muted-foreground">{error}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Prüfe, ob das Backend auf Port 8080 läuft und CORS korrekt erlaubt ist.
          </p>
        </div>
      );
    }

    switch (activeSection) {
      case "dashboard":
        return (
          <div className="space-y-6">
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {stats.map((stat) => {
                const Icon = stat.icon;

                return (
                  <div
                    key={stat.title}
                    className="rounded-xl border bg-card p-5 text-card-foreground shadow-sm"
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">
                        {stat.title}
                      </span>
                      <Icon className="size-5 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-3xl font-bold">{stat.value}</p>
                      <p className="text-sm text-muted-foreground">
                        {stat.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </section>

            <section className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-xl border bg-card p-5 shadow-sm">
                <h2 className="text-xl font-semibold">Letzte Benutzer</h2>
                <div className="mt-4 space-y-3">
                  {data.users.slice(0, 5).map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div>
                        <p className="font-medium">
                          {user.firstName || user.name || "Unbekannt"}{" "}
                          {user.lastName || user.surname || ""}
                        </p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                      <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium">
                        {user.role || "OHNE ROLLE"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border bg-card p-5 shadow-sm">
                <h2 className="text-xl font-semibold">Letzte Bestellungen</h2>
                <div className="mt-4 space-y-3">
                  {data.orders.slice(0, 5).map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div>
                        <p className="font-medium">{order.id}</p>
                        <p className="text-sm text-muted-foreground">
                          Status: {order.status || "UNBEKANNT"}
                        </p>
                      </div>
                      <span className="text-sm font-medium">
                        {order.totalPrice ?? "-"} €
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        );

      case "meals":
        return (
          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <h2 className="text-xl font-semibold">Speisekarte</h2>
            <div className="mt-4 space-y-3">
              {data.meals.map((meal) => (
                <div
                  key={meal.id}
                  className="rounded-lg border p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium">{meal.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {meal.description || "Keine Beschreibung vorhanden"}
                      </p>
                    </div>
                    <div className="text-right text-sm">
                      <p className="font-semibold">{meal.price ?? "-"} €</p>
                      <p className="text-muted-foreground">
                        {meal.available ? "Verfügbar" : "Nicht verfügbar"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "orders":
        return (
          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <h2 className="text-xl font-semibold">Bestellungen</h2>
            <div className="mt-4 space-y-3">
              {data.orders.map((order) => (
                <div key={order.id} className="rounded-lg border p-4">
                  <p className="font-medium">{order.id}</p>
                  <p className="text-sm text-muted-foreground">
                    Status: {order.status || "UNBEKANNT"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Gesamtpreis: {order.totalPrice ?? "-"} €
                  </p>
                </div>
              ))}
            </div>
          </div>
        );

      case "users":
        return (
          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <h2 className="text-xl font-semibold">Benutzer</h2>
            <div className="mt-4 space-y-3">
              {data.users.map((user) => (
                <div key={user.id} className="rounded-lg border p-4">
                  <p className="font-medium">
                    {user.firstName || user.name || "Unbekannt"}{" "}
                    {user.lastName || user.surname || ""}
                  </p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  <p className="text-sm text-muted-foreground">
                    Rolle: {user.role || "OHNE ROLLE"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        );

      case "settings":
        return (
          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <h2 className="text-xl font-semibold">Einstellungen</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Hier kannst du später Admin-Einstellungen, API-Optionen oder
              Systemparameter pflegen.
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-140px)] overflow-hidden rounded-2xl border bg-background">
      <Sidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />

      <section className="flex-1 p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Admin Bereich</h1>
          <p className="text-muted-foreground">
            Verwalte Benutzer, Speisekarten, Bestellungen und Wochenmenüs.
          </p>
        </div>

        {renderContent()}
      </section>
    </div>
  );
}