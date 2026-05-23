import { Link } from "react-router-dom";
import { Suppliers } from "../components/Suppliers";
import { Menu } from "../components/Menu";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { useSupplier } from "../contexts/useSupplier";
import heroImage from "../assets/marie-kocht.png";

type HomePageProps = {
  searchValue: string;
  onSearchChange: (value: string) => void;
};

export function HomePage({ searchValue, onSearchChange }: HomePageProps) {
  const { selectedSupplier } = useSupplier();
  const supplierName = selectedSupplier?.fullName ?? "Marie Kocht";
  const scrollToElement = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: "smooth", block: "start" });

    if (
      element instanceof HTMLInputElement ||
      element instanceof HTMLTextAreaElement
    ) {
      element.focus();
    }
  };

  return (
    <div className="w-full space-y-10 pb-10">
      <section className="w-full">
        <img
          src={heroImage}
          alt="Frisch angerichtetes Mittagessen"
          className="block h-[320px] w-full object-cover md:h-[420px] lg:h-[520px]"
        />

        <div className="px-4 py-8 text-center sm:px-6 lg:px-8">
          <div className="mx-auto flex w-full max-w-5xl flex-col items-center space-y-5">
            <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              Mittagessen warm geliefert, Essen auf Rädern
            </p>

            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Der Geschmack, der zu Ihnen nach Hause kommt von {supplierName}.
            </h1>

            <p className="max-w-2xl text-base text-muted-foreground sm:text-lg">
              Wähle deinen Lieferanten, entdecke die aktuelle Wochenübersicht
              und bestelle deine Gerichte einfach als Gast.
            </p>

            <div className="flex flex-wrap justify-center gap-3">
              <Button size="lg" onClick={() => scrollToElement("wochenmenue")}>
                Wochenmenü ansehen
              </Button>

              <Button
                size="lg"
                variant="outline"
                onClick={() => scrollToElement("liefergebiete-suche")}
              >
                Liefergebiete entdecken
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
            <h2 className="text-xl font-semibold">1. Liefergebiet wählen</h2>
            <p className="text-sm text-muted-foreground">
              Schauen Sie, ob die Marie in ihrer Stadt kocht.
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
              3. Eine Woche im Voraus bestellen
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
              4. In den Warenkorb legen und bezahlen
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

      <section
        id="liefergebiete"
        className="w-full scroll-mt-24 px-4 sm:px-6 lg:px-8"
      >
        <Suppliers searchValue={searchValue} onSearchChange={onSearchChange} />
      </section>

      <section
        id="wochenmenue"
        className="w-full space-y-4 scroll-mt-24 px-4 sm:px-6 lg:px-8"
      >
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
