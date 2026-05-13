import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../contexts/useCart";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Checkbox } from "../components/ui/checkbox";
import { Separator } from "../components/ui/separator";
import { toast } from "sonner";
import { WiderrufsrechtPage } from "../pages/WiderrufsrechtPage";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { apiGet, apiPost } from "../lib/api";

type CustomerForm = {
  full_name: string;
  email: string;
  phone: string;
  street: string;
  house_number: string;
  postal_code: string;
  city: string;
  notes: string;
};

type AddressForm = {
  street: string;
  house_number: string;
  postal_code: string;
  city: string;
};

// Types für die Erfolgsansicht
type OrderResponse = {
  id: string;
  created_at: string;
  status: string;
  total_price: number;
  items: {
    id: string;
    meal_name: string;
    quantity: number;
    unit_price: number;
    line_total: number;
    menu_date?: string;
  }[];
};

type SupplierPayment = {
  accountHolder?: string;
  iban?: string;
  paypalLink?: string;
};

type SupplierInfo = {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  payment?: SupplierPayment;
};

// Hilfsfunktion oben in der Datei:
function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
}

export function CheckoutPage() {
  const { cartItems, clearCart } = useCart();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState<CustomerForm>({
    full_name: "",
    email: "",
    phone: "",
    street: "",
    house_number: "",
    postal_code: "",
    city: "",
    notes: "",
  });

  const [sameAsDelivery, setSameAsDelivery] = useState(true);
  const [billingAddress, setBillingAddress] = useState<AddressForm>({
    street: "",
    house_number: "",
    postal_code: "",
    city: "",
  });
  const [widerrufsDialogOpen, setWiderrufsDialogOpen] = useState(false);

  const [widerrufsAccepted, setWiderrufsAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  // Neue States:
  const [completedOrders, setCompletedOrders] = useState<OrderResponse[]>([]);
  const [supplierInfo, setSupplierInfo] = useState<SupplierInfo | null>(null);

  // Lieferadresse = Kundenadresse
  const deliveryAddress: AddressForm = {
    street: customer.street,
    house_number: customer.house_number,
    postal_code: customer.postal_code,
    city: customer.city,
  };

  const effectiveBillingAddress = sameAsDelivery
    ? deliveryAddress
    : billingAddress;

  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  // Alle Items haben denselben Lieferanten (Regel: 1 Bestellung = 1 Lieferant)
  const supplierId = cartItems[0]?.supplierId ?? null;
  const supplierName = cartItems[0]?.supplierName ?? null;

  const handleCustomerChange = (field: keyof CustomerForm, value: string) => {
    setCustomer((prev) => ({ ...prev, [field]: value }));
  };

  const handleBillingChange = (field: keyof AddressForm, value: string) => {
    setBillingAddress((prev) => ({ ...prev, [field]: value }));
  };

  const isFormValid = () => {
    return (
      customer.full_name.trim() !== "" &&
      customer.email.trim() !== "" &&
      customer.street.trim() !== "" &&
      customer.house_number.trim() !== "" &&
      customer.postal_code.trim() !== "" &&
      customer.city.trim() !== "" &&
      widerrufsAccepted &&
      cartItems.length > 0 &&
      supplierId !== null
    );
  };

  const handleSubmit = async () => {
    if (!isFormValid()) return;
    setIsSubmitting(true);

    const groupedByMenu = cartItems.reduce<Record<string, typeof cartItems>>(
      (acc, item) => {
        const key = item.weeklyMenuId;
        if (!acc[key]) acc[key] = [];
        acc[key].push(item);
        return acc;
      },
      {},
    );

    try {
      // Lieferantendaten laden
      const supplier = await apiGet<SupplierInfo>(`suppliers/${supplierId}`);
      setSupplierInfo(supplier);

      const orders: OrderResponse[] = [];

      for (const [menuId, items] of Object.entries(groupedByMenu)) {
        const payload = {
          customer: { ...customer },
          supplier_id: supplierId,
          weekly_menu_id: menuId,
          billing_address: effectiveBillingAddress,
          delivery_address: deliveryAddress,
          items: items.map((item) => ({
            weekly_menu_entry_id: item.weeklyMenuEntryId,
            quantity: item.quantity,
            unit_price: item.price,
          })),
        };

        const order = await apiPost<OrderResponse>("orders", payload);
        orders.push(order);
      }

      setCompletedOrders(orders);
      clearCart();
      setOrderSuccess(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Fehler beim Bestellen");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Erfolgsseite ──────────────────────────────────────────────────────────
  if (orderSuccess) {
    const totalAll = completedOrders.reduce((s, o) => s + o.total_price, 0);
    const hasIban = !!supplierInfo?.payment?.iban;
    const hasPaypal = !!supplierInfo?.payment?.paypalLink;

    return (
      <div className="mx-auto max-w-2xl space-y-6 py-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="text-5xl">✓</div>
          <h1 className="text-2xl font-bold">Bestellung erfolgreich!</h1>
          <p className="text-muted-foreground">
            Vielen Dank, {customer.full_name}. Ihre Bestellung wurde verbindlich
            aufgenommen.{" "}
            {customer.email && (
              <>
                Eine Bestätigung wurde an{" "}
                <span className="font-medium">{customer.email}</span> gesendet.
              </>
            )}
          </p>
        </div>

        {/* Bestellübersicht */}
        {completedOrders.map((order, i) => (
          <section key={order.id} className="rounded-lg border p-6 space-y-4">
            <h2 className="text-lg font-semibold">
              Bestellung {completedOrders.length > 1 ? i + 1 : ""}
            </h2>

            <div className="rounded-md bg-muted/50 px-4 py-3 text-sm space-y-1">
              <p>
                <span className="font-medium">Lieferant:</span>{" "}
                {supplierInfo?.fullName ?? "–"}
              </p>
              <p>
                <span className="font-medium">Lieferzeit:</span> täglich
                zwischen 11:00 und 13:30 Uhr
              </p>
              <p>
                <span className="font-medium">Status:</span> {order.status}
              </p>
            </div>

            <div className="space-y-2">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between text-sm"
                >
                  <div>
                    <span>
                      {item.quantity}× {item.meal_name}
                    </span>
                    {item.menu_date && (
                      <p className="text-xs text-muted-foreground">
                        Liefertag: {formatDate(item.menu_date)}
                      </p>
                    )}
                  </div>
                  <span className="shrink-0 pl-4">
                    € {item.line_total.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <Separator />

            <div className="flex items-center justify-between font-semibold">
              <span>Teilsumme</span>
              <span>€ {order.total_price.toFixed(2)}</span>
            </div>
          </section>
        ))}

        {/* Gesamtsumme bei mehreren Bestellungen */}
        {completedOrders.length > 1 && (
          <div className="flex items-center justify-between rounded-lg border p-4 font-bold text-lg">
            <span>Gesamtsumme</span>
            <span>€ {totalAll.toFixed(2)}</span>
          </div>
        )}

        {/* Zahlungsaufforderung */}
        <section className="rounded-lg border p-6 space-y-4">
          <h2 className="text-lg font-semibold">Zahlung</h2>

          {hasIban && (
            <div className="rounded-md bg-muted/50 px-4 py-3 text-sm space-y-2">
              <p className="font-medium">Überweisung</p>
              <p>
                <span className="text-muted-foreground">Kontoinhaber: </span>
                <span className="font-medium">
                  {supplierInfo?.payment?.accountHolder ??
                    supplierInfo?.fullName}
                </span>
              </p>
              <p>
                <span className="text-muted-foreground">IBAN: </span>
                <span className="font-mono font-medium">
                  {supplierInfo?.payment?.iban}
                </span>
              </p>
              <p>
                <span className="text-muted-foreground">Betrag: </span>
                <span className="font-bold">€ {totalAll.toFixed(2)}</span>
              </p>
            </div>
          )}

          {hasPaypal && (
            <div className="rounded-md bg-muted/50 px-4 py-3 text-sm space-y-2">
              <p className="font-medium">PayPal</p>
              <a
                href={supplierInfo?.payment?.paypalLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block rounded bg-blue-600 px-4 py-2 text-white text-sm font-medium hover:bg-blue-700"
              >
                Jetzt per PayPal bezahlen
              </a>
            </div>
          )}

          {!hasIban && !hasPaypal && (
            <p className="text-sm text-muted-foreground">
              Bitte kontaktieren Sie den Lieferanten direkt für Zahlungsdetails.
            </p>
          )}
        </section>

        {/* Lieferadresse */}
        <section className="rounded-lg border p-6 space-y-2 text-sm">
          <h2 className="text-lg font-semibold">Lieferadresse</h2>
          <p>{customer.full_name}</p>
          <p>
            {customer.street} {customer.house_number}
          </p>
          <p>
            {customer.postal_code} {customer.city}
          </p>
          {customer.phone && <p>Tel: {customer.phone}</p>}
          {customer.notes && (
            <p className="text-muted-foreground">Hinweis: {customer.notes}</p>
          )}
        </section>

        {/* Hinweis + Button */}
        <div className="rounded-md bg-muted/50 p-4 text-sm text-muted-foreground">
          <p>
            Diese Übersicht ist nur einmalig sichtbar. Eine Kopie wurde an{" "}
            <span className="font-medium text-foreground">
              {customer.email}
            </span>{" "}
            gesendet.
          </p>
        </div>

        <Button className="w-full" onClick={() => navigate("/")}>
          Zurück zur Startseite
        </Button>
      </div>
    );
  }

  // ── Leerer Warenkorb ──────────────────────────────────────────────────────
  if (cartItems.length === 0) {
    return (
      <div className="mx-auto max-w-2xl space-y-4 py-12 text-center">
        <h1 className="text-2xl font-bold">Warenkorb ist leer</h1>
        <Button onClick={() => navigate("/")}>Zurück zur Startseite</Button>
      </div>
    );
  }

  // ── Kein Lieferant ausgewählt ─────────────────────────────────────────────
  if (!supplierId) {
    return (
      <div className="mx-auto max-w-2xl space-y-4 py-12 text-center">
        <div className="text-5xl">⚠</div>
        <h1 className="text-2xl font-bold">Kein Lieferant ausgewählt</h1>
        <p className="text-muted-foreground">
          Bitte wählen Sie zuerst einen Lieferanten aus, bevor Sie zur Kasse
          gehen.
        </p>
        <Button onClick={() => navigate("/")}>Zurück zur Startseite</Button>
      </div>
    );
  }

  // ── Hauptformular ─────────────────────────────────────────────────────────
  return (
    <div className="mx-auto max-w-2xl space-y-8 py-8">
      <h1 className="text-2xl font-bold">Zur Kasse</h1>

      {/* ── Abschnitt 1: Bestellübersicht ── */}
      <section className="space-y-4 rounded-lg border p-6">
        <h2 className="text-lg font-semibold">Ihre Bestellung</h2>

        {(() => {
          const dates = cartItems
            .map((i) => i.deliveryDate)
            .filter((d): d is string => !!d)
            .sort();
          const first = dates[0];
          const last = dates[dates.length - 1];

          return (
            <div className="rounded-md bg-muted/50 px-4 py-3 text-sm space-y-1">
              <p>
                <span className="font-medium">Lieferant:</span>{" "}
                {supplierName ?? "–"}
              </p>
              {first && (
                <p>
                  <span className="font-medium">Lieferzeitraum:</span>{" "}
                  {first === last
                    ? formatDate(first)
                    : `${formatDate(first)} – ${formatDate(last)}`}
                </p>
              )}
              <p>
                <span className="font-medium">Lieferzeit:</span> täglich
                zwischen 11:00 und 13:30 Uhr
              </p>
            </div>
          );
        })()}

        <div className="space-y-2">
          {cartItems.map((item) => (
            <div
              key={`${item.mealId}-${item.supplierId}`}
              className="flex items-start justify-between text-sm"
            >
              <div>
                <span>
                  {item.quantity}× {item.name}
                </span>
                {/* NEU */}
                {item.deliveryDate && (
                  <p className="text-xs text-muted-foreground">
                    Liefertag: {formatDate(item.deliveryDate)}
                  </p>
                )}
              </div>
              <span className="shrink-0 pl-4">
                € {(item.price * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}
        </div>

        <Separator />

        <div className="flex items-center justify-between font-semibold">
          <span>Gesamtsumme</span>
          <span>€ {totalAmount.toFixed(2)}</span>
        </div>
      </section>

      {/* ── Abschnitt 2: Kundendaten ── */}
      <section className="space-y-4 rounded-lg border p-6">
        <h2 className="text-lg font-semibold">Ihre Daten</h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2 space-y-1">
            <Label htmlFor="full_name">Vollständiger Name *</Label>
            <Input
              id="full_name"
              value={customer.full_name}
              onChange={(e) =>
                handleCustomerChange("full_name", e.target.value)
              }
              placeholder="Max Mustermann"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="email">E-Mail-Adresse *</Label>
            <Input
              id="email"
              type="email"
              value={customer.email}
              onChange={(e) => handleCustomerChange("email", e.target.value)}
              placeholder="max@beispiel.de"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="phone">Telefonnummer</Label>
            <Input
              id="phone"
              type="tel"
              value={customer.phone}
              onChange={(e) => handleCustomerChange("phone", e.target.value)}
              placeholder="015786615684"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="street">Straße *</Label>
            <Input
              id="street"
              value={customer.street}
              onChange={(e) => handleCustomerChange("street", e.target.value)}
              placeholder="Musterstraße"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="house_number">Hausnummer *</Label>
            <Input
              id="house_number"
              value={customer.house_number}
              onChange={(e) =>
                handleCustomerChange("house_number", e.target.value)
              }
              placeholder="12a"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="postal_code">PLZ *</Label>
            <Input
              id="postal_code"
              value={customer.postal_code}
              onChange={(e) =>
                handleCustomerChange("postal_code", e.target.value)
              }
              placeholder="46509"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="city">Stadt *</Label>
            <Input
              id="city"
              value={customer.city}
              onChange={(e) => handleCustomerChange("city", e.target.value)}
              placeholder="Xanten"
            />
          </div>

          <div className="sm:col-span-2 space-y-1">
            <Label htmlFor="notes">Anmerkungen zur Lieferung</Label>
            <Input
              id="notes"
              value={customer.notes}
              onChange={(e) => handleCustomerChange("notes", e.target.value)}
              placeholder="z.B. Bitte klingeln bei Müller"
            />
          </div>
        </div>

        {/* Rechnungsadresse */}
        <div className="flex items-center gap-2 pt-2">
          <Checkbox
            id="sameAsDelivery"
            checked={sameAsDelivery}
            onCheckedChange={(v: boolean | "indeterminate") =>
              setSameAsDelivery(v === true)
            }
          />
          <Label
            htmlFor="sameAsDelivery"
            className="cursor-pointer font-normal"
          >
            Rechnungsadresse entspricht der Lieferadresse
          </Label>
        </div>

        {!sameAsDelivery && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-2">
            <h3 className="sm:col-span-2 font-medium text-sm">
              Rechnungsadresse
            </h3>
            <div className="space-y-1">
              <Label htmlFor="b_street">Straße *</Label>
              <Input
                id="b_street"
                value={billingAddress.street}
                onChange={(e) => handleBillingChange("street", e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="b_house_number">Hausnummer *</Label>
              <Input
                id="b_house_number"
                value={billingAddress.house_number}
                onChange={(e) =>
                  handleBillingChange("house_number", e.target.value)
                }
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="b_postal_code">PLZ *</Label>
              <Input
                id="b_postal_code"
                value={billingAddress.postal_code}
                onChange={(e) =>
                  handleBillingChange("postal_code", e.target.value)
                }
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="b_city">Stadt *</Label>
              <Input
                id="b_city"
                value={billingAddress.city}
                onChange={(e) => handleBillingChange("city", e.target.value)}
              />
            </div>
          </div>
        )}
      </section>

      {/* ── Abschnitt 3: Widerrufsbelehrung + verbindliche Bestellung ── */}
      <section className="space-y-4 rounded-lg border p-6">
        <h2 className="text-lg font-semibold">Widerrufsbelehrung</h2>

        <div className="rounded-md bg-muted/50 p-4 text-sm leading-6 text-muted-foreground">
          <p>
            Bitte lesen Sie unsere Widerrufsbelehrung, bevor Sie die Bestellung
            verbindlich aufgeben.
          </p>
          <Button
            type="button"
            variant="outline"
            className="mt-3"
            onClick={() => setWiderrufsDialogOpen(true)}
          >
            Widerrufsbelehrung lesen
          </Button>
        </div>

        <div className="flex items-start gap-3 pt-1">
          <input
            type="checkbox"
            id="widerrufsAccepted"
            checked={widerrufsAccepted}
            onChange={(e) => setWiderrufsAccepted(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border"
          />
          <Label
            htmlFor="widerrufsAccepted"
            className="cursor-pointer font-normal leading-5"
          >
            Ich habe die Widerrufsbelehrung gelesen und stimme zu. Mir ist
            bekannt, dass das Widerrufsrecht bei frisch zubereiteten Speisen
            ausgeschlossen ist.
          </Label>
        </div>

        <Separator />

        <p className="text-sm text-muted-foreground">
          Mit Klick auf „Jetzt verbindlich bestellen" geben Sie eine
          verbindliche Bestellung ab. Es gelten unsere{" "}
          <span className="font-medium text-foreground">AGB</span>.
        </p>

        <Button
          type="button"
          className="w-full"
          size="lg"
          disabled={!isFormValid() || isSubmitting}
          onClick={handleSubmit}
        >
          {isSubmitting ? "Wird gesendet…" : "Jetzt verbindlich bestellen"}
        </Button>
      </section>

      {/* ── Widerrufsbelehrung Dialog ── */}
      <Dialog open={widerrufsDialogOpen} onOpenChange={setWiderrufsDialogOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Widerrufsbelehrung</DialogTitle>
          </DialogHeader>
          <div className="pt-2">
            <WiderrufsrechtPage />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
