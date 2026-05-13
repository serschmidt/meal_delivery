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

type OrderItem = {
  mealId: string;
  name: string;
  price: number;
  quantity: number;
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

export function OrdersAdmin() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      const data = await apiGet<Order[]>("orders");
      setOrders(Array.isArray(data) ? data : []);
    } catch {
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
        <div className="rounded-xl border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3">Kunde</th>
                <th className="px-4 py-3">E-Mail</th>
                <th className="px-4 py-3">Betrag</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Datum</th>
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
                    {order.customerEmail}
                  </td>
                  <td className="px-4 py-3">
                    € {order.totalPrice?.toFixed(2).replace(".", ",")}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {order.createdAt?.slice(0, 10)}
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

      {/* Dialog: Bestelldetails */}
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
                  Bestellt am: {selectedOrder.createdAt?.slice(0, 10)}
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
                    {selectedOrder.items?.map((item, i) => (
                      <tr key={i} className="border-b last:border-0">
                        <td className="px-3 py-2">{item.name}</td>
                        <td className="px-3 py-2 text-right">{item.quantity}×</td>
                        <td className="px-3 py-2 text-right">
                          €{" "}
                          {(item.price * item.quantity)
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
                  € {selectedOrder.totalPrice?.toFixed(2).replace(".", ",")}
                </span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
