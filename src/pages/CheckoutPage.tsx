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

type DeliveryAreasResponse = {
  id: string;
  cities: string[];
  postal_codes: string[];
};

function normalizePostalCode(value: string) {
  return value.replace(/\D/g, "").trim();
}

function isGermanPostalCode(value: string) {
  return /^[0-9]{5}$/.test(value);
}

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
  const [phoneAccepted, setPhoneAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  const [completedOrders, setCompletedOrders] = useState<OrderResponse[]>([]);
  const [supplierInfo, setSupplierInfo] = useState<SupplierInfo | null>(null);

  const normalizedDeliveryPostalCode = normalizePostalCode(customer.postal_code);

  const deliveryAddress: AddressForm = {
    street: customer.street.trim(),
    house_number: customer.house_number.trim(),
    postal_code: normalizedDeliveryPostalCode,
    city: customer.city.trim(),
  };

  const normalizedBillingPostalCode = normalizePostalCode(billingAddress.postal_code);

  const effectiveBillingAddress: AddressForm = sameAsDelivery
    ? deliveryAddress
    : {
        street: billingAddress.street.trim(),
        house_number: billingAddress.house_number.trim(),
        postal_code: normalizedBillingPostalCode,
        city: billingAddress.city.trim(),
      };

  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const supplierId = cartItems[0]?.supplierId ?? null;
  const supplierName = cartItems[0]?.supplierName ?? null;

  const areRequiredCheckboxesAccepted = widerrufsAccepted && phoneAccepted;

  const handleCustomerChange = (field: keyof CustomerForm, value: string) => {
    setCustomer((prev) => ({ ...prev, [field]: value }));
  };

  const handleBillingChange = (field: keyof AddressForm, value: string) => {
    setBillingAddress((prev) => ({ ...prev, [field]: value }));
  };

  const isFormValid = () => {
    const billingValid =
      sameAsDelivery ||
      (
        billingAddress.street.trim() !== "" &&
        billingAddress.house_number.trim() !== "" &&
        billingAddress.city.trim() !== "" &&
        isGermanPostalCode(normalizedBillingPostalCode)
      );

    return (
      customer.full_name.trim() !== "" &&
      customer.email.trim() !== "" &&
      customer.street.trim() !== "" &&
      customer.house_number.trim() !== "" &&
      customer.city.trim() !== "" &&
      isGermanPostalCode(normalizedDeliveryPostalCode) &&
      billingValid &&
      areRequiredCheckboxesAccepted &&
      cartItems.length > 0 &&
      supplierId !== null
    );
  };

  const handleSubmit = async () => {
    if (isSubmitting) {
      return;
    }

    if (!widerrufsAccepted || !phoneAccepted) {
      toast.error(
        "Bitte aktivieren Sie beide Checkboxen, bevor Sie die Bestellung absenden."
      );
      return;
    }

    if (!isFormValid()) {
      toast.error("Bitte füllen Sie alle Pflichtfelder korrekt aus.");
      return;
    }

    if (!isGermanPostalCode(normalizedDeliveryPostalCode)) {
      toast.error(
        "Bitte geben Sie eine gültige 5-stellige PLZ für die Lieferadresse ein."
      );
      return;
    }

    if (!supplierId) {
      toast.error("Kein Lieferant ausgewählt.");
      return;
    }

    const groupedByMenu = cartItems.reduce<Record<string, typeof cartItems>>(
      (acc, item) => {
        const key = item.weeklyMenuId;
        if (!acc[key]) acc[key] = [];
        acc[key].push(item);
        return acc;
      },
      {}
    );

    setIsSubmitting(true);

    try {
      const deliveryAreas = await apiGet<DeliveryAreasResponse>(
        `suppliers/${supplierId}/delivery-areas`,
        { q: normalizedDeliveryPostalCode }
      );

      const postalCodes = Array.isArray(deliveryAreas?.postal_codes)
        ? deliveryAreas.postal_codes
        : [];

      const normalizedPostalCodes = postalCodes.map((code) =>
        normalizePostalCode(code)
      );

      const isPostalCodeAllowed = normalizedPostalCodes.includes(
        normalizedDeliveryPostalCode
      );

      if (!isPostalCodeAllowed) {
        toast.error(
          "Die angegebene Liefer-PLZ liegt nicht im Liefergebiet dieses Anbieters."
        );
        return;
      }

      const supplier = await apiGet<SupplierInfo>(`suppliers/${supplierId}`);
      setSupplierInfo(supplier);

      const orders: OrderResponse[] = [];

      for (const [menuId, items] of Object.entries(groupedByMenu)) {
        const payload = {
          customer: {
            ...customer,
            full_name: customer.full_name.trim(),
            email: customer.email.trim(),
            phone: customer.phone.trim(),
            street: customer.street.trim(),
            house_number: customer.house_number.trim(),
            postal_code: normalizedDeliveryPostalCode,
            city: customer.city.trim(),
            notes: customer.notes.trim(),
            phone_contact_accepted: phoneAccepted,
          },
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

  if (orderSuccess) {
    const totalAll = completedOrders.reduce((s, o) => s + o.total_price, 0);
    const hasIban = !!supplierInfo?.payment?.iban;
    const hasPaypal = !!supplierInfo?.payment?.paypalLink;

    return (
      <div className="mx-auto max-w-2xl space-y-6 py-8">
        <div className="space-y-2 text-center">
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

        {completedOrders.map((order, i) => (
          <section key={order.id} className="space-y-4 rounded-lg border p-6">
            <h2 className="text-lg font-semibold">
              Bestellung {completedOrders.length > 1 ? i + 1 : ""}
            </h2>

            <div className="space-y-1 rounded-md bg-muted/50 px-4 py-3 text-sm">
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

        {completedOrders.length > 1 && (
          <div className="flex items-center justify-between rounded-lg border p-4 text-lg font-bold">
            <span>Gesamtsumme</span>
            <span>€ {totalAll.toFixed(2)}</span>
          </div>
        )}

        <section className="space-y-4 rounded-lg border p-6">
          <h2 className="text-lg font-semibold">Zahlung</h2>

          {hasIban && (
            <div className="space-y-2 rounded-md bg-muted/50 px-4 py-3 text-sm">
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
            <div className="space-y-2 rounded-md bg-muted/50 px-4 py-3 text-sm">
              <p className="font-medium">PayPal</p>
              <a
                href={supplierInfo?.payment?.paypalLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
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

        <section className="space-y-2 rounded-lg border p-6 text-sm">
          <h2 className="text-lg font-semibold">Lieferadresse</h2>
          <p>{customer.full_name}</p>
          <p>
            {customer.street} {customer.house_number}
          </p>
          <p>
            {normalizedDeliveryPostalCode} {customer.city}
          </p>
          {customer.phone && <p>Tel: {customer.phone}</p>}
          {customer.notes && (
            <p className="text-muted-foreground">Hinweis: {customer.notes}</p>
          )}
        </section>

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

  if (cartItems.length === 0) {
    return (
      <div className="mx-auto max-w-2xl space-y-4 py-12 text-center">
        <h1 className="text-2xl font-bold">Warenkorb ist leer</h1>
        <Button onClick={() => navigate("/")}>Zurück zur Startseite</Button>
      </div>
    );
  }

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

  return (
    <div className="mx-auto max-w-2xl space-y-8 py-8">
      <h1 className="text-2xl font-bold">Zur Kasse</h1>

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
            <div className="space-y-1 rounded-md bg-muted/50 px-4 py-3 text-sm">
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

      <section className="space-y-4 rounded-lg border p-6">
        <h2 className="text-lg font-semibold">Ihre Daten</h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1 sm:col-span-2">
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
              inputMode="numeric"
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

          <div className="space-y-1 sm:col-span-2">
            <Label htmlFor="notes">Anmerkungen zur Lieferung</Label>
            <Input
              id="notes"
              value={customer.notes}
              onChange={(e) => handleCustomerChange("notes", e.target.value)}
              placeholder="z.B. Bitte klingeln bei Müller"
            />
          </div>
        </div>

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
          <div className="grid grid-cols-1 gap-4 pt-2 sm:grid-cols-2">
            <h3 className="text-sm font-medium sm:col-span-2">
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
                inputMode="numeric"
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

        <div className="flex items-start gap-3 pt-1">
          <input
            type="checkbox"
            id="phoneAccepted"
            checked={phoneAccepted}
            onChange={(e) => setPhoneAccepted(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border"
          />
          <Label
            htmlFor="phoneAccepted"
            className="cursor-pointer font-normal leading-5"
          >
            Ich bin einverstanden, dass Sie mich telefonisch kontaktieren dürfen.
          </Label>
        </div>

        <Separator />

        {!areRequiredCheckboxesAccepted && (
          <p
            className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800"
            role="alert"
          >
            Bitte aktivieren Sie beide Checkboxen, um die Bestellung absenden zu
            können.
          </p>
        )}

        <p className="text-sm text-muted-foreground">
          Mit Klick auf „Jetzt verbindlich bestellen" geben Sie eine
          verbindliche Bestellung ab. Es gelten unsere{" "}
          <span className="font-medium text-foreground">AGB</span>.
        </p>

        <Button
          type="button"
          size="lg"
          className={`w-full transition-opacity ${
            !areRequiredCheckboxesAccepted ? "opacity-50 hover:opacity-60" : ""
          }`}
          disabled={!areRequiredCheckboxesAccepted || isSubmitting}
          aria-disabled={!areRequiredCheckboxesAccepted || isSubmitting}
          onClick={handleSubmit}
        >
          {isSubmitting ? "Wird gesendet…" : "Jetzt verbindlich bestellen"}
        </Button>
      </section>

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