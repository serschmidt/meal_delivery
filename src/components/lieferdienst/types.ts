export const STORE_CATEGORIES = [
  "Discounter",
  "Supermarkt",
  "Drogerie",
  "Getränkemarkt",
  "Tierbedarf",
  "Gartencenter",
] as const;

export const DELIVERY_AREAS = [
  {
    postalCode: "41464",
    city: "Neuss",
    radiusKm: 100,
  },
] as const;

export const SENSITIVE_TERMS = [
  "bier",
  "wein",
  "alkohol",
  "zigaretten",
  "tabak",
  "apotheke",
  "schmerzmittel",
] as const;

export type StoreCategory = (typeof STORE_CATEGORIES)[number];
export type RideOption = "already_paid" | "shopping_service" | "";
export type DeliveryPaymentMethod =
  | "cash_on_delivery"
  | "ec_on_delivery"
  | "invoice";

export type Address = {
  street: string;
  houseNumber: string;
  postalCode: string;
  city: string;
};

export type ShoppingItem = {
  id: string;
  value: string;
  isEditing: boolean;
};

export type Ride = {
  id: string;
  option: RideOption;
  category: StoreCategory | "";
  store: {
    name: string;
    address: Address;
  };
  shoppingItems: ShoppingItem[];
  pickupCode?: string;
  distanceKm: number | null;
  routeLoading?: boolean;
  routeError?: string;
};

export type CustomerContact = {
  fullName: string;
  email: string;
  phone: string;
  notes: string;
};

export type BillingAddress = {
  sameAsDelivery: boolean;
  address: Address;
};

export type CheckoutDraft = {
  customerContact: CustomerContact;
  customerAddress: Address;
  billingAddress: BillingAddress;
  paymentMethod: DeliveryPaymentMethod;
  rides: Ride[];
  ageConfirmed: boolean;
  reachableConfirmed: boolean;
};

export type DeliveryAreaStatus = {
  isInside: boolean | null;
  message: string;
  distanceKm: number | null;
  matchedAreaPostalCode: string | null;
  matchedAreaCity: string | null;
  radiusKm: number | null;
  loading: boolean;
};