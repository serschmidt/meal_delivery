export function ImpressumPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-10">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold tracking-tight">Impressum</h1>
        <p className="text-sm leading-6 text-muted-foreground">
          Angaben gemäß § 5 TMG sowie ergänzende Informationen zur Rolle der
          Plattform.
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Betreiber der Plattform</h2>

        <address className="not-italic space-y-1 leading-6">
          <p className="font-medium">typeqxx</p>
          <p>Herr Hans-Dieter Riechmann</p>
          <p>Handelsregister München</p>
          <p>HRB: 202791</p>
        </address>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Büro und Kontakt</h2>

        <address className="not-italic space-y-1 leading-6">
          <p>Dagmar Preuten | Hans-Dieter Riechmann</p>
          <p>Geschäftsführerin | Geschäftsführer</p>
          <p>
            <a
              href="tel:+4928014507"
              className="underline underline-offset-4"
            >
              +49 2801 4507
            </a>
            {" | "}
            <a
              href="tel:+4916091259999"
              className="underline underline-offset-4"
            >
              +49 160 912 599 99
            </a>
          </p>
          <p>type-qxx</p>
          <p>Waldblick 27</p>
          <p>D-46509 Xanten</p>
          <p>
            <a
              href="mailto:preuten@type-qxx.de"
              className="underline underline-offset-4"
            >
              preuten@type-qxx.de
            </a>
          </p>
        </address>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Hinweis zur Plattform</h2>

        <blockquote className="border-l-4 pl-4 italic text-muted-foreground">
          „Marie kocht ist ein reiner Online-Marktplatz. Wir stellen lediglich
          die technische Plattform zur Verfügung, auf der Nutzer Angebote
          veröffentlichen und Verträge untereinander abschließen können. Marie
          kocht wird selbst nicht Vertragspartner dieser Verträge und übernimmt
          keine Haftung für die angebotenen Leistungen, Produkte oder die
          Abwicklung.“
        </blockquote>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">
          Vertragsgegenstand und Rolle der Plattform
        </h2>

        <p className="leading-6 text-foreground">
          Marie kocht stellt den Nutzern eine technische Plattform zur Verfügung,
          um Angebote zu inserieren und miteinander in Kontakt zu treten.
        </p>
        <p className="leading-6 text-foreground">
          Die auf der Plattform veröffentlichten Angebote, Inhalte und
          Beschreibungen stammen ausschließlich von den jeweiligen Nutzern.
          Marie kocht prüft diese Inhalte nicht vorab auf Richtigkeit oder
          Rechtmäßigkeit.
        </p>
        <p className="leading-6 text-foreground">
          Verträge über die auf der Plattform angebotenen Leistungen oder Waren
          kommen ausschließlich und direkt zwischen den beteiligten Nutzern
          zustande. Marie kocht ist weder Partei noch Vertreter in diesem
          Vertragsverhältnis und nicht an der Erfüllung beteiligt.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">
          Verbraucherstreitbeilegung / Universalschlichtungsstelle
        </h2>

        <p className="leading-6 text-foreground">
          Wir sind nicht bereit oder verpflichtet, an
          Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle
          teilzunehmen.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Haftung für Inhalte</h2>

        <p className="leading-6 text-foreground">
          Als Diensteanbieter sind wir gemäß § 7 Abs. 1 TMG für eigene Inhalte
          auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach
          §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet,
          übermittelte oder gespeicherte fremde Informationen zu überwachen oder
          nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit
          hinweisen.
        </p>
        <p className="leading-6 text-foreground">
          Verpflichtungen zur Entfernung oder Sperrung der Nutzung von
          Informationen nach den allgemeinen Gesetzen bleiben hiervon unberührt.
          Eine diesbezügliche Haftung ist jedoch erst ab dem Zeitpunkt der
          Kenntnis einer konkreten Rechtsverletzung möglich. Bei Bekanntwerden
          entsprechender Rechtsverletzungen werden wir diese Inhalte umgehend
          entfernen.
        </p>
      </section>
    </div>
  );
}