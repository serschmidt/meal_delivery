import { useSupplier } from "../contexts/useSupplier";
import nrwLiefergebiete from "../assets/NRW_Liefergebiete.png"; // Pfad ggf. anpassen

export function VersandZahlungPage() {
  const { selectedSupplier } = useSupplier();

  const postalCode = selectedSupplier?.address?.postalCode;
  const paypalLink = selectedSupplier?.payment?.paypalLink;

  return (
    <div className="mx-auto max-w-4xl space-y-8 py-10">
      <h1 className="text-3xl font-bold">Versand und Zahlung</h1>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Liefergebiete</h2>
        <p className="text-muted-foreground">NRW Liefergebiete.</p>

        <img
          src={nrwLiefergebiete}
          alt="NRW Liefergebiete"
          className="h-auto w-full max-w-md rounded-md border bg-muted/30 p-2 shadow-sm"
        />

        <div className="space-y-2">
          <p>4 Städte werden beliefert:</p>
          <ul className="list-disc pl-6">
            <li>Düsseldorf</li>
            <li>Neuss</li>
            <li>Köln</li>
            <li>Leverkusen</li>
          </ul>
        </div>

        <div className="space-y-1">
          <p>
            <span className="font-medium">Postleitzahl des ausgewählten Lieferanten:</span>{" "}
            {postalCode ?? "Keine Postleitzahl verfügbar"}
          </p>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Zahlung</h2>
        <p>
          Zahlung per PayPal ist möglich.
        </p>

        <p>
          <span className="font-medium">PayPal-Link:</span>{" "}
          {paypalLink ? (
            <a
              href={paypalLink}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4"
            >
              {paypalLink}
            </a>
          ) : (
            "Kein PayPal-Link verfügbar"
          )}
        </p>
      </section>
    </div>
  );
}