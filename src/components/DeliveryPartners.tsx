import { useEffect, useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "./ui/carousel";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

type Supplier = {
  id: string;
  fullName: string;
  email: string;
  enabled: boolean;
  guest: boolean;
  role: string;
  passwordHash: string | null;
  address: {
    id: string;
    street: string;
    houseNumber: string;
    postalCode: string;
    city: string;
  };
};

export function DeliveryPartners() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/suppliers/all");
        if (!response.ok) {
          throw new Error("Fehler beim Laden der Lieferanten");
        }

        const data: Supplier[] = await response.json();
        setSuppliers(data);
      } catch (err) {
        setError("Lieferanten konnten nicht geladen werden.");
      } finally {
        setLoading(false);
      }
    };

    fetchSuppliers();
  }, []);

  if (loading) {
    return <p className="text-center py-8">Lade Lieferanten...</p>;
  }

  if (error) {
    return <p className="text-center py-8 text-red-500">{error}</p>;
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      <h2 className="mb-6 text-2xl font-bold text-center">
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
                  <CardTitle className="text-lg line-clamp-1">
                    {supplier.fullName}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-2">
                  <p className="text-sm text-muted-foreground">
                    {supplier.address.postalCode} {supplier.address.city}
                  </p>
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {supplier.address.street} {supplier.address.houseNumber}
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