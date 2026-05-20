import { useSupplier } from "../contexts/useSupplier";

export function AgbPage() {
    const { selectedSupplier } = useSupplier();

  return (
    <div className="mx-auto max-w-4xl space-y-8 py-12 px-4">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Allgemeine Geschäftsbedingungen (AGB)
        </h1>
        <p className="text-xl text-muted-foreground">Stand: 21. April 2026</p>
      </div>

      <div className="prose prose-lg max-w-none dark:prose-invert">
        <h2>1. Geltungsbereich</h2>
        <p>
          Für alle Lieferungen von Marie kocht an Verbraucher (§ 13 BGB) gelten
          diese Allgemeinen Geschäftsbedingungen (AGB).
        </p>
        <p>
          Verbraucher ist jede natürliche Person, die ein Rechtsgeschäft zu
          einem Zwecke abschließt, der weder ihrer gewerblichen noch ihrer
          selbstständigen beruflichen Tätigkeit zugerechnet werden kann.
        </p>

        <h2>2. Vertragspartner</h2>
        <p>
          Der Kaufvertrag kommt zustande mit:
          <br />
          <strong>Marie kocht</strong>
          <br />
          {selectedSupplier?.fullName}
          <br />
          {selectedSupplier?.address?.street} {selectedSupplier?.address?.houseNumber}
          <br />
          {selectedSupplier?.address?.postalCode} {selectedSupplier?.address?.city}
        </p>
        <p>
          Sie erreichen unseren Kundendienst für Fragen, Reklamationen und
          Beanstandungen werktags von 9:00h bis 18:00h unter der Telefonnummer
          <strong>{selectedSupplier?.phone}</strong> sowie per E-Mail unter{" "}
          <a href={`mailto:${selectedSupplier?.email}`} className="underline">
            {selectedSupplier?.email}
          </a>
          .
        </p>

        <h2>3. Angebot und Vertragsschluss</h2>
        <p>
          <strong>3.1</strong> Die Darstellung der Produkte im Online-Shop
          stellt kein rechtlich bindendes Angebot, sondern eine Aufforderung zur
          Bestellung dar. Irrtümer vorbehalten.
        </p>
        <p>
          <strong>3.2</strong> Durch Anklicken des Buttons "Kaufen" im letzten
          Schritt des Bestellprozesses geben Sie eine verbindliche Bestellung
          der im Warenkorb enthaltenen Waren ab. Der Kaufvertrag kommt zustande,
          wenn wir Ihre Bestellung durch eine Auftragsbestätigung per E-Mail
          unmittelbar nach dem Erhalt Ihrer Bestellung annehmen.
        </p>

        <h2>4. Vertragstext</h2>
        <p>
          Der Vertragstext wird auf unseren internen Systemen gespeichert. Die
          Allgemeinen Geschäftsbedingungen können Sie jederzeit auf dieser Seite
          einsehen. Die Bestelldaten und die AGB werden Ihnen per Email
          zugesendet. Nach Abschluss der Bestellung ist der Vertragstext aus
          Sicherheitsgründen nicht mehr über das Internet zugänglich.
        </p>

        <h2>5. Widerrufsrecht</h2>
        <p>Verbraucher haben ein vierzehntägiges Widerrufsrecht.</p>

        <h3>Widerrufsbelehrung</h3>
        <p>
          <strong>Widerrufsrecht</strong>
        </p>
        <p>
          Sie haben das Recht, binnen vierzehn Tagen ohne Angabe von Gründen
          diesen Vertrag zu widerrufen. Die Widerrufsfrist beträgt vierzehn Tage
          ab dem Tag an dem Sie oder ein von Ihnen benannter Dritter, der nicht
          der Beförderer ist, die Waren in Besitz genommen haben bzw. hat.
        </p>
        <p>
          Um Ihr Widerrufsrecht auszuüben, müssen Sie uns mittels einer
          eindeutigen Erklärung (z. B. ein mit der Post versandter Brief,
          Telefax oder E-Mail) über Ihren Entschluss, diesen Vertrag zu
          widerrufen, informieren. Sie können dafür das Muster-Widerrufsformular
          verwenden, das jedoch nicht vorgeschrieben ist.
        </p>

        <h3>Folgen des Widerrufs</h3>
        <p>
          Wenn Sie diesen Vertrag widerrufen, haben wir Ihnen alle Zahlungen,
          die wir von Ihnen erhalten haben, einschließlich der Lieferkosten (mit
          Ausnahme der zusätzlichen Kosten, die sich daraus ergeben, dass Sie
          eine andere Art der Lieferung als die von uns angebotene, günstigste
          Standardlieferung gewählt haben), unverzüglich und spätestens binnen
          vierzehn Tagen ab dem Tag zurückzuzahlen, an dem die Mitteilung über
          Ihren Widerruf dieses Vertrags bei uns eingegangen ist. Für diese
          Rückzahlung verwenden wir dasselbe Zahlungsmittel, das Sie bei der
          ursprünglichen Transaktion eingesetzt haben, es sei denn, mit Ihnen
          wurde ausdrücklich etwas anderes vereinbart; in keinem Fall werden
          Ihnen wegen dieser Rückzahlung Entgelte berechnet.
        </p>
        <p>
          Sie haben die Waren unverzüglich und in jedem Fall spätestens binnen
          vierzehn Tagen ab dem Tag, an dem Sie uns über den Widerruf dieses
          Vertrags unterrichten, an uns zurückzusenden oder zu übergeben. Die
          Frist ist gewahrt, wenn Sie die Waren vor Ablauf der Frist von
          vierzehn Tagen absenden. Wir tragen die Kosten der Rücksendung der
          Waren. Sie müssen für einen etwaigen Wertverlust der Waren nur
          aufkommen, wenn dieser Wertverlust auf einen zur Prüfung der
          Beschaffenheit, Eigenschaften und Funktionsweise der Waren nicht
          notwendigen Umgang mit ihnen zurückzuführen ist.
        </p>

        <h2>6. Preise und Versandkosten</h2>
        <p>
          <strong>6.1</strong> Die auf den Produktseiten genannten Preise
          enthalten die gesetzliche Mehrwertsteuer und sonstige
          Preisbestandteile.
        </p>
        <p>
          <strong>6.2</strong>
          Die Versandkosten hängen von der Menge der bestellten Waren sowie der
          Versandart ab und werden Ihnen vor Abgabe Ihrer verbindlichen
          Bestellung deutlich mitgeteilt. Sie finden eine Übersicht auf der
          Seite Versand. Wir bieten folgende Versandarten in unserem Shop an:
        </p>

        <h2>7. Lieferung</h2>
        <p>
          <strong>7.1</strong> 7.1 Die Lieferung erfolgt in folgende Länder:
        </p>
        <p>
          <strong>7.2</strong>
          Angaben zu Lieferzeiten finden Sie auf der jeweiligen Produktseite.
        </p>

        <h2>8. Zahlung</h2>
        <p>
          <strong>8.1</strong> Wir bieten folgende Zahlungsoptionen in unserem
          Webshop an:
        </p>
        <p>
          <strong>8.2</strong>
          Ein Recht zur Aufrechnung steht Ihnen nur dann zu, wenn Ihre
          Gegenansprüche rechtskräftig gerichtlich festgestellt oder
          unbestritten sind oder schriftlich durch uns anerkannt wurden.
        </p>
        <p>
          <strong>8.3</strong>
          Sie können ein Zurückbehaltungsrecht nur ausüben, soweit die Ansprüche
          aus dem gleichen Vertragsverhältnis resultieren.
        </p>
        <h2>9. Eigentumsvorbehalt</h2>
        <p>Bis zur vollständigen Zahlung bleibt die Ware unser Eigentum.</p>
      </div>
    </div>
  );
}
