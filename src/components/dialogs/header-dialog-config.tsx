import type { ReactNode } from "react";
import type { NonNullHeaderDialogKey } from "./dialog-types";

import nrwLiefergebiete from "../../assets/NRW_Liefergebiete.png";
import callMarieKocht from "../../assets/call-marie-kocht.jpg";

type HeaderDialogConfig = Record<
  NonNullHeaderDialogKey,
  {
    title: string;
    content: ReactNode;
  }
>;

export const headerDialogConfig: HeaderDialogConfig = {
  "ueber-marie": {
    title: "Über Marie",
    content: (
      <div className="space-y-4 text-sm leading-6">
        <p className="font-semibold">Essen auf Rädern</p>
        <p>
          Mit „Essen auf Rädern" bleiben Sie kulinarisch unabhängig – egal ob
          dauerhaft im Alter, vorübergehend nach einem Unfall oder als
          Entlastung, wenn Angehörige im Urlaub sind.
        </p>
        <p>Wir liefern gesunde Mahlzeiten direkt nach Hause.</p>
        <p>Wählen Sie Ihr Mittagessen aus, es wird heiß geliefert.</p>
        <p>So bewahren Sie sich Ihre Selbstständigkeit im Alltag.</p>
        <p>
          Erinnern Sie sich an das Gefühl von Geborgenheit und purem Genuss?
          Genau das erwartet Sie, wenn Marie kocht.
        </p>
        <p>
          Mit den besten Zutaten und einer Prise Liebe zubereitet, sind diese
          Gerichte mehr als nur Essen – es ist Ihre persönliche Auszeit vom
          Alltag.
        </p>
        <p>Entdecken Sie Ihre neue Leibspeise und bestellen Sie noch heute.</p>
        <p>Jeden Tag warm zu Ihnen geliefert.</p>
        <p className="font-medium">Liefermonopol · Marie kocht</p>
        <p className="italic">„Marie steht am Herd und zaubert etwas Leckeres."</p>
      </div>
    ),
  },
  liefergebiete: {
    title: "Liefergebiete",
    content: (
      <div className="space-y-4 text-sm leading-6">
        <p>
          Essen auf Rädern bringt Ihr Mittagessen heiß und direkt zu Ihnen nach
          Hause. Marie kocht liefert Ihr Mittagessen aus. So genießen Sie
          täglich eine warme Mahlzeit, ganz ohne Kochen.
        </p>
        <p>
          Aktuell beliefern wir ausgewählte Städte in Nordrhein-Westfalen und
          Berlin. Weitere Liefergebiete sind in Vorbereitung.
        </p>
        <img
          src={nrwLiefergebiete}
          alt="Heiss geliefert in folgenden NRW Liefergebieten: Köln, Düsseldorf, Leverkusen, Neuss, Krefeld und Duisburg"
          className="h-auto w-full max-w-md rounded-md border bg-muted/30 p-2 shadow-sm"
        />
      </div>
    ),
  },
  kontakt: {
    title: "Kontakt",
    content: (
      <div className="space-y-4 text-sm leading-6">
        <img
          src={callMarieKocht}
          alt="Marie kocht wird angerufen"
          className="h-auto w-full max-w-md rounded-md border bg-muted/30 p-2 shadow-sm"
        />
        <p>
          Wenn Sie Hilfe bei Ihrer Bestellung benötigen oder Fragen haben,
          können Sie uns gerne kontaktieren.
        </p>
        <div className="space-y-1">
          <p className="font-medium">Kontakt:</p>
          <p>02801 706239</p>
          <p>01523 3035350</p>
          <p>0170 9337961</p>
          <p>0160 91259999</p>
        </div>
      </div>
    ),
  },
  faq: {
    title: "Fragen und Antworten",
    content: (
      <div className="space-y-5 text-sm leading-6">
        <div className="space-y-2">
          <p className="font-semibold">Was kostet der tägliche Mittagstisch?</p>
          <p>Warm geliefert 5,60 €.</p>
        </div>
        <div className="space-y-2">
          <p className="font-semibold">
            Was bietet der tägliche Mittagstisch für 5,60 €?
          </p>
          <p>
            Unser täglicher Mittagstisch bietet eine vollwertige, warm
            angelieferte Mahlzeit für einen Festpreis von 5,60 € inklusive
            Lieferung.
          </p>
        </div>
        <div className="space-y-2">
          <p className="font-semibold">
            Zu welcher Uhrzeit wird das Essen geliefert?
          </p>
          <p>
            Die Lieferung erfolgt täglich in der Mittagszeit zwischen 11:00 und
            13:30 Uhr.
          </p>
        </div>
        <div className="space-y-2">
          <p className="font-semibold">Wie wird der Mittagstisch bezahlt?</p>
          <p>Per Überweisung oder PayPal direkt an den Lieferanten.</p>
        </div>
      </div>
    ),
  },
  "sozialamt-zuschuss": {
    title: "Sozialamt-Zuschuss",
    content: (
      <div className="space-y-5 text-sm leading-6">
        <div className="space-y-2">
          <p className="font-semibold">
            Essen auf Rädern Zuschuss Liefermonopol
          </p>
          <p>
            Personen, die Grundsicherung oder Sozialhilfe nach dem SGB XII
            beziehen, können je nach persönlicher Situation Anspruch auf eine
            Kostenübernahme oder einen Zuschuss für „Essen auf Rädern“ haben.
          </p>
          <p>
            Wir unterstützen Sie aktiv bei der Beantragung von
            Mahlzeitenzuschüssen beim Sozialamt.
          </p>
          <p>Täglich warm gelieferter Mittagstisch für nur 5,60 €.</p>
        </div>

        <div className="space-y-2">
          <p className="font-semibold">
            Sie benötigen finanzielle Unterstützung?
          </p>
          <p>
            Für Empfänger von Sozialhilfe oder bei vorhandenem Pflegegrad kommen
            staatliche Zuschüsse häufig in Betracht.
          </p>
          <p>
            Wir helfen Ihnen bei der Vorbereitung der Unterlagen und begleiten
            Sie bei der Beantragung beim Sozialamt.
          </p>
        </div>
      </div>
    ),
  },
};