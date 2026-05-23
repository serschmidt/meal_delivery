import { useEffect, useMemo, useState } from "react";
import {
  getSupplierOrders,
  updateSupplierOrderStatus,
  type SupplierOrder,
  type SupplierOrderStatus,
} from "../../lib/supplier-orders";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";

const statusOptions: Array<{
  value: SupplierOrderStatus | "ALL";
  label: string;
}> = [
  { value: "ALL", label: "Alle" },
  { value: "PENDING", label: "Eingegangen" },
  { value: "CONFIRMED", label: "Bestätigt" },
  { value: "PREPARED", label: "Vorbereitet" },
  { value: "DELIVERED", label: "Geliefert" },
  { value: "CANCELLED", label: "Storniert" },
];

const pageSizeOptions = [5, 10, 20];

function formatPrice(value: number) {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("de-DE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getStatusLabel(status: SupplierOrderStatus) {
  switch (status) {
    case "PENDING":
      return "Eingegangen";
    case "CONFIRMED":
      return "Bestätigt";
    case "PREPARED":
      return "Vorbereitet";
    case "DELIVERED":
      return "Geliefert";
    case "CANCELLED":
      return "Storniert";
    default:
      return status;
  }
}

function getStatusBadgeClass(status: SupplierOrderStatus) {
  switch (status) {
    case "PENDING":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "CONFIRMED":
      return "border-blue-200 bg-blue-50 text-blue-700";
    case "PREPARED":
      return "border-violet-200 bg-violet-50 text-violet-700";
    case "DELIVERED":
      return "border-green-200 bg-green-50 text-green-700";
    case "CANCELLED":
      return "border-red-200 bg-red-50 text-red-700";
    default:
      return "border-muted bg-muted/30 text-foreground";
  }
}

function getNextActions(status: SupplierOrderStatus): SupplierOrderStatus[] {
  switch (status) {
    case "PENDING":
      return ["CONFIRMED", "CANCELLED"];
    case "CONFIRMED":
      return ["PREPARED", "CANCELLED"];
    case "PREPARED":
      return ["DELIVERED"];
    case "DELIVERED":
    case "CANCELLED":
    default:
      return [];
  }
}

export function SupplierOrdersPanel() {
  const [orders, setOrders] = useState<SupplierOrder[]>([]);
  const [statusFilter, setStatusFilter] = useState<SupplierOrderStatus | "ALL">(
    "ALL",
  );
  const [limit, setLimit] = useState(10);
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  async function loadOrders() {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const result = await getSupplierOrders({
        status: statusFilter,
        limit,
        offset,
      });

      setOrders(result.items);
      setTotal(result.pagination.total);
      setHasMore(result.pagination.has_more);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Bestellungen konnten nicht geladen werden.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, [statusFilter, limit, offset]);

  async function handleStatusUpdate(
    orderId: string,
    nextStatus: SupplierOrderStatus,
  ) {
    setUpdatingOrderId(orderId);
    setErrorMessage("");

    try {
      const updatedOrder = await updateSupplierOrderStatus(orderId, nextStatus);

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.id === updatedOrder.id ? updatedOrder : order,
        ),
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Status konnte nicht geändert werden.",
      );
    } finally {
      setUpdatingOrderId(null);
    }
  }

  const visibleRangeLabel = useMemo(() => {
    if (total === 0) {
      return "0 von 0";
    }

    const start = offset + 1;
    const end = Math.min(offset + orders.length, total);

    return `${start}–${end} von ${total}`;
  }, [offset, orders.length, total]);

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border bg-background p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              Bestellungen
            </p>
            <h2 className="mt-2 text-2xl font-semibold">
              Ihre aktuellen Bestellungen
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Filtern Sie nach Status und aktualisieren Sie den
              Bearbeitungsstand.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="space-y-2">
              <label htmlFor="status-filter" className="text-sm font-medium">
                Status
              </label>
              <select
                id="status-filter"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(
                    e.target.value as SupplierOrderStatus | "ALL",
                  );
                  setOffset(0);
                }}
                className="rounded-lg border bg-background px-3 py-2 text-sm"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="page-size" className="text-sm font-medium">
                Pro Seite
              </label>
              <select
                id="page-size"
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setOffset(0);
                }}
                className="rounded-lg border bg-background px-3 py-2 text-sm"
              >
                {pageSizeOptions.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between border-t pt-4 text-sm text-muted-foreground">
          <span>{visibleRangeLabel}</span>
          <span>
            Seite {currentPage} von {totalPages}
          </span>
        </div>
      </div>

      {errorMessage ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      ) : null}

      {isLoading ? (
        <div className="rounded-3xl border bg-background p-6 text-sm text-muted-foreground shadow-sm">
          Bestellungen werden geladen...
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-3xl border bg-background p-6 text-sm text-muted-foreground shadow-sm">
          Für den gewählten Filter wurden keine Bestellungen gefunden.
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const nextActions = getNextActions(order.status);

            return (
              <article
                key={order.id}
                className="rounded-3xl border bg-background p-6 shadow-sm"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-lg font-semibold">
                        Bestellung {order.id.slice(0, 8).toUpperCase()}
                      </h3>

                      <span
                        className={cn(
                          "rounded-full border px-3 py-1 text-xs font-medium",
                          getStatusBadgeClass(order.status),
                        )}
                      >
                        {getStatusLabel(order.status)}
                      </span>
                    </div>

                    <div className="grid gap-2 text-sm text-muted-foreground lg:grid-cols-2">
                      <p>Erstellt: {formatDate(order.created_at)}</p>
                      <p>Gesamtpreis: {formatPrice(order.total_price)}</p>
                      <p>Kunde: {order.customer.full_name}</p>
                      <p>E-Mail: {order.customer.email}</p>
                      <p>Telefon: {order.customer.phone ?? "—"}</p>
                    </div>

                    <div className="mt-4 grid gap-4 lg:grid-cols-2">
                      <div className="rounded-2xl bg-muted/30 p-4">
                        <p className="text-sm font-medium text-foreground">
                          Lieferadresse
                        </p>
                        <div className="mt-2 text-sm text-muted-foreground">
                          <p>
                            {order.delivery_address.street}{" "}
                            {order.delivery_address.house_number}
                          </p>
                          <p>
                            {order.delivery_address.postal_code}{" "}
                            {order.delivery_address.city}
                          </p>
                        </div>
                      </div>

                      <div className="rounded-2xl bg-muted/30 p-4">
                        <p className="text-sm font-medium text-foreground">
                          Rechnungsadresse
                        </p>
                        <div className="mt-2 text-sm text-muted-foreground">
                          <p>
                            {order.billing_address.street}{" "}
                            {order.billing_address.house_number}
                          </p>
                          <p>
                            {order.billing_address.postal_code}{" "}
                            {order.billing_address.city}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {nextActions.map((status) => (
                      <Button
                        key={status}
                        variant="outline"
                        onClick={() => handleStatusUpdate(order.id, status)}
                        disabled={updatingOrderId === order.id}
                      >
                        {updatingOrderId === order.id
                          ? "Aktualisierung..."
                          : getStatusLabel(status)}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="mt-6 border-t pt-4">
                  <p className="text-sm font-medium">Bestellpositionen</p>

                  <div className="mt-3 space-y-3">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-2xl bg-muted/30 px-4 py-3"
                      >
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <p className="font-medium">{item.meal_name}</p>
                            <p className="text-sm text-muted-foreground">
                              {item.meal_description}
                            </p>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {item.day_of_week}, {item.menu_date}
                            </p>
                          </div>

                          <div className="text-sm text-muted-foreground sm:text-right">
                            <p>Menge: {item.quantity}</p>
                            <p>Einzelpreis: {formatPrice(item.unit_price)}</p>
                            <p>Zeile: {formatPrice(item.line_total)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <div className="flex flex-col gap-3 rounded-3xl border bg-background p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <Button
          variant="outline"
          onClick={() => setOffset((current) => Math.max(0, current - limit))}
          disabled={offset === 0 || isLoading}
        >
          Vorherige Seite
        </Button>

        <p className="text-sm text-muted-foreground">{visibleRangeLabel}</p>

        <Button
          variant="outline"
          onClick={() => setOffset((current) => current + limit)}
          disabled={!hasMore || isLoading}
        >
          Nächste Seite
        </Button>
      </div>
    </section>
  );
}
