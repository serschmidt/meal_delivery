import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "./ui/carousel";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { useSupplier } from "../contexts/useSupplier";

const API_BASE_URL = "http://localhost:8080";

type SupplierAddress = {
  id: string;
  street: string;
  houseNumber: string;
  postalCode: string;
  city: string;
};

type Supplier = {
  id: string;
  fullName: string;
  email: string;
  enabled: boolean;
  guest: boolean;
  role: "SUPPLIER";
  address?: SupplierAddress;
};

type SuppliersProps = {
  searchValue: string;
  onSearchChange: (value: string) => void;
};

export function Suppliers({ searchValue, onSearchChange }: SuppliersProps) {
  const { selectSupplier, selectedSupplier } = useSupplier();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAllSuppliers = async (signal?: AbortSignal) => {
    const response = await fetch(`${API_BASE_URL}/api/suppliers/all`, {
      signal,
    });

    if (!response.ok) {
      throw new Error("Supplier konnten nicht geladen werden.");
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  };

  useEffect(() => {
    const controller = new AbortController();

    const timeout = setTimeout(async () => {
      try {
        setIsLoading(true);
        setError("");

        if (!searchValue.trim()) {
          const data = await loadAllSuppliers(controller.signal);
          setSuppliers(data);
          return;
        }

        const response = await fetch(
          `${API_BASE_URL}/api/suppliers/search?q=${encodeURIComponent(searchValue)}`,
          {
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          throw new Error("Supplier-Suche fehlgeschlagen.");
        }

        const data = await response.json();
        setSuppliers(Array.isArray(data) ? data : []);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }

        setError(
          err instanceof Error
            ? err.message
            : "Fehler bei der Supplier-Suche."
        );
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [searchValue]);

  return (
    <section className="rounded-3xl border bg-background px-6 py-8 md:px-8">
      <div className="mb-6 space-y-2">
        <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          Lieferanten auswählen
        </p>
        <h2 className="text-2xl font-bold">Wähle einen Lieferanten</h2>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Suche direkt hier nach einem Lieferanten und wähle ihn für dein
          Wochenmenü aus.
        </p>
      </div>

      <div className="mb-6">
        <div className="relative w-full max-w-xl">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Lieferanten suchen..."
            className="pl-9 h-11"
            aria-label="Lieferanten suchen"
          />
        </div>
      </div>

      {selectedSupplier && (
        <div className="mb-4 rounded-xl bg-primary/10 px-4 py-3 text-sm">
          Ausgewählt: <span className="font-medium">{selectedSupplier.fullName}</span>
        </div>
      )}

      {isLoading && (
        <p className="mb-4 text-sm text-muted-foreground">
          Lieferanten werden geladen...
        </p>
      )}

      {error && (
        <p className="mb-4 text-sm text-destructive">{error}</p>
      )}

      {!isLoading && !error && suppliers.length === 0 && (
        <p className="mb-4 text-sm text-muted-foreground">
          Keine Supplier gefunden.
        </p>
      )}

      {!error && suppliers.length > 0 && (
        <Carousel
          opts={{
            align: "start",
            slidesToScroll: 1,
          }}
          orientation="vertical"
          className="w-full"
        >
          <CarouselContent className="-ml-1">
            {suppliers.map((supplier) => (
              <CarouselItem key={supplier.id} className="pl-1 md:basis-1/3">
                <Card
                  className={`h-[170px] cursor-pointer transition-all hover:shadow-lg ${
                    selectedSupplier?.id === supplier.id
                      ? "border-primary ring-1 ring-primary"
                      : ""
                  }`}
                  onClick={() => selectSupplier(supplier)}
                >
                  <CardHeader>
                    <CardTitle className="line-clamp-1 text-lg">
                      {supplier.fullName}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-1 pt-2">
                    <p className="text-sm text-muted-foreground">
                      {supplier.address
                        ? `${supplier.address.street} ${supplier.address.houseNumber}`
                        : "Keine Adresse vorhanden"}
                    </p>

                    <p className="text-sm text-muted-foreground">
                      {supplier.address
                        ? `${supplier.address.postalCode} ${supplier.address.city}`
                        : ""}
                    </p>

                    <p className="text-xs text-muted-foreground">
                      {supplier.email}
                    </p>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>

          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      )}
    </section>
  );
}