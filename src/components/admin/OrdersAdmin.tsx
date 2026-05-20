import { useEffect, useState } from "react";
import { Eye } from "lucide-react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { apiGet } from "../../lib/api";
import { toast } from "sonner";

type ApiOrderCustomer = {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
};

type ApiOrderItem = {
  id: string;
  line_total: number;
  price: number;
  quantity: number;
  unit_price: number;
  order_id: string;
  weekly_menu_entry_id: string;
  meal_name?: string;
  meal_description?: string;
  menu_date?: string;
  day_of_week?: string;
};

type ApiOrder = {
  id: string;
  created_at: string;
  status: string;
  total_price: number;
  billing_address_id: string;
  customer_id: string;
  delivery_address_id: string;
  supplier_id: string;
  weekly_menu_id: string;
  customer?: ApiOrderCustomer;
  items?: ApiOrderItem[];
};

type OrderItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  menuDate?: string;
};

type Order = {
  id: string;
  customerName: string;
  customerEmail: string;
  totalPrice: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
};

function formatDate(value: string) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function mapApiOrderToOrder(apiOrder: ApiOrder): Order {
  return {
    id: apiOrder.id,
    customerName: apiOrder.customer?.full_name || "—",
    customerEmail: apiOrder.customer?.email || "—",
    totalPrice: Number(apiOrder.total_price ?? 0),
    status: apiOrder.status,
    createdAt: apiOrder.created_at,
    items: Array.isArray(apiOrder.items)
      ? apiOrder.items.map((item) => ({
          id: item.id,
          name: item.meal_name || "—",
          price: Number(item.unit_price ?? item.price ?? 0),
          quantity: Number(item.quantity ?? 0),
          menuDate: item.menu_date,
        }))
      : [],
  };
}

export function OrdersAdmin() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      const data = await apiGet<ApiOrder[]>("orders");
      const mapped = Array.isArray(data) ? data.map(mapApiOrderToOrder) : [];
      setOrders(mapped);
    } catch (error) {
      console.error("Orders load error:", error);
      toast.error("Fehler beim Laden der Bestellungen.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Bestellungen</h2>

      {isLoading && (
        <p className="text-sm text-muted-foreground">Wird geladen...</p>
      )}

      {!isLoading && orders.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Noch keine Bestellungen vorhanden.
        </p>
      )}

      {!isLoading && orders.length > 0 && (
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3">Kunde</th>
                <th className="px-4 py-3">Bestellt am</th>
                <th className="px-4 py-3">E-Mail</th>
                <th className="px-4 py-3">Betrag</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Aktion</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, index) => (
                <tr
                  key={order.id}
                  className={index % 2 === 0 ? "bg-background" : "bg-muted/20"}
                >
                  <td className="px-4 py-3 font-medium">{order.customerName}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {order.customerEmail}
                  </td>
                  <td className="px-4 py-3">
                    € {order.totalPrice.toFixed(2).replace(".", ",")}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedOrder(order);
                        setDetailOpen(true);
                      }}
                    >
                      <Eye className="size-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Bestelldetails</DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4 text-sm">
              <div className="space-y-1">
                <p className="font-medium">{selectedOrder.customerName}</p>
                <p className="text-muted-foreground">
                  {selectedOrder.customerEmail}
                </p>
                <p className="text-muted-foreground">
                  Bestellt am: {formatDate(selectedOrder.createdAt)}
                </p>
              </div>

              <div className="rounded-lg border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/40 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      <th className="px-3 py-2">Gericht</th>
                      <th className="px-3 py-2 text-right">Menge</th>
                      <th className="px-3 py-2 text-right">Preis</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items.map((item) => (
                      <tr key={item.id} className="border-b last:border-0">
                        <td className="px-3 py-2">
                          <div className="space-y-1">
                            <p>{item.name}</p>
                            {item.menuDate && (
                              <p className="text-xs text-muted-foreground">
                                Liefertag: {formatDate(item.menuDate)}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-2 text-right">
                          {item.quantity}×
                        </td>
                        <td className="px-3 py-2 text-right">
                          € {(item.price * item.quantity)
                            .toFixed(2)
                            .replace(".", ",")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between font-medium">
                <span>Gesamt</span>
                <span>
                  € {selectedOrder.totalPrice.toFixed(2).replace(".", ",")}
                </span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}