import type { Dispatch, SetStateAction } from "react";
import { DELIVERY_AREAS, SENSITIVE_TERMS } from "./types";
import type {
  Address,
  BillingAddress,
  CheckoutDraft,
  CustomerContact,
  DeliveryAreaStatus,
  Ride,
  ShoppingItem,
} from "./types";

export const emptyAddress = (): Address => ({
  street: "",
  houseNumber: "",
  postalCode: "",
  city: "",
});

export const emptyCustomerContact = (): CustomerContact => ({
  fullName: "",
  email: "",
  phone: "",
  notes: "",
});

export const emptyBillingAddress = (): BillingAddress => ({
  sameAsDelivery: true,
  address: emptyAddress(),
});

export const createEmptyRide = (): Ride => ({
  id: crypto.randomUUID(),
  option: "",
  category: "",
  store: {
    name: "",
    address: emptyAddress(),
  },
  shoppingItems: [{ id: crypto.randomUUID(), value: "", isEditing: true }],
  pickupCode: "",
  distanceKm: null,
  routeLoading: false,
  routeError: "",
});

export const createInitialDraft = (): CheckoutDraft => ({
  customerContact: emptyCustomerContact(),
  customerAddress: emptyAddress(),
  billingAddress: emptyBillingAddress(),
  paymentMethod: "cash_on_delivery",
  rides: [createEmptyRide()],
  ageConfirmed: false,
  reachableConfirmed: false,
});

export const createInitialDeliveryAreaStatus = (): DeliveryAreaStatus => ({
  isInside: null,
  message: "",
  distanceKm: null,
  matchedAreaPostalCode: null,
  matchedAreaCity: null,
  radiusKm: null,
  loading: false,
});

export const buildAddressText = (address: Address, name?: string) =>
  [name, address.street, address.houseNumber, address.postalCode, address.city]
    .filter(Boolean)
    .join(", ");

export const shoppingItemsToText = (items: ShoppingItem[]) =>
  items
    .map((item) => item.value.trim())
    .filter(Boolean)
    .join("\n");

export const hasSensitiveItemsInText = (value: string) => {
  const lowered = value.toLowerCase();
  return SENSITIVE_TERMS.some((term) => lowered.includes(term));
};

export const normalizePostalCode = (value: string) =>
  value.replace(/\D/g, "").trim();

export const formatEuro = (value: number) =>
  new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(value);

export const formatKm = (value: number) =>
  new Intl.NumberFormat("de-DE", {
    minimumFractionDigits: value % 1 === 0 ? 0 : 1,
    maximumFractionDigits: 1,
  }).format(value);

export const hasIncompleteCustomerAddress = (address: Address) =>
  !address.street.trim() ||
  !address.houseNumber.trim() ||
  !address.postalCode.trim() ||
  !address.city.trim();

export const isRideComplete = (ride: Ride) => {
  const hasOption = ride.option !== "";
  const hasCategory = ride.category !== "";
  const hasStoreName = ride.store.name.trim().length > 0;
  const hasStoreAddress =
    ride.store.address.street.trim().length > 0 &&
    ride.store.address.houseNumber.trim().length > 0 &&
    ride.store.address.postalCode.trim().length > 0 &&
    ride.store.address.city.trim().length > 0;

  const hasShoppingList = ride.shoppingItems.some(
    (item) => item.value.trim().length > 0,
  );

  if (ride.option === "already_paid") {
    return hasOption && hasCategory && hasStoreName && hasStoreAddress;
  }

  return (
    hasOption && hasCategory && hasStoreName && hasStoreAddress && hasShoppingList
  );
};

const toRadians = (value: number) => (value * Math.PI) / 180;

export const calculateAirDistanceKm = (
  [lat1, lon1]: [number, number],
  [lat2, lon2]: [number, number],
) => {
  const earthRadiusKm = 6371;
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
};

