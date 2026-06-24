import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Search, XCircle } from "lucide-react";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { useSupplier } from "../contexts/useSupplier";
import type { Supplier } from "../contexts/SupplierContext";
import { apiGet } from "../lib/api";
import { cn } from "@/lib/utils";

type DeliveryAreaResult = {
  supplier: Supplier;
  deliveryArea: {
    cities: string[];
    postalCodes: string[];
  };
};

type SuppliersProps = {
  searchValue: string;
  onSearchChange: (value: string) => void;
};

function hasMinimumSearchLength(value: string) {
  return value.trim().length >= 3;
}

export function Suppliers({ searchValue, onSearchChange }: SuppliersProps) {
  const { selectedSupplier, selectSupplier } = useSupplier();

  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState("");
  const [deliveryMatch, setDeliveryMatch] = useState<boolean | null>(null);
  const [citySuggestions, setCitySuggestions] = useState<string[]>([]);

  const trimmedSearch = useMemo(() => searchValue.trim(), [searchValue]);
  const canSearch = hasMinimumSearchLength(trimmedSearch);

  const supplierDisplayName = useMemo(() => {
    if (!selectedSupplier) return "";

    return (
      selectedSupplier.businessName?.trim() ||
      selectedSupplier.fullName?.trim() ||
      [selectedSupplier.firstName, selectedSupplier.lastName]
        .filter(Boolean)
        .join(" ")
        .trim()
    );
  }, [selectedSupplier]);

  useEffect(() => {
    const controller = new AbortController();

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

        const response = await apiGet<DeliveryAreaResult | null>(
          "suppliers/by-delivery-area",
          { q: trimmedSearch },
          controller.signal,
        );

        if (!response?.supplier) {
          setCitySuggestions([]);
          setDeliveryMatch(false);
          return;
        }

        const uniqueCities = Array.isArray(response.deliveryArea?.cities)
          ? Array.from(
              new Map(
                response.deliveryArea.cities.map((city) => [
                  city.trim().toLowerCase(),
                  city,
                ]),
              ).values(),
            )
          : [];

        const postalCodes = Array.isArray(response.deliveryArea?.postalCodes)
          ? response.deliveryArea.postalCodes
          : [];

        selectSupplier(response.supplier);
        setCitySuggestions(uniqueCities);
        setDeliveryMatch(uniqueCities.length > 0 || postalCodes.length > 0);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }

        setError(
          err instanceof Error
            ? err.message
            : "Fehler bei der Prüfung des Liefergebiets.",
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
  }, [trimmedSearch, canSearch, selectSupplier]);

  const showSuggestions =
    trimmedSearch !== "" &&
    canSearch &&
    (isSearching || citySuggestions.length > 0);

  return (
    <section
      id="liefergebiete-block"
      className="rounded-3xl border bg-background px-5 py-6 scroll-mt-24 md:px-6 md:py-7"
    >
      <div
        className={cn(
          "grid gap-4 lg:items-start",
          trimmedSearch !== "" && canSearch
            ? "lg:grid-cols-[minmax(0,1fr)_280px]"
            : "grid-cols-1",
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

            {supplierDisplayName && (
              <p className="text-sm text-muted-foreground">
                Aktiver Lieferant:{" "}
                <span className="font-medium text-foreground">
                  {supplierDisplayName}
                </span>
              </p>
            )}
          </div>

          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="liefergebiete-suche"
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
                <p className="font-medium">
                  Die Eingabe liegt im Liefergebiet.
                </p>
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
