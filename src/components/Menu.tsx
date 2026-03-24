import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Menu = {
  id: number;
  name: string;
  info: string;
  price: number;
};

const menuItems: Menu[] = [
  {
    id: 1,
    name: "Pizza Express Goch",
    info: "Feine italienische Pizza",
    price: 5.6,
  },
  {
    id: 2,
    name: "Schnitzel Haus Xanten",
    info: "Leckeres Schweineschnitzel",
    price: 5.6,
  },
  { id: 3, name: "Burger King Kleve", info: "Gute Burger", price: 5.6 },
  {
    id: 4,
    name: "Schnitzel Haus Xanten",
    info: "Leckeres Schweineschnitzel",
    price: 5.6,
  },
  { id: 4, name: "Burger King Kleve", info: "Gute Burger", price: 5.6 },
  { id: 5, name: "Burger King Kleve", info: "Gute Burger", price: 5.6 },
  {
    id: 6,
    name: "Sushi Master Goch",
    info: "Frischer Sushi",
    price: 12.99,
  },
  {
    id: 7,
    name: "Pasta Paradiso Xanten",
    info: "Leckere Pasta",
    price: 10.99,
  }
];

export function Menu() {
  return (
    <div className="space-y-4 m-4">
      {menuItems.map((item) => (
        <Card key={item.id}>
          <CardHeader>
            <CardTitle>{item.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{item.info}</p>
            <p>€ {item.price.toFixed(2)}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