export const geocodeAddress = async (
  query: string,
): Promise<[number, number]> => {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(query)}`,
    {
      headers: {
        Accept: "application/json",
      },
    },
  );

  if (!response.ok) {
    throw new Error("Adresse konnte nicht gefunden werden.");
  }

  const data: Array<{ lat: string; lon: string }> = await response.json();

  if (!data.length) {
    throw new Error(`Kein Treffer für: ${query}`);
  }

  return [Number(data[0].lat), Number(data[0].lon)];
};

export const geocodePostalArea = async (postalCode: string, city?: string) => {
  const query = [normalizePostalCode(postalCode), city]
    .filter(Boolean)
    .join(" ");

  return geocodeAddress(query);
};

export const buildPlainAddressText = (address: Address) =>
  [address.street, address.houseNumber, address.postalCode, address.city]
    .filter(Boolean)
    .join(", ");

export const getRidePriceBreakdown = (distanceKm: number | null) => {
  const safeDistanceKm = typeof distanceKm === "number" ? distanceKm : 0;
  const orderBasePrice = 8.5;
  const driverExtra = Math.max(0, Math.ceil(safeDistanceKm - 3));

  return {
    distanceKm: safeDistanceKm,
    orderBasePrice,
    driverExtra,
    totalLabel: `${formatEuro(orderBasePrice)} + ${formatEuro(driverExtra)} an den Fahrer`,
  };
};

export const validateDeliveryAreaAgainstConfig = async (
  postalCode: string,
  city: string,
  setDeliveryAreaStatus: Dispatch<SetStateAction<DeliveryAreaStatus>>,
) => {
  const normalizedCustomerPostalCode = normalizePostalCode(postalCode);
  const customerCity = city.trim();

  if (normalizedCustomerPostalCode.length !== 5) {
    setDeliveryAreaStatus({
      isInside: false,
      message: "Bitte eine gültige 5-stellige Postleitzahl eingeben.",
      distanceKm: null,
      matchedAreaPostalCode: null,
      matchedAreaCity: null,
      radiusKm: null,
      loading: false,
    });
    return;
  }

  if (!customerCity) {
    setDeliveryAreaStatus({
      isInside: false,
      message:
        "Bitte die Stadt angeben, damit das Liefergebiet geprüft werden kann.",
      distanceKm: null,
      matchedAreaPostalCode: null,
      matchedAreaCity: null,
      radiusKm: null,
      loading: false,
    });
    return;
  }

  setDeliveryAreaStatus((prev) => ({
    ...prev,
    loading: true,
    message: "",
  }));

  try {
    const customerCoords = await geocodePostalArea(
      normalizedCustomerPostalCode,
      customerCity,
    );

    for (const area of DELIVERY_AREAS) {
      const areaCoords = await geocodePostalArea(area.postalCode, area.city);
      const distanceKm = Number(
        calculateAirDistanceKm(areaCoords, customerCoords).toFixed(1),
      );

      if (distanceKm <= area.radiusKm) {
        setDeliveryAreaStatus({
          isInside: true,
          message: `Die Lieferadresse liegt im Liefergebiet ${area.postalCode} ${area.city} innerhalb von ${area.radiusKm} km Radius.`,
          distanceKm,
          matchedAreaPostalCode: area.postalCode,
          matchedAreaCity: area.city,
          radiusKm: area.radiusKm,
          loading: false,
        });
        return;
      }
    }

    setDeliveryAreaStatus({
      isInside: false,
      message:
        "Diese Lieferadresse liegt außerhalb des aktuell definierten Liefergebiets.",
      distanceKm: null,
      matchedAreaPostalCode: null,
      matchedAreaCity: null,
      radiusKm: null,
      loading: false,
    });
  } catch (error) {
    setDeliveryAreaStatus({
      isInside: false,
      message:
        error instanceof Error
          ? error.message
          : "Liefergebiet konnte nicht geprüft werden.",
      distanceKm: null,
      matchedAreaPostalCode: null,
      matchedAreaCity: null,
      radiusKm: null,
      loading: false,
    });
  }
};

export const hydrateDraft = (raw: string | null): CheckoutDraft => {
  if (!raw) return createInitialDraft();

  try {
    const parsed = JSON.parse(raw) as Partial<CheckoutDraft>;

    return {
      customerContact: {
        fullName: parsed.customerContact?.fullName ?? "",
        email: parsed.customerContact?.email ?? "",
        phone: parsed.customerContact?.phone ?? "",
        notes: parsed.customerContact?.notes ?? "",
      },
      customerAddress: {
        ...emptyAddress(),
        ...(parsed.customerAddress ?? {}),
      },
      billingAddress: {
        sameAsDelivery: parsed.billingAddress?.sameAsDelivery ?? true,
        address: {
          ...emptyAddress(),
          ...(parsed.billingAddress?.address ?? {}),
        },
      },
      paymentMethod: parsed.paymentMethod ?? "cash_on_delivery",
      rides:
        Array.isArray(parsed.rides) && parsed.rides.length > 0
          ? parsed.rides.map((ride) => ({
              ...createEmptyRide(),
              ...ride,
              category: ride.category ?? "",
              store: {
                name: ride.store?.name ?? "",
                address: {
                  ...emptyAddress(),
                  ...(ride.store?.address ?? {}),
                },
              },
              shoppingItems:
                Array.isArray(ride.shoppingItems) && ride.shoppingItems.length > 0
                  ? ride.shoppingItems.map((item) => ({
                      id: item.id ?? crypto.randomUUID(),
                      value: item.value ?? "",
                      isEditing: Boolean(item.isEditing),
                    }))
                  : [{ id: crypto.randomUUID(), value: "", isEditing: true }],
              pickupCode: ride.pickupCode ?? "",
              distanceKm:
                typeof ride.distanceKm === "number" ? ride.distanceKm : null,
              routeLoading: Boolean(ride.routeLoading),
              routeError: ride.routeError ?? "",
            }))
          : [createEmptyRide()],
      ageConfirmed: Boolean(parsed.ageConfirmed),
      reachableConfirmed: Boolean(parsed.reachableConfirmed),
    };
  } catch {
    return createInitialDraft();
  }
};