import { Link } from "react-router-dom";
import { Menu } from "../components/Menu";
import { Button } from "../components/ui/button";

export function EssenAufRaedernPage() {
  return (
    <div className="w-full space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <div>
        <Link to="/">
          <Button type="button" variant="outline">
            Zurück zur Startseite
          </Button>
        </Link>
      </div>

      <section className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Essen auf Rädern
        </h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          Hier finden Sie die aktuellen Wochenmenüs und können passende Gerichte auswählen.
        </p>
      </section>

      <Menu />
    </div>
  );
}