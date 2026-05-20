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

type ApiCustomer = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  street: string;
  house_number: string;
  postal_code: string;
  city: string;
  notes: string;
  created_at: string;
  updated_at: string;
};

type Customer = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  street: string;
  houseNumber: string;
  postalCode: string;
  city: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
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

function mapApiCustomerToCustomer(apiCustomer: ApiCustomer): Customer {
  return {
    id: apiCustomer.id,
    fullName: apiCustomer.full_name || "—",
    email: apiCustomer.email || "—",
    phone: apiCustomer.phone || "—",
    street: apiCustomer.street || "",
    houseNumber: apiCustomer.house_number || "",
    postalCode: apiCustomer.postal_code || "",
    city: apiCustomer.city || "",
    notes: apiCustomer.notes || "",
    createdAt: apiCustomer.created_at || "",
    updatedAt: apiCustomer.updated_at || "",
  };
}

export function CustomersAdmin() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);

  const loadCustomers = async () => {
    try {
      setIsLoading(true);
      const data = await apiGet<ApiCustomer[]>("customers");
      const mapped = Array.isArray(data) ? data.map(mapApiCustomerToCustomer) : [];
      setCustomers(mapped);
    } catch (error) {
      console.error("Customers load error:", error);
      toast.error("Fehler beim Laden der Kunden.");
    } finally {
      setIsLoading(false);
    }
  };

  const openCustomerDetails = async (customerId: string) => {
    try {
      setDetailOpen(true);
      setIsDetailLoading(true);

      const data = await apiGet<ApiCustomer>(`customers/${customerId}`);
      setSelectedCustomer(mapApiCustomerToCustomer(data));
    } catch (error) {
      console.error("Customer detail error:", error);
      toast.error("Fehler beim Laden der Kundendetails.");
      setDetailOpen(false);
    } finally {
      setIsDetailLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Kunden</h2>

      {isLoading && (
        <p className="text-sm text-muted-foreground">Wird geladen...</p>
      )}

      {!isLoading && customers.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Noch keine Kunden vorhanden.
        </p>
      )}

      {!isLoading && customers.length > 0 && (
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">E-Mail</th>
                <th className="px-4 py-3">Telefon</th>
                <th className="px-4 py-3">Ort</th>
                <th className="px-4 py-3">Erstellt am</th>
                <th className="px-4 py-3 text-right">Aktion</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer, index) => (
                <tr
                  key={customer.id}
                  className={index % 2 === 0 ? "bg-background" : "bg-muted/20"}
                >
                  <td className="px-4 py-3 font-medium">{customer.fullName}</td>
                  <td className="px-4 py-3 text-muted-foreground">{customer.email}</td>
                  <td className="px-4 py-3 text-muted-foreground">{customer.phone}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {[customer.postalCode, customer.city].filter(Boolean).join(" " ) || "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatDate(customer.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openCustomerDetails(customer.id)}
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

      <Dialog
        open={detailOpen}
        onOpenChange={(open) => {
          setDetailOpen(open);
          if (!open) {
            setSelectedCustomer(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Kundendetails</DialogTitle>
          </DialogHeader>

          {isDetailLoading && (
            <p className="text-sm text-muted-foreground">Details werden geladen...</p>
          )}

          {!isDetailLoading && selectedCustomer && (
            <div className="space-y-5 text-sm">
              <div className="space-y-1">
                <p className="text-lg font-semibold">{selectedCustomer.fullName}</p>
                <p className="text-muted-foreground">{selectedCustomer.email}</p>
                <p className="text-muted-foreground">{selectedCustomer.phone}</p>
              </div>

              <div className="rounded-lg border p-4 space-y-2">
                <p className="font-medium">Adresse</p>
                <p className="text-muted-foreground">
                  {selectedCustomer.street} {selectedCustomer.houseNumber}
                </p>
                <p className="text-muted-foreground">
                  {selectedCustomer.postalCode} {selectedCustomer.city}
                </p>
              </div>

              <div className="rounded-lg border p-4 space-y-2">
                <p className="font-medium">Notizen</p>
                <p className="text-muted-foreground">
                  {selectedCustomer.notes || "Keine Notizen vorhanden."}
                </p>
              </div>

              <div className="rounded-lg border p-4 space-y-2">
                <p className="font-medium">Metadaten</p>
                <p className="text-muted-foreground">
                  Erstellt am: {formatDate(selectedCustomer.createdAt)}
                </p>
                <p className="text-muted-foreground">
                  Aktualisiert am: {formatDate(selectedCustomer.updatedAt)}
                </p>
                <p className="text-muted-foreground break-all">
                  ID: {selectedCustomer.id}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
