import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";

const founderStory = {
  title:
    "Wie ein Schlaganfall-Überlebender das Essen auf Rädern neu gedacht hat",
  subtitle:
    "Vom Top-Manager zum Pflegefall – und zurück zu einer sozialen Mission",
  imageUrl: "/pics/Riechmann.jpg",
  imageAlt: "Hans-Dieter Riechmann, Gründer von Marie kocht",
  sourceUrl:
    "https://www.openpr.de/news/1313287/Hans-Dieter-Riechmann-gruendet-Plattform-fuer-bezahlbares-Senioren-Essen-nach-Schicksalsschlag.html",
  paragraphs: [
    "Vor dem Einschnitt im Jahr 2021 war Hans-Dieter Riechmann nach eigener Darstellung in einer Management-Welt aus strategischen Entscheidungen, hochkarätigen Geschäftsterminen und großer operativer Verantwortung zu Hause.",
    "Ein plötzlicher Schlaganfall veränderte dieses Leben grundlegend. Auf Intensivstation, Rehabilitation und die Rückkehr in einen stark veränderten Alltag folgte die Erfahrung, dass selbst einfache Handgriffe zu großen Hürden werden können.",
    "Besonders drastisch zeigte sich das bei der Ernährung. Kochen oder auch nur das eigenständige Erwärmen einer ausgewogenen Mahlzeit war zeitweise kaum möglich, was laut der veröffentlichten Gründergeschichte zu Mangelerscheinungen und einem deutlichen Verlust an Lebensqualität führte.",
    "Bei der Suche nach Unterstützung testete Hans-Dieter Riechmann klassische Angebote für Essen auf Rädern. Dabei störte ihn vor allem das Preisniveau, das aus seiner Sicht für viele ältere, kranke oder einkommensschwächere Menschen kaum tragbar ist.",
    "Aus dieser Erfahrung entstand die Idee zu Marie kocht: eine moderne Plattform, die warme Mahlzeiten bezahlbarer und organisatorisch zugänglicher machen soll. Laut der veröffentlichten Darstellung war das Ziel, digitale Prozesse, Logistik und Versorgung neu zu kombinieren.",
    "Die Mission beschränkt sich dabei nicht nur auf die Essenslieferung. Nach der veröffentlichten Beschreibung unterstützt Marie kocht Menschen zusätzlich auch beim Umgang mit Anträgen und Fragen rund um mögliche Sozialleistungen.",
    "So wurde aus einer persönlichen Krise eine neue Aufgabe: nicht nur Essen zu liefern, sondern zugleich ein Stück Würde, Verlässlichkeit und soziale Teilhabe in den Alltag von Menschen zurückzubringen.",
  ],
};

export function GruendergeschichtePage() {
  return (
    <div className="w-full space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Gründergeschichte
        </h1>
        <p className="max-w-3xl text-sm text-muted-foreground sm:text-base">
          Die Geschichte hinter Marie kocht und der persönliche Weg von
          Hans-Dieter Riechmann zur Idee einer bezahlbaren Essensversorgung.
        </p>
      </div>
      <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
        <img
          src=".../../pics/Foto-Riechmann.png"
          alt="Dr. Harald Schönfeld & Hans-Dieter Riechmann vor dem Schlaganfall"
          className="h-auto max-h-[480px] w-full object-contain"
        />
        <p className="mt-2 text-sm text-muted-foreground">
          Vom Top-Manager zum Pflegefall - und zurück: <br />
          Wie ein Schlaganfall-Überlebender „Essen auf Rädern“ neu denkt,
          butterflymanager GmbH.
        </p>
        <Button asChild variant="outline">
          <a
            href="https://www.pressebox.de/pressemitteilung/butterflymanager-gmbh/vom-top-manager-zum-pflegefall-und-zurck-wie-ein-schlaganfall-berlebender-essen-auf-rdern-neu-denkt/boxid/1300257?utm_source=Belegmail&utm_medium=Email&utm_campaign=Aktiv"
            target="_blank"
            rel="noopener noreferrer"
          >
            Zur PresseBox-Veröffentlichung
          </a>
        </Button>
      </div>

      <Card className="overflow-hidden rounded-3xl">
        <CardContent className="p-0">
          <div className="grid md:grid-cols-3">
            <div className="flex items-center p-6 md:col-span-2 md:p-8">
              <div className="space-y-4">
                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold">
                    {founderStory.title}
                  </h2>
                  <p className="text-sm font-medium text-primary sm:text-base">
                    {founderStory.subtitle}
                  </p>
                </div>

                <div className="space-y-4 text-sm leading-7 text-muted-foreground sm:text-base">
                  {founderStory.paragraphs.map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                  <Button asChild variant="outline">
                    <a
                      href={founderStory.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Zur veröffentlichten Quelle
                    </a>
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex h-full items-center justify-center bg-muted/20 p-4 md:col-span-1 md:p-6">
              <img
                src={founderStory.imageUrl}
                alt={founderStory.imageAlt}
                className="h-auto max-h-[420px] w-full object-contain"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
