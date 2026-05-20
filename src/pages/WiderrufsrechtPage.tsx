import { useSupplier } from "../contexts/useSupplier";

export function WiderrufsrechtPage() {
  const { selectedSupplier } = useSupplier();
  const address = selectedSupplier?.address;

  return (
    <div className="mx-auto max-w-4xl space-y-8 py-10">
      <h1 className="text-3xl font-bold">Widerrufsrecht</h1>

      <p className="text-muted-foreground">
        Sie sind hier:{" "}
        <a
          href="https://liefermonopol.de/"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-4"
        >
          Täglich Mittagessen warm geliefert
        </a>
      </p>

      {selectedSupplier && (
        <section className="space-y-2 rounded-md border p-4">
          <h2 className="text-xl font-semibold">Ausgewählter Lieferant</h2>
          <p>{selectedSupplier.fullName}</p>
          {address && (
            <>
              <p>
                {address.street} {address.houseNumber}
              </p>
              <p>
                {address.postalCode} {address.city}
              </p>
            </>
          )}
          <p>{selectedSupplier.email}</p>
          {selectedSupplier.phone && <p>{selectedSupplier.phone}</p>}
        </section>
      )}

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Widerrufsrecht</h2>
        <p>
          Sie haben das Recht, binnen vierzehn Tagen ohne Angabe von Gründen
          diesen Vertrag zu widerrufen. Die Widerrufsfrist beträgt vierzehn Tage
          ab dem Tag an dem Sie oder ein von Ihnen benannter Dritter, der nicht
          der Beförderer ist, die Waren in Besitz genommen haben bzw. hat.
        </p>
        <p>Um Ihr Widerrufsrecht auszuüben, müssen Sie uns</p>
        <p>Marie kocht</p>
        <p>Höninger Weg 278</p>
        <p>50969 Köln</p>
        <p>
          E-Mail:{" "}
          <a
            href="mailto:info.mariakocht@web.de"
            className="underline underline-offset-4"
          >
            info.mariakocht@web.de
          </a>
        </p>
        <p>
          mittels einer eindeutigen Erklärung (z. B. ein mit der Post versandter
          Brief, Telefax oder E-Mail) über Ihren Entschluss, diesen Vertrag zu
          widerrufen, informieren. Sie können dafür das Muster-Widerrufsformular
          verwenden, das jedoch nicht vorgeschrieben ist.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Folgen des Widerrufs</h2>
        <p>
          Wenn Sie diesen Vertrag widerrufen, haben wir Ihnen alle Zahlungen,
          die wir von Ihnen erhalten haben, einschließlich der Lieferkosten (mit
          Ausnahme der zusätzlichen Kosten, die sich daraus ergeben, dass Sie
          eine andere Art der Lieferung als die von uns angebotene, günstigste
          Standardlieferung gewählt haben), unverzüglich und spätestens binnen
          vierzehn Tagen ab dem Tag zurückzuzahlen, an dem die Mitteilung über
          Ihren Widerruf dieses Vertrags bei uns eingegangen ist.
        </p>
        <p>
          Für diese Rückzahlung verwenden wir dasselbe Zahlungsmittel, das Sie
          bei der ursprünglichen Transaktion eingesetzt haben, es sei denn, mit
          Ihnen wurde ausdrücklich etwas anderes vereinbart; in keinem Fall
          werden Ihnen wegen dieser Rückzahlung Entgelte berechnet.
        </p>
        <p>
          Sie haben die Waren unverzüglich und in jedem Fall spätestens binnen
          vierzehn Tagen ab dem Tag, an dem Sie uns über den Widerruf dieses
          Vertrags unterrichten, an uns zurückzusenden oder zu übergeben. Die
          Frist ist gewahrt, wenn Sie die Waren vor Ablauf der Frist von
          vierzehn Tagen absenden.
        </p>
        <p>
          Wir tragen die Kosten der Rücksendung der Waren. Sie müssen für einen
          etwaigen Wertverlust der Waren nur aufkommen, wenn dieser Wertverlust
          auf einen zur Prüfung der Beschaffenheit, Eigenschaften und
          Funktionsweise der Waren nicht notwendigen Umgang mit ihnen
          zurückzuführen ist.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Widerrufsrecht bei Downloads</h2>
        <p>
          Sie haben das Recht, binnen vierzehn Tagen ohne Angabe von Gründen
          diesen Vertrag zu widerrufen.
        </p>
        <p>Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag des Vertragsabschlusses.</p>
        <p>Um Ihr Widerrufsrecht auszuüben, müssen Sie uns</p>
        <p>Marie kocht</p>
        <p>Höninger Weg 278</p>
        <p>50969 Köln</p>
        <p>
          E-Mail:{" "}
          <a
            href="mailto:info.mariakocht@web.de"
            className="underline underline-offset-4"
          >
            info.mariakocht@web.de
          </a>
        </p>
        <p>
          mittels einer eindeutigen Erklärung (z. B. ein mit der Post versandter
          Brief, Telefax oder E-Mail) über Ihren Entschluss, diesen Vertrag zu
          widerrufen, informieren. Sie können dafür das Muster-Widerrufsformular
          verwenden, das jedoch nicht vorgeschrieben ist.
        </p>
        <p>
          Zur Wahrung der Widerrufsfrist reicht es aus, dass Sie die Mitteilung
          über die Ausübung des Widerrufsrechts vor Ablauf der Widerrufsfrist
          absenden.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Folgen des Widerrufs bei Downloads</h2>
        <p>
          Wenn Sie diesen Vertrag widerrufen, haben wir Ihnen alle Zahlungen,
          die wir von Ihnen erhalten haben, einschließlich der Lieferkosten (mit
          Ausnahme der zusätzlichen Kosten, die sich daraus ergeben, dass Sie
          eine andere Art der Lieferung als die von uns angebotene, günstigste
          Standardlieferung gewählt haben), unverzüglich und spätestens binnen
          vierzehn Tagen ab dem Tag zurückzuzahlen, an dem die Mitteilung über
          Ihren Widerruf dieses Vertrags bei uns eingegangen ist.
        </p>
        <p>
          Für diese Rückzahlung verwenden wir dasselbe Zahlungsmittel, das Sie
          bei der ursprünglichen Transaktion eingesetzt haben, es sei denn, mit
          Ihnen wurde ausdrücklich etwas anderes vereinbart; in keinem Fall
          werden Ihnen wegen dieser Rückzahlung Entgelte berechnet.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Widerrufsrecht bei Dienstleistungen</h2>
        <p>
          Sie haben das Recht, binnen vierzehn Tagen ohne Angabe von Gründen
          diesen Vertrag zu widerrufen.
        </p>
        <p>Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag des Vertragsabschlusses.</p>
        <p>Um Ihr Widerrufsrecht auszuüben, müssen Sie uns</p>
        <p>Marie kocht</p>
        <p>Höninger Weg 278</p>
        <p>50969 Köln</p>
        <p>
          E-Mail:{" "}
          <a
            href="mailto:info.mariakocht@web.de"
            className="underline underline-offset-4"
          >
            info.mariakocht@web.de
          </a>
        </p>
        <p>
          mittels einer eindeutigen Erklärung (z. B. ein mit der Post versandter
          Brief, Telefax oder E-Mail) über Ihren Entschluss, diesen Vertrag zu
          widerrufen, informieren. Sie können dafür das beigefügte
          Muster-Widerrufsformular verwenden, das jedoch nicht vorgeschrieben
          ist.
        </p>
        <p>
          Zur Wahrung der Widerrufsfrist reicht es aus, dass Sie die Mitteilung
          über die Ausübung des Widerrufsrechts vor Ablauf der Widerrufsfrist
          absenden.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Folgen des Widerrufs bei Dienstleistungen</h2>
        <p>
          Wenn Sie diesen Vertrag widerrufen, haben wir Ihnen alle Zahlungen,
          die wir von Ihnen erhalten haben, einschließlich der Lieferkosten (mit
          Ausnahme der zusätzlichen Kosten, die sich daraus ergeben, dass Sie
          eine andere Art der Lieferung als die von uns angebotene, günstigste
          Standardlieferung gewählt haben), unverzüglich und spätestens binnen
          vierzehn Tagen ab dem Tag zurückzuzahlen, an dem die Mitteilung über
          Ihren Widerruf dieses Vertrags bei uns eingegangen ist.
        </p>
        <p>
          Für diese Rückzahlung verwenden wir dasselbe Zahlungsmittel, das Sie
          bei der ursprünglichen Transaktion eingesetzt haben, es sei denn, mit
          Ihnen wurde ausdrücklich etwas anderes vereinbart; in keinem Fall
          werden Ihnen wegen dieser Rückzahlung Entgelte berechnet.
        </p>
      </section>
    </div>
  );
}