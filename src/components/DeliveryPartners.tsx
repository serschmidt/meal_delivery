import { useEffect, useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "./ui/carousel";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

type SupplierApi = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  street: string;
  house_number: string;
  postal_code: string;
  city: string;
  is_active: number | boolean;
  created_at: string;
  updated_at: string;
  account_holder: string | null;
  iban: string | null;
  paypal_link: string | null;
};

type Supplier = {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  street: string;
  houseNumber: string;
  postalCode: string;
  city: string;
  isActive: boolean;
  accountHolder: string | null;
  iban: string | null;
  paypalLink: string | null;
};

type SuppliersResponse = {
  data: SupplierApi[];
};

const API_URL =
  import.meta.env.VITE_API_URL || "https://liefermonopol.de/backend/public";

function mapSupplier(apiSupplier: SupplierApi): Supplier {
  return {
    id: apiSupplier.id,
    fullName: apiSupplier.full_name,
    email: apiSupplier.email,
    phone: apiSupplier.phone,
    street: apiSupplier.street,
    houseNumber: apiSupplier.house_number,
    postalCode: apiSupplier.postal_code,
    city: apiSupplier.city,
    isActive: Boolean(apiSupplier.is_active),
    accountHolder: apiSupplier.account_holder,
    iban: apiSupplier.iban,
    paypalLink: apiSupplier.paypal_link,
  };
}

export function DeliveryPartners() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const response = await fetch(`${API_URL}/?route=suppliers/all`, {
          headers: {
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`Fehler beim Laden der Lieferanten (${response.status})`);
        }

        const json: SuppliersResponse = await response.json();
        const mappedSuppliers = Array.isArray(json.data)
          ? json.data.map(mapSupplier)
          : [];

        setSuppliers(mappedSuppliers);
      } catch (err) {
        setError("Lieferanten konnten nicht geladen werden.");
      } finally {
        setLoading(false);
      }
    };

    fetchSuppliers();
  }, []);

  if (loading) {
    return <p className="py-8 text-center">Lade Lieferanten...</p>;
  }

  if (error) {
    return <p className="py-8 text-center text-red-500">{error}</p>;
  }

  if (suppliers.length === 0) {
    return <p className="py-8 text-center">Aktuell sind noch keine Lieferanten verfügbar.</p>;
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8">
      <h2 className="mb-6 text-center text-2xl font-bold">
        Lieferanten in deiner Nähe:
      </h2>

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
              <Card className="h-[120px]">
                <CardHeader>
                  <CardTitle className="line-clamp-1 text-lg">
                    {supplier.fullName}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-2">
                  <p className="text-sm text-muted-foreground">
                    {supplier.postalCode} {supplier.city}
                  </p>
                  <p className="line-clamp-1 text-sm text-muted-foreground">
                    {supplier.street} {supplier.houseNumber}
                  </p>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>

        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
}