import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatEuro, formatKm } from "./utils";

type Props = {
  totalRides: number;
  totalDistanceKm: number;
  orderBasePrice: number;
  driverExtra: number;
};

export function SummaryCard({ totalRides, totalDistanceKm, orderBasePrice, driverExtra }: Props) {
  return (
    <Card className="rounded-3xl">
      <CardHeader>
        <CardTitle>Zusammenfassung</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Fahrten</p>
            <p className="mt-2 text-2xl font-semibold">{totalRides}</p>
          </div>
          <div className="rounded-2xl border p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Kilometer gesamt</p>
            <p className="mt-2 text-2xl font-semibold">{formatKm(totalDistanceKm)} km</p>
          </div>
          <div className="rounded-2xl border p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Bestellung</p>
            <p className="mt-2 text-2xl font-semibold">{formatEuro(orderBasePrice)}</p>
            <p className="mt-1 text-xs text-muted-foreground">8,50 € pro Bestellung inklusive 3 km</p>
          </div>
          <div className="rounded-2xl border p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Auszahlung Fahrer</p>
            <p className="mt-2 text-2xl font-semibold text-primary">{formatEuro(driverExtra)}</p>
            <p className="mt-1 text-xs text-muted-foreground">+1 € je weiterem angefangenen km über 3 km</p>
          </div>
        </div>
        <div className="rounded-2xl border bg-muted/30 p-4 text-sm text-muted-foreground">
          Beispiel: Bei 3 Fahrten mit insgesamt 8,3 km gilt 8,50 € pro Bestellung und 6 € Auszahlung an den Fahrer.
        </div>
      </CardContent>
    </Card>
  );
}