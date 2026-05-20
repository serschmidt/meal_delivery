import { useSupplier } from "../contexts/useSupplier";

export function DatenschutzPage() {
  const { selectedSupplier } = useSupplier();
  const address = selectedSupplier?.address;

  return (
    <div className="mx-auto max-w-4xl space-y-8 py-10">
      <h1 className="text-3xl font-bold">Datenschutz</h1>

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

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Übersicht</h2>
        <ul className="space-y-1">
          <li>
            <a
              href="#schutz-ihrer-personenbezogenen-daten"
              className="underline underline-offset-4"
            >
              Schutz Ihrer personenbezogenen Daten
            </a>
          </li>
          <li>
            <a
              href="#allgemeines-zur-datenverarbeitung"
              className="underline underline-offset-4"
            >
              A. Allgemeines zur Datenverarbeitung
            </a>
          </li>
          <li>
            <a
              href="#bereitstellung-der-website-und-logfiles"
              className="underline underline-offset-4"
            >
              B. Bereitstellung der Website und Logfiles
            </a>
          </li>
          <li>
            <a
              href="#verwendung-von-cookies"
              className="underline underline-offset-4"
            >
              C. Verwendung von Cookies
            </a>
          </li>
          <li>
            <a
              href="#registrierung-als-kunde"
              className="underline underline-offset-4"
            >
              D. Registrierung als Kunde
            </a>
          </li>
          <li>
            <a
              href="#kontaktaufnahme-per-e-mail"
              className="underline underline-offset-4"
            >
              E. Kontaktaufnahme per E-Mail
            </a>
          </li>
          <li>
            <a
              href="#weitergabe-der-daten-an-dritte"
              className="underline underline-offset-4"
            >
              F. Weitergabe der Daten an Dritte
            </a>
          </li>
          <li>
            <a
              href="#rechte-der-betroffenen-person"
              className="underline underline-offset-4"
            >
              G. Rechte der betroffenen Person
            </a>
          </li>
        </ul>
      </section>

      <section id="schutz-ihrer-personenbezogenen-daten" className="space-y-3">
        <h2 className="text-xl font-semibold">
          Schutz Ihrer personenbezogenen Daten
        </h2>
        <p>
          Verantwortlicher im Sinne der Datenschutz-Grundverordnung, sonstiger
          in den Mitgliedstaaten der Europäischen Union geltenden
          Datenschutzgesetze und anderer Bestimmungen mit datenschutzrechtlichem
          Charakter ist:
        </p>

        {selectedSupplier ? (
          <>
            <p>{selectedSupplier.fullName}</p>
            <p>
              {address?.street} {address?.houseNumber}
            </p>
            <p>
              {address?.postalCode} {address?.city}
            </p>
            <p>{selectedSupplier.email}</p>
          </>
        ) : (
          <>
            <p>Kein Lieferant ausgewählt.</p>
          </>
        )}
      </section>

      <section id="allgemeines-zur-datenverarbeitung" className="space-y-3">
        <h2 className="text-xl font-semibold">
          A. Allgemeines zur Datenverarbeitung
        </h2>
        <h3 className="text-lg font-medium">
          Rechtsgrundlage für die Verarbeitung personenbezogener Daten
        </h3>
        <p>
          Soweit wir für Verarbeitungsvorgänge personenbezogener Daten eine
          Einwilligung der betroffenen Person einholen, dient Art. 6 Abs. 1 lit.
          a EU-Datenschutzgrundverordnung (DSGVO) als Rechtsgrundlage für die
          Verarbeitung personenbezogener Daten.
        </p>
        <p>
          Bei der Verarbeitung von personenbezogenen Daten, die zur Erfüllung
          eines Vertrages, dessen Vertragspartei die betroffene Person ist,
          erforderlich ist, dient Art. 6 Abs. 1 lit. b DSGVO als
          Rechtsgrundlage. Dies gilt auch für Verarbeitungsvorgänge, die zur
          Durchführung vorvertraglicher Maßnahmen erforderlich sind.
        </p>
        <p>
          Soweit eine Verarbeitung personenbezogener Daten zur Erfüllung einer
          rechtlichen Verpflichtung erforderlich ist, der unser Unternehmen
          unterliegt, dient Art. 6 Abs. 1 lit. c DSGVO als Rechtsgrundlage.
        </p>
        <p>
          Für den Fall, dass lebenswichtige Interessen der betroffenen Person
          oder einer anderen natürlichen Person eine Verarbeitung
          personenbezogener Daten erforderlich machen, dient Art. 6 Abs. 1 lit.
          d DSGVO als Rechtsgrundlage.
        </p>
        <p>
          Ist die Verarbeitung zur Wahrung eines berechtigten Interesses unseres
          Unternehmens oder eines Dritten erforderlich und überwiegen die
          Interessen, Grundrechte und Grundfreiheiten des Betroffenen das
          erstgenannte Interesse nicht, so dient Art. 6 Abs. 1 lit. f DSGVO als
          Rechtsgrundlage für die Verarbeitung.
        </p>
      </section>

      <section
        id="bereitstellung-der-website-und-logfiles"
        className="space-y-3"
      >
        <h2 className="text-xl font-semibold">
          B. Bereitstellung der Website und Logfiles
        </h2>
        <p>
          Bei jedem Aufruf unserer Internetseite werden durch ein automatisiertes
          System Daten und Informationen von uns erfasst. Folgende Daten werden
          hierbei erhoben:
        </p>
        <p>[Zählen Sie Hier die in Ihren Log-Dateien gesammelten Informationen auf]</p>
        <p>
          Diese Daten werden in den Logfiles unseres Systems gespeichert. Eine
          Speicherung dieser Daten zusammen mit anderen personenbezogenen Daten
          des Nutzers findet nicht statt.
        </p>
        <h3 className="text-lg font-medium">Rechtsgrundlage für die Datenverarbeitung</h3>
        <p>
          Rechtsgrundlage für die vorübergehende Speicherung der Daten und der
          Logfiles ist Art. 6 Abs. 1 lit. f DSGVO.
        </p>
        <h3 className="text-lg font-medium">Zweck der Datenverarbeitung</h3>
        <p>
          Die Speicherung in Logfiles erfolgt, um die Funktionsfähigkeit der
          Website sicherzustellen. In diesen Zwecken liegt auch unser
          berechtigtes Interesse an der Datenverarbeitung nach Art. 6 Abs. 1
          lit. f DSGVO.
        </p>
        <h3 className="text-lg font-medium">Dauer der Speicherung</h3>
        <p>
          Die Daten werden gelöscht, sobald sie für die Erreichung des Zweckes
          ihrer Erhebung nicht mehr erforderlich sind. Im Falle der Erfassung
          der Daten zur Bereitstellung der Website ist dies der Fall, wenn die
          jeweilige Sitzung beendet ist.
        </p>
        <h3 className="text-lg font-medium">Widerspruchs- und Beseitigungsmöglichkeit</h3>
        <p>
          Die Erfassung der Daten zur Bereitstellung der Website und die
          Speicherung der Daten in Logfiles ist für den Betrieb der Internetseite
          zwingend erforderlich. Es besteht folglich seitens des Nutzers keine
          Widerspruchsmöglichkeit.
        </p>
      </section>

      <section id="verwendung-von-cookies" className="space-y-3">
        <h2 className="text-xl font-semibold">C. Verwendung von Cookies</h2>
        <p>
          Unsere Internetseiten verwenden an mehreren Stellen Cookies. Cookies
          sind kleine Textdateien, die auf Ihrem Rechner abgelegt werden und die
          Ihr Browser speichert. Dadurch wird es ermöglicht, auf Ihrem PC
          spezifische, auf Sie, den Nutzer, bezogene Informationen zu speichern,
          während Sie unsere Web-Site besuchen.
        </p>
        <p>Folgende Informationen werden durch Cookies gespeichert:</p>
        <ul className="list-disc space-y-1 pl-6">
          <li>
            Eine Sitzungs-Id um Ihnen Ihren aktuellen Warenkorb zuordnen zu
            können.
          </li>
          <li>
            Eine Kunden-Id, um Sie identifizieren zu können, wenn Sie in Ihrem
            Kundenkonto angemeldet sind.
          </li>
          <li>
            Eine Liste mit den IDs der gegenwärtig im Warenkorb befindlichen
            Produkte.
          </li>
        </ul>
      </section>

      <section id="registrierung-als-kunde" className="space-y-3">
        <h2 className="text-xl font-semibold">D. Registrierung als Kunde</h2>
        <p>
          Sofern Sie als Kunde unserer Angebote auf unserer Webseite wahrnehmen
          möchten, ist eine Registrierung unter Angabe von personenbezogenen
          Daten erforderlich.
        </p>
        <p>
          Im Rahmen des Registrierungsprozesses wird eine Einwilligung des
          Nutzers zur Verarbeitung dieser Daten eingeholt.
        </p>
      </section>

      <section id="kontaktaufnahme-per-e-mail" className="space-y-3">
        <h2 className="text-xl font-semibold">E. Kontaktaufnahme per E-Mail</h2>
        <p>
          Über die auf unserer Internetseite angegebene E-Mail Adresse oder das
          bereit gestellte Kontaktformular können Sie Kontakt mit uns aufnehmen.
        </p>
        <p>
          Bei einer Kontaktaufnahme per E-Mail wird Ihre E-Mail Adresse und Ihre
          Nachricht an uns übermittelt und von uns gespeichert.
        </p>
      </section>

      <section id="weitergabe-der-daten-an-dritte" className="space-y-3">
        <h2 className="text-xl font-semibold">F. Weitergabe der Daten an Dritte</h2>
        <p>
          Im Rahmen der Ausführung der getätigten Bestellung ist es notwendig,
          dass wir Ihren Namen und Ihre Anschrift bestehend aus Straße und
          Wohnort an unseren Paketdienstleister übermitteln.
        </p>
        <p>
          Die Übermittlung ist notwendig, um Ihre Bestellung ausliefern zu
          können. Die Übermittlung der Daten beschränkt sich hierbei auf das
          erforderliche Minimum.
        </p>
      </section>

      <section id="rechte-der-betroffenen-person" className="space-y-3">
        <h2 className="text-xl font-semibold">G. Rechte der betroffenen Person</h2>
        <p>
          Werden personenbezogene Daten von Ihnen verarbeitet, sind Sie
          Betroffener i.S.d. DSGVO und es stehen Ihnen verschiedene Rechte
          gegenüber uns zu.
        </p>
        <ol className="list-decimal space-y-1 pl-6">
          <li>Auskunftsrecht.</li>
          <li>Recht auf Berichtigung.</li>
          <li>Recht auf Löschung.</li>
          <li>Recht auf Einschränkung der Verarbeitung.</li>
          <li>Recht auf Unterrichtung.</li>
          <li>Recht auf Datenübertragbarkeit.</li>
          <li>Widerspruchsrecht.</li>
          <li>Recht auf Widerruf der datenschutzrechtlichen Einwilligungserklärung.</li>
          <li>Recht auf automatisierte Entscheidung im Einzelfall.</li>
          <li>Recht auf Beschwerde bei Aufsichtsbehörden.</li>
        </ol>
      </section>
    </div>
  );
}