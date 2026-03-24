import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type DeliveryPartner = {
  id: number;
  name: string;
  address: string;
  postalCode: number;
  city: string;
};

const deliveryPartners: DeliveryPartner[] = [
  {
    id: 1,
    name: "Pizza Express Goch",
    address: "Hauptstraße 12",
    postalCode: 47574,
    city: "Goch",
  },
  {
    id: 2,
    name: "Schnitzel Haus Xanten",
    address: "Bahnhofstraße 5",
    postalCode: 46509,
    city: "Xanten",
  },
  {
    id: 3,
    name: "Burger King Kleve",
    address: "Marktstraße 20",
    postalCode: 46323,
    city: "Kleve",
  },
  {
    id: 4,
    name: "Sushi Master Goch",
    address: "Rathausplatz 1",
    postalCode: 47574,
    city: "Goch",
  },
  {
    id: 5,
    name: "Pasta Paradiso Xanten",
    address: "Lindenstraße 8",
    postalCode: 46509,
    city: "Xanten",
  },
];

export function DeliveryPartners() {
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
          {deliveryPartners.map((partner) => (
            <CarouselItem key={partner.id} className="pl-1 md:basis-1/3">
              <Card className="h-[100px]">
                <CardHeader>
                  <CardTitle className="text-lg line-clamp-1">
                    {partner.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-2">
                  <p className="text-sm text-muted-foreground">
                    {partner.postalCode} {partner.city}
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
