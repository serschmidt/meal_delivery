import { Link } from "react-router-dom";
import { Suppliers } from "../components/Suppliers";
import { Menu } from "../components/Menu";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { useSupplier } from "../contexts/useSupplier";
import heroImage from "../assets/ai-generated-8520995_1280.png";

type HomePageProps = {
  searchValue: string;
  onSearchChange: (value: string) => void;
};

export function HomePage({ searchValue, onSearchChange }: HomePageProps) {
  const { selectedSupplier } = useSupplier();
  const supplierName = selectedSupplier?.fullName ?? "Marie Kocht";

  return (
    <div className="w-full space-y-10 py-6">
      <section className="w-full rounded-3xl bg-muted/40 px-6 py-12">
        <div className="flex w-full justify-center">
          <div className="flex w-full flex-col items-center space-y-5 text-center">
            <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              Mittagessen warm geliefert, Essen auf Rädern
            </p>

            <div className="w-full rounded-3xl border bg-background p-4 shadow-sm">
              <img
                src={heroImage}
                alt="Frisch angerichtetes Mittagessen"
                className="h-[320px] w-full rounded-2xl object-cover"
              />
            </div>

            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Der Geschmack, der zu Ihnen nach Hause kommt von {supplierName}.
            </h1>

            <p className="max-w-2xl text-base text-muted-foreground sm:text-lg">
              Wähle deinen Lieferanten, entdecke die aktuelle Wochenübersicht
              und bestelle deine Gerichte einfach als Gast.
            </p>

            <div className="flex flex-wrap justify-center gap-3">
              <Button size="lg">Wochenmenü ansehen</Button>

              <Button size="lg" variant="outline">
                Lieferanten entdecken
              </Button>

              <Link to="/lieferant-werden">
                <Button size="lg" variant="outline">
                  Lieferant werden
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="grid w-full gap-4 xl:grid-cols-5">
        <Card className="rounded-2xl">
          <CardContent className="space-y-2 p-6">
            <h2 className="text-xl font-semibold">1. Lieferant wählen</h2>
            <p className="text-sm text-muted-foreground">
              Suche einen vorhandenen Lieferanten in deiner Nähe und wähle ihn
              für deine Bestellung aus.
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardContent className="space-y-2 p-6">
            <h2 className="text-xl font-semibold">
              2. Lieblingsessen aussuchen
            </h2>
            <p className="text-sm text-muted-foreground">
              Entdecke die Gerichte der aktuellen Woche und lege passende Menüs
              in deinen Warenkorb.
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardContent className="space-y-2 p-6">
            <h2 className="text-xl font-semibold">
              3. Eine Wochen im Voraus bestellen
            </h2>
            <p className="text-sm text-muted-foreground">
              Gib deine Lieferdaten ein und schließe deine Bestellung ohne Login
              ab.
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardContent className="space-y-2 p-6">
            <h2 className="text-xl font-semibold">
              4. In den Warenkorb legen und Bezahlen
            </h2>
            <p className="text-sm text-muted-foreground">
              Gib deine Lieferdaten ein und schließe deine Bestellung ohne Login
              ab.
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl">
          <CardContent className="space-y-2 p-6">
            <h2 className="text-xl font-semibold">5. Genießen</h2>
            <p className="text-sm text-muted-foreground">
              Das Lieblingsessen wird warm geliefert und du kannst es direkt
              genießen. Guten Appetit!
            </p>
          </CardContent>
        </Card>
      </section>

      <section id="lieferanten" className="w-full">
        <Suppliers searchValue={searchValue} onSearchChange={onSearchChange} />
      </section>

      <section id="wochenmenue" className="w-full space-y-4">
        <div className="space-y-2 px-1">
          <h2 className="text-2xl font-semibold">Aktuelle Wochenmenüs</h2>
          <p className="text-sm text-muted-foreground">
            Hier findest du die Wochenübersicht des ausgewählten Lieferanten mit
            allen Gerichten der aktuellen Woche.
          </p>
        </div>

        <Menu />
      </section>
    </div>
  );
}
