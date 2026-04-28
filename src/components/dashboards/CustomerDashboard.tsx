import { Heart, MapPin, Package, ShoppingBag } from "lucide-react";
import { Suppliers } from "../Suppliers";
import { Menu } from "../Menu";

export function CustomerDashboard() {
  const stats = [
    {
      title: "Meine Bestellungen",
      value: "8",
      description: "Bisher erfolgreich bestellt",
      icon: ShoppingBag,
    },
    {
      title: "Aktive Lieferung",
      value: "1",
      description: "Derzeit auf dem Weg",
      icon: Package,
    },
    {
      title: "Favoriten",
      value: "5",
      description: "Gespeicherte Lieblingsgerichte",
      icon: Heart,
    },
    {
      title: "Adressen",
      value: "2",
      description: "Hinterlegte Lieferadressen",
      icon: MapPin,
    },
  ];

  const recentOrders = [
    {
      id: "#1008",
      restaurant: "Schnitzelhaus Xanten",
      status: "Unterwegs",
      total: "18.90 €",
    },
    {
      id: "#1007",
      restaurant: "Pizzeria Napoli",
      status: "Geliefert",
      total: "24.50 €",
    },
    {
      id: "#1006",
      restaurant: "Asia Wok",
      status: "Geliefert",
      total: "15.20 €",
    },
  ];

  return (
    <div className="space-y-8">
      <section className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Customer Dashboard
        </h1>
        <p className="text-muted-foreground">
          Entdecke Gerichte, bestelle schnell und behalte deine Lieferungen im Blick.
        </p>
      </section>

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

      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <h2 className="text-xl font-semibold">Letzte Bestellungen</h2>
          <div className="mt-4 space-y-3">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="rounded-lg border p-4"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium">{order.id}</p>
                    <p className="text-sm text-muted-foreground">
                      {order.restaurant}
                    </p>
                  </div>
                  <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium">
                    {order.status}
                  </span>
                </div>
                <p className="mt-2 text-sm font-medium">{order.total}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <h2 className="text-xl font-semibold">Schnellzugriff</h2>
          <div className="mt-4 space-y-3 text-sm text-muted-foreground">
            <div className="rounded-lg border p-4">
              <p className="font-medium text-foreground">Standardadresse</p>
              <p className="mt-1">Musterstraße 12, 46509 Xanten</p>
            </div>

            <div className="rounded-lg border p-4">
              <p className="font-medium text-foreground">Bevorzugte Zahlung</p>
              <p className="mt-1">PayPal</p>
            </div>

            <div className="rounded-lg border p-4">
              <p className="font-medium text-foreground">Meistbestellt</p>
              <p className="mt-1">Schnitzel mit Pommes</p>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold">Lieferanten in deiner Nähe</h2>
        <Suppliers searchValue={""} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold">Menü</h2>
        <Menu />
      </section>
    </div>
  );
}