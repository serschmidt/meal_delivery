import { useSupplier } from "../contexts/useSupplier";

function formatPhoneHref(phone: string) {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

export function SupplierImpressumPage() {
  const { selectedSupplier } = useSupplier();

  const supplierName = selectedSupplier?.fullName ?? "Kein Lieferant ausgewählt";
  const email = selectedSupplier?.email ?? null;
  const phone = selectedSupplier?.phone ?? null;

  const street = selectedSupplier?.address?.street ?? "";
  const houseNumber = selectedSupplier?.address?.houseNumber ?? "";
  const postalCode = selectedSupplier?.address?.postalCode ?? "";
  const city = selectedSupplier?.address?.city ?? "";

  const streetLine = [street, houseNumber].filter(Boolean).join(" ");
  const cityLine = [postalCode, city].filter(Boolean).join(" ");

  const hasSupplier = !!selectedSupplier;
  const hasAddress = Boolean(streetLine || cityLine);

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-10">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold tracking-tight">Impressum</h1>
        <p className="text-sm leading-6 text-muted-foreground">
          Anbieterkennzeichnung des ausgewählten Lieferanten.
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Anbieter</h2>

        <address className="not-italic space-y-1 leading-6">
          <p className="font-medium">{supplierName}</p>

          {hasAddress ? (
            <>
              {streetLine && <p>{streetLine}</p>}
              {cityLine && <p>{cityLine}</p>}
            </>
          ) : (
            <p className="text-muted-foreground">
              Keine Anschrift für diesen Lieferanten hinterlegt.
            </p>
          )}
        </address>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Kontakt</h2>

        <div className="space-y-1 leading-6">
          {phone ? (
            <p>
              Telefon:{" "}
              <a
                href={formatPhoneHref(phone)}
                className="underline underline-offset-4"
              >
                {phone}
              </a>
            </p>
          ) : (
            <p className="text-muted-foreground">
              Keine Telefonnummer hinterlegt.
            </p>
          )}

          {email ? (
            <p>
              E-Mail:{" "}
              <a
                href={`mailto:${email}`}
                className="underline underline-offset-4"
              >
                {email}
              </a>
            </p>
          ) : (
            <p className="text-muted-foreground">Keine E-Mail hinterlegt.</p>
          )}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Hinweis</h2>

        <p className="leading-6 text-foreground">
          Die Angaben in diesem Impressum beziehen sich auf den aktuell
          ausgewählten Lieferanten, der seine Angebote über die Plattform
          veröffentlicht.
        </p>
        <p className="leading-6 text-foreground">
          Verträge über angebotene Waren oder Leistungen kommen unmittelbar mit
          diesem Lieferanten zustande.
        </p>
      </section>

      {!hasSupplier && (
        <section className="rounded-lg border bg-muted/30 p-4">
          <p className="text-sm leading-6 text-muted-foreground">
            Aktuell ist kein Lieferant ausgewählt. Sobald ein Lieferant gewählt
            wurde, erscheinen hier dessen Impressumsdaten.
          </p>
        </section>
      )}
    </div>
  );
}