import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import type { Address, CheckoutDraft, Ride } from "@/components/lieferdienst/types";
import { STORAGE_KEY } from "@/components/lieferdienst/constants";
import {
  hasSensitiveItemsInText,
  shoppingItemsToText,
} from "@/components/lieferdienst/utils";

type PaymentMethod = "cash_on_delivery" | "ec_on_delivery" | "invoice";

type CustomerContact = {
  fullName: string;
  email: string;
  phone: string;
  notes: string;
};

type BillingAddress = {
  sameAsDelivery: boolean;
  address: Address;
};

type CheckoutPageDraft = CheckoutDraft & {
  customerContact: CustomerContact;
  billingAddress: BillingAddress;
  paymentMethod: PaymentMethod;
};

const emptyAddress = (): Address => ({
  street: "",
  houseNumber: "",
  postalCode: "",
  city: "",
});

const createInitialCheckoutDraft = (): CheckoutPageDraft => ({
  customerContact: {
    fullName: "",
    email: "",
    phone: "",
    notes: "",
  },
  customerAddress: emptyAddress(),
  billingAddress: {
    sameAsDelivery: true,
    address: emptyAddress(),
  },
  paymentMethod: "cash_on_delivery",
  rides: [],
  ageConfirmed: false,
  reachableConfirmed: false,
});

const normalizeRide = (ride: Partial<Ride>): Ride => ({
  id: ride.id ?? crypto.randomUUID(),
  option: ride.option === "already_paid" || ride.option === "shopping_service" ? ride.option : "",
  category: ride.category ?? "",
  store: {
    name: ride.store?.name ?? "",
    address: {
      street: ride.store?.address?.street ?? "",
      houseNumber: ride.store?.address?.houseNumber ?? "",
      postalCode: ride.store?.address?.postalCode ?? "",
      city: ride.store?.address?.city ?? "",
    },
  },
  shoppingItems:
    Array.isArray(ride.shoppingItems) && ride.shoppingItems.length > 0
      ? ride.shoppingItems.map((item) => ({
          id: item.id ?? crypto.randomUUID(),
          value: item.value ?? "",
          isEditing: Boolean(item.isEditing),
        }))
      : [],
  pickupCode: ride.pickupCode ?? "",
  distanceKm: typeof ride.distanceKm === "number" ? ride.distanceKm : null,
  routeLoading: false,
  routeError: ride.routeError ?? "",
});

const hydrateCheckoutDraft = (raw: string | null): CheckoutPageDraft => {
  const initialDraft = createInitialCheckoutDraft();

  if (!raw) {
    return initialDraft;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<CheckoutPageDraft>;

    return {
      customerContact: {
        fullName: parsed.customerContact?.fullName ?? "",
        email: parsed.customerContact?.email ?? "",
        phone: parsed.customerContact?.phone ?? "",
        notes: parsed.customerContact?.notes ?? "",
      },
      customerAddress: {
        street: parsed.customerAddress?.street ?? "",
        houseNumber: parsed.customerAddress?.houseNumber ?? "",
        postalCode: parsed.customerAddress?.postalCode ?? "",
        city: parsed.customerAddress?.city ?? "",
      },
      billingAddress: {
        sameAsDelivery: parsed.billingAddress?.sameAsDelivery ?? true,
        address: {
          street: parsed.billingAddress?.address?.street ?? "",
          houseNumber: parsed.billingAddress?.address?.houseNumber ?? "",
          postalCode: parsed.billingAddress?.address?.postalCode ?? "",
          city: parsed.billingAddress?.address?.city ?? "",
        },
      },
      paymentMethod:
        parsed.paymentMethod === "cash_on_delivery" ||
        parsed.paymentMethod === "ec_on_delivery" ||
        parsed.paymentMethod === "invoice"
          ? parsed.paymentMethod
          : "cash_on_delivery",
      rides: Array.isArray(parsed.rides) ? parsed.rides.map((ride) => normalizeRide(ride)) : [],
      ageConfirmed: Boolean(parsed.ageConfirmed),
      reachableConfirmed: Boolean(parsed.reachableConfirmed),
    };
  } catch {
    return initialDraft;
  }
};

const isAddressComplete = (address: Address) =>
  address.street.trim().length > 0 &&
  address.houseNumber.trim().length > 0 &&
  address.postalCode.trim().length > 0 &&
  address.city.trim().length > 0;

const formatEuro = (value: number) =>
  new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(value);

const formatKm = (value: number) =>
  new Intl.NumberFormat("de-DE", {
    minimumFractionDigits: value % 1 === 0 ? 0 : 1,
    maximumFractionDigits: 1,
  }).format(value);

export function LieferdienstCheckoutPage() {
  const navigate = useNavigate();
  const hasHydratedRef = useRef(false);

  const [draft, setDraft] = useState<CheckoutPageDraft>(() => {
    if (typeof window === "undefined") {
      return createInitialCheckoutDraft();
    }

    return hydrateCheckoutDraft(window.localStorage.getItem(STORAGE_KEY));
  });

  useEffect(() => {
    hasHydratedRef.current = true;
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!hasHydratedRef.current) return;

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  }, [draft]);

  const hasRides = Array.isArray(draft.rides) && draft.rides.length > 0;

  const hasSensitiveItems = useMemo(() => {
    return draft.rides.some((ride) =>
      hasSensitiveItemsInText(shoppingItemsToText(ride.shoppingItems)),
    );
  }, [draft.rides]);

  const totalDistanceKm = useMemo(() => {
    return draft.rides.reduce((sum, ride) => {
      const distance = typeof ride.distanceKm === "number" ? ride.distanceKm : 0;
      return sum + distance;
    }, 0);
  }, [draft.rides]);

  const totalRides = draft.rides.length;
  const orderBasePrice = 8.5;
  const driverExtra = Math.max(0, Math.ceil(totalDistanceKm - 3));

  const contactComplete =
    draft.customerContact.fullName.trim().length > 0 &&
    draft.customerContact.phone.trim().length > 0;

  const billingAddressComplete =
    draft.billingAddress.sameAsDelivery || isAddressComplete(draft.billingAddress.address);

  const checkoutValid =
    hasRides &&
    isAddressComplete(draft.customerAddress) &&
    contactComplete &&
    billingAddressComplete &&
    draft.reachableConfirmed &&
    (!hasSensitiveItems || draft.ageConfirmed);

  const updateCustomerContact = (field: keyof CustomerContact, value: string) => {
    setDraft((prev) => ({
      ...prev,
      customerContact: {
        ...prev.customerContact,
        [field]: value,
      },
    }));
  };

  const updateBillingAddress = (field: keyof Address, value: string) => {
    setDraft((prev) => ({
      ...prev,
      billingAddress: {
        ...prev.billingAddress,
        address: {
          ...prev.billingAddress.address,
          [field]: value,
        },
      },
    }));
  };

  if (!draft.rides || !Array.isArray(draft.rides)) {
    return null;
  }

  if (draft.rides.length === 0) {
    return (
      <div className="mx-auto max-w-2xl space-y-4 px-4 py-12 text-center">
        <h1 className="text-2xl font-bold">Keine Fahrten vorhanden</h1>
        <p className="text-muted-foreground">
          Bitte erfassen Sie zuerst mindestens eine Fahrt.
        </p>
        <div className="flex justify-center">
          <Button type="button" onClick={() => navigate("/lieferdienst")}>
            Zurück zum Lieferdienst
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 px-4 py-6 sm:px-6 lg:px-8">
      <div className="space-y-3">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Bestellung prüfen</h1>
        <p className="max-w-3xl text-sm text-muted-foreground sm:text-base">
          Prüfen Sie Ihre Fahrten, ergänzen Sie Kontaktdaten und schließen Sie die
          Anfrage verbindlich ab.
        </p>
      </div>

      <Card className="rounded-3xl">
        <CardHeader>
          <CardTitle>Lieferadresse</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Straße
            </p>
            <p className="mt-2 text-base font-medium">{draft.customerAddress.street || "—"}</p>
          </div>

          <div className="rounded-2xl border p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Hausnummer
            </p>
            <p className="mt-2 text-base font-medium">
              {draft.customerAddress.houseNumber || "—"}
            </p>
          </div>

          <div className="rounded-2xl border p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              PLZ
            </p>
            <p className="mt-2 text-base font-medium">{draft.customerAddress.postalCode || "—"}</p>
          </div>

          <div className="rounded-2xl border p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Stadt
            </p>
            <p className="mt-2 text-base font-medium">{draft.customerAddress.city || "—"}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-3xl">
        <CardHeader>
          <CardTitle>Kontakt</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="customer-full-name">Vor- und Nachname</Label>
            <Input
              id="customer-full-name"
              value={draft.customerContact.fullName}
              onChange={(e) => updateCustomerContact("fullName", e.target.value)}
              placeholder="Max Mustermann"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="customer-phone">Telefonnummer</Label>
            <Input
              id="customer-phone"
              value={draft.customerContact.phone}
              onChange={(e) => updateCustomerContact("phone", e.target.value)}
              placeholder="0170 1234567"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="customer-email">E-Mail</Label>
            <Input
              id="customer-email"
              type="email"
              value={draft.customerContact.email}
              onChange={(e) => updateCustomerContact("email", e.target.value)}
              placeholder="max@example.de"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="customer-notes">Hinweise</Label>
            <Input
              id="customer-notes"
              value={draft.customerContact.notes}
              onChange={(e) => updateCustomerContact("notes", e.target.value)}
              placeholder="z. B. Bitte anrufen, wenn der Fahrer vor Ort ist"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-3xl">
        <CardHeader>
          <CardTitle>Rechnungsadresse</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="flex items-start gap-3 rounded-2xl border p-4 text-sm">
            <Checkbox
              checked={draft.billingAddress.sameAsDelivery}
              onCheckedChange={(value) =>
                setDraft((prev) => ({
                  ...prev,
                  billingAddress: {
                    ...prev.billingAddress,
                    sameAsDelivery: Boolean(value),
                  },
                }))
              }
            />
            <span>Rechnungsadresse entspricht der Lieferadresse.</span>
          </label>

          {!draft.billingAddress.sameAsDelivery && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="billing-street">Straße</Label>
                <Input
                  id="billing-street"
                  value={draft.billingAddress.address.street}
                  onChange={(e) => updateBillingAddress("street", e.target.value)}
                  placeholder="Straße"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="billing-house-number">Hausnummer</Label>
                <Input
                  id="billing-house-number"
                  value={draft.billingAddress.address.houseNumber}
                  onChange={(e) => updateBillingAddress("houseNumber", e.target.value)}
                  placeholder="Hausnummer"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="billing-postal-code">PLZ</Label>
                <Input
                  id="billing-postal-code"
                  value={draft.billingAddress.address.postalCode}
                  onChange={(e) => updateBillingAddress("postalCode", e.target.value)}
                  placeholder="PLZ"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="billing-city">Stadt</Label>
                <Input
                  id="billing-city"
                  value={draft.billingAddress.address.city}
                  onChange={(e) => updateBillingAddress("city", e.target.value)}
                  placeholder="Stadt"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-3xl">
        <CardHeader>
          <CardTitle>Zahlungsart</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <button
              type="button"
              onClick={() =>
                setDraft((prev) => ({ ...prev, paymentMethod: "cash_on_delivery" }))
              }
              className={`rounded-2xl border p-4 text-left transition ${
                draft.paymentMethod === "cash_on_delivery"
                  ? "border-primary bg-primary/5"
                  : "border-border bg-background hover:border-primary/40"
              }`}
            >
              <p className="font-semibold">Bar bei Übergabe</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Zahlung direkt bei Lieferung in bar.
              </p>
            </button>

            <button
              type="button"
              onClick={() =>
                setDraft((prev) => ({ ...prev, paymentMethod: "ec_on_delivery" }))
              }
              className={`rounded-2xl border p-4 text-left transition ${
                draft.paymentMethod === "ec_on_delivery"
                  ? "border-primary bg-primary/5"
                  : "border-border bg-background hover:border-primary/40"
              }`}
            >
              <p className="font-semibold">EC bei Übergabe</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Zahlung beim Fahrer per Karte.
              </p>
            </button>

            <button
              type="button"
              onClick={() =>
                setDraft((prev) => ({ ...prev, paymentMethod: "invoice" }))
              }
              className={`rounded-2xl border p-4 text-left transition ${
                draft.paymentMethod === "invoice"
                  ? "border-primary bg-primary/5"
                  : "border-border bg-background hover:border-primary/40"
              }`}
            >
              <p className="font-semibold">Rechnung</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Zahlung per Rechnung nach Vereinbarung.
              </p>
            </button>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-3xl">
        <CardHeader>
          <CardTitle>Fahrtenübersicht</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {draft.rides.map((ride, index) => {
            const shoppingListText = shoppingItemsToText(ride.shoppingItems);

            return (
              <div key={ride.id} className="rounded-2xl border p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-1">
                    <p className="text-base font-semibold">Fahrt {index + 1}</p>
                    <p className="text-sm text-muted-foreground">
                      {ride.option === "already_paid"
                        ? "Bereits bezahlt"
                        : ride.option === "shopping_service"
                        ? "Einkaufsservice"
                        : "Keine Option gewählt"}
                    </p>
                  </div>

                  {typeof ride.distanceKm === "number" && (
                    <div className="rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
                      {formatKm(ride.distanceKm)} km
                    </div>
                  )}
                </div>

                <div className="mt-4 grid gap-4 lg:grid-cols-3">
                  <div className="rounded-2xl border p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Geschäft
                    </p>
                    <p className="mt-2 font-medium">{ride.store.name || "—"}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {[ride.store.address.street, ride.store.address.houseNumber]
                        .filter(Boolean)
                        .join(" ")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {[ride.store.address.postalCode, ride.store.address.city]
                        .filter(Boolean)
                        .join(" ")}
                    </p>
                    <p className="mt-2 text-sm">
                      <span className="font-medium">Kategorie:</span>{" "}
                      {ride.category || "—"}
                    </p>
                  </div>

                  <div className="rounded-2xl border p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Abholschein / Code
                    </p>
                    <p className="mt-2 font-medium">{ride.pickupCode?.trim() || "—"}</p>
                  </div>

                  <div className="rounded-2xl border p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Einkaufsliste
                    </p>
                    <div className="mt-2 whitespace-pre-line text-sm">
                      {shoppingListText || "Keine Einträge vorhanden"}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card className="rounded-3xl">
        <CardHeader>
          <CardTitle>Zusammenfassung</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Fahrten
              </p>
              <p className="mt-2 text-2xl font-semibold">{totalRides}</p>
            </div>

            <div className="rounded-2xl border p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Kilometer gesamt
              </p>
              <p className="mt-2 text-2xl font-semibold">{formatKm(totalDistanceKm)} km</p>
            </div>

            <div className="rounded-2xl border p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Bestellung
              </p>
              <p className="mt-2 text-2xl font-semibold">{formatEuro(orderBasePrice)}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                8,50 € pro Bestellung inklusive 3 km
              </p>
            </div>

            <div className="rounded-2xl border p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Auszahlung Fahrer
              </p>
              <p className="mt-2 text-2xl font-semibold text-primary">
                {formatEuro(driverExtra)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                +1 € je weiterem angefangenen km über 3 km
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-3xl">
        <CardHeader>
          <CardTitle>Bestätigung</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="flex items-start gap-3 rounded-2xl border p-4 text-sm">
            <Checkbox
              checked={draft.reachableConfirmed}
              onCheckedChange={(value) =>
                setDraft((prev) => ({
                  ...prev,
                  reachableConfirmed: Boolean(value),
                }))
              }
            />
            <span>
              Ich bestätige, dass ich während des Einkaufs bzw. der Lieferung telefonisch
              erreichbar bin.
            </span>
          </label>

          {hasSensitiveItems && (
            <label className="flex items-start gap-3 rounded-2xl border p-4 text-sm">
              <Checkbox
                checked={draft.ageConfirmed}
                onCheckedChange={(value) =>
                  setDraft((prev) => ({
                    ...prev,
                    ageConfirmed: Boolean(value),
                  }))
                }
              />
              <span>
                Ich bestätige, dass ich das gesetzlich erforderliche Mindestalter erreicht
                habe und bei Übergabe einen gültigen Ausweis vorzeigen kann.
              </span>
            </label>
          )}

          <div className="flex flex-wrap gap-3">
            <Button type="button" variant="outline" onClick={() => navigate("/lieferdienst")}>
              Zurück
            </Button>
            <Button
              type="button"
              size="lg"
              disabled={!checkoutValid}
              onClick={() => {
                console.log("Checkout payload", draft);
              }}
            >
              Bestellung verbindlich anfragen
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}