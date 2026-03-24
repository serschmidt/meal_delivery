import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type DeliveryPartner = {
  id: number
  name: string
  address: string
  postalCode: number
  city: string
}

const deliveryPartners: DeliveryPartner[] = [
  {
    id: 1,
    name: "Pizza Express Goch",
    address: "Hauptstraße 12",
    postalCode: 47574,
    city: "Goch"
  },
  {
    id: 2,
    name: "Schnitzel Haus Xanten",
    address: "Bahnhofstraße 5", 
    postalCode: 46509,
    city: "Xanten"
  },    
{   id: 3,
    name: "Burger King Kleve",
    address: "Marktstraße 20",
    postalCode: 46323,
    city: "Kleve"
  },
  {
    id: 4,
    name: "Sushi Master Goch",
    address: "Rathausplatz 1",
    postalCode: 47574,
    city: "Goch"
  },
  {
    id: 5,
    name: "Pasta Paradiso Xanten",
    address: "Lindenstraße 8",
    postalCode: 46509,
    city: "Xanten"
  }
]

export function DeliveryPartners() {
  return (
    <div className="space-y-4">
      {deliveryPartners.map((partner) => (
        <Card key={partner.id}>
          <CardHeader>
            <CardTitle>{partner.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{partner.postalCode} {partner.city}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
