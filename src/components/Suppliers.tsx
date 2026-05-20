import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Search, XCircle } from "lucide-react";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { useSupplier } from "../contexts/useSupplier";
import { apiGet } from "../lib/api";
import { cn } from "@/lib/utils";

type SupplierAddress = {
  street: string;
  houseNumber: string;
  postalCode: string;
  city: string;
};

type SupplierPayment = {
  accountHolder: string | null;
  iban: string | null;
  paypalLink: string | null;
};

type Supplier = {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  address: SupplierAddress;
  payment: SupplierPayment;
};

type DeliveryAreasResponse = {
  id: string;
  cities: string[];
  postal_codes: string[];
};

type SuppliersProps = {
  searchValue: string;
  onSearchChange: (value: string) => void;
};

function hasMinimumSearchLength(value: string) {
  return value.trim().length >= 3;
}

let initialSupplierRequestStarted = false;

export function Suppliers({ searchValue, onSearchChange }: SuppliersProps) {
  const { selectedSupplier, selectSupplier } = useSupplier();

  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState("");
  const [deliveryMatch, setDeliveryMatch] = useState<boolean | null>(null);
  const [citySuggestions, setCitySuggestions] = useState<string[]>([]);

  const trimmedSearch = useMemo(() => searchValue.trim(), [searchValue]);
  const canSearch = hasMinimumSearchLength(trimmedSearch);

  useEffect(() => {
    if (initialSupplierRequestStarted) return;
    initialSupplierRequestStarted = true;

    const controller = new AbortController();

    const loadInitialSupplier = async () => {
      try {
        const suppliers = await apiGet<Supplier[]>(
          "suppliers/all",
          undefined,
          controller.signal
        );

        const firstSupplier = Array.isArray(suppliers) ? suppliers[0] ?? null : null;
        selectSupplier(firstSupplier);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }

        setError(
          err instanceof Error
            ? err.message
            : "Fehler beim Laden des Liefergebiets."
        );
      }
    };

    void loadInitialSupplier();

    return () => {
      controller.abort();
    };
  }, [selectSupplier]);

  useEffect(() => {
    const controller = new AbortController();

    if (!selectedSupplier?.id) {
      setCitySuggestions([]);
      setDeliveryMatch(null);
      setIsSearching(false);
      return () => controller.abort();
    }

    if (trimmedSearch === "") {
      setCitySuggestions([]);
      setDeliveryMatch(null);
      setError("");
      setIsSearching(false);
      return () => controller.abort();
    }

    if (!canSearch) {
      setCitySuggestions([]);
      setDeliveryMatch(null);
      setError("");
      setIsSearching(false);
      return () => controller.abort();
    }

    const timeout = window.setTimeout(async () => {
      try {
        setError("");
        setIsSearching(true);

        const response = await apiGet<DeliveryAreasResponse>(
          `suppliers/${selectedSupplier.id}/delivery-areas`,
          { q: trimmedSearch },
          controller.signal
        );

        const uniqueCities = Array.isArray(response?.cities)
          ? Array.from(
              new Map(
                response.cities.map((city) => [city.trim().toLowerCase(), city])
              ).values()
            )
          : [];

        const postalCodes = Array.isArray(response?.postal_codes)
          ? response.postal_codes
          : [];

        setCitySuggestions(uniqueCities);
        setDeliveryMatch(uniqueCities.length > 0 || postalCodes.length > 0);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }

        setError(
          err instanceof Error
            ? err.message
            : "Fehler bei der Prüfung des Liefergebiets."
        );
        setCitySuggestions([]);
        setDeliveryMatch(null);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [trimmedSearch, canSearch, selectedSupplier?.id]);

  const showSuggestions =
    trimmedSearch !== "" && canSearch && (isSearching || citySuggestions.length > 0);

return (
  <section className="rounded-3xl border bg-background px-5 py-6 md:px-6 md:py-7">
    <div
      className={cn(
        "grid gap-4 lg:items-start",
        trimmedSearch !== "" && canSearch
          ? "lg:grid-cols-[minmax(0,1fr)_280px]"
          : "grid-cols-1"
      )}
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Liefergebiet prüfen
          </p>
          <h2 className="text-2xl font-bold">
            Prüfen Sie, ob in Ihre Stadt oder PLZ geliefert wird
          </h2>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Geben Sie mindestens 3 Buchstaben oder 3 Zahlen ein, um das
            Liefergebiet zu prüfen.
          </p>
        </div>

        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Stadt oder PLZ eingeben..."
            className="h-11 pl-9"
            aria-label="Liefergebiet prüfen"
          />
        </div>

        {trimmedSearch !== "" && !canSearch && (
          <p className="text-sm text-muted-foreground">
            Bitte mindestens 3 Buchstaben oder 3 Zahlen eingeben.
          </p>
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}

        {!error && isSearching && (
          <div className="rounded-xl border px-4 py-3 text-sm text-muted-foreground">
            Liefergebiet wird geprüft...
          </div>
        )}

        {!error && !isSearching && deliveryMatch === true && (
          <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            <CheckCircle2 className="mt-0.5 size-5 shrink-0" />
            <div>
              <p className="font-medium">Die Eingabe liegt im Liefergebiet.</p>
            </div>
          </div>
        )}

        {!error && !isSearching && deliveryMatch === false && (
          <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            <XCircle className="mt-0.5 size-5 shrink-0" />
            <div>
              <p className="font-medium">
                Die Eingabe liegt aktuell nicht im Liefergebiet.
              </p>
            </div>
          </div>
        )}
      </div>

      {trimmedSearch !== "" && canSearch && (
        <div className="overflow-hidden rounded-2xl border bg-background">
          <div className="border-b px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Passende Städte
          </div>

          <ScrollArea className="h-[212px]">
            <div className="p-1">
              {showSuggestions && citySuggestions.length > 0 ? (
                citySuggestions.map((city) => (
                  <button
                    key={city}
                    type="button"
                    onClick={() => onSearchChange(city)}
                    className="block w-full rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-muted"
                  >
                    {city}
                  </button>
                ))
              ) : (
                <div className="px-3 py-3 text-sm text-muted-foreground">
                  {isSearching
                    ? "Städte werden gesucht..."
                    : "Keine passenden Städte gefunden."}
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  </section>
);
}