import { Card, CardContent } from "../components/ui/card";

type Story = {
  id: string;
  title: string;
  subtitle: string;
  paragraphs: string[];
  imageUrl: string;
  imageAlt: string;
};

const stories: Story[] = [
  {
    id: "konrad",
    title: "Konrads große Überraschung",
    subtitle: "Gemeinsam genießen mit Essen auf Rädern in Duisburg",
    paragraphs: [
      "Konrad blickt voller Vorfreude auf den Kalender. In genau einer Woche ist es so weit: Seine Tochter Rosa kommt zu Besuch. Für diesen besonderen Tag möchte sich der Duisburger Senior eine ganz besondere Überraschung überlegen. Er möchte nicht, dass Rosa für ihn kochen muss. Sie sollen die gemeinsame Zeit vollkommen stressfrei genießen. Ein gemeinsames Mittagessen ist der perfekte Plan.",
      "Konrad weiß genau, wie er das anstellt. Er bestellt schon lange regelmäßig sein Mittagessen bei Essen auf Rädern in Duisburg, denn er weiß: Marie kocht einfach hervorragend. Die Gerichte sind immer frisch, heiß und schmecken wie hausgemacht.",
      "Dann ist der ersehnte Tag endlich da. Als Rosa zur Tür hereinspaziert, strahlt Konrad. Rosa hat als frische Ergänzung einen knackigen Salat mitgebracht. Die beiden setzen sich ins Wohnzimmer und vertiefen sich sofort in ein herzliches Gespräch. Sie lachen und erzählen von den vergangenen Wochen.",
      "Plötzlich schellt es an der Tür. Der freundliche Lieferservice von Marie kocht steht pünktlich auf der Matte. Konrad nimmt die Boxen entgegen und serviert auf der Stelle ein dampfendes, heißes Mittagessen für beide.",
      "Als Rosa den Deckel abhebt, traut sie ihren Augen kaum. Es gibt Grünkohl mit Mettwurst – Rosas absolutes Lieblingsessen. Die Überraschung ist perfekt. Beim gemeinsamen Essen stellt Rosa begeistert fest, dass Essen auf Rädern in Duisburg so viel mehr sein kann, als man denkt. Wenn Marie kocht, schmeckt man die Liebe in jedem Bissen.",
    ],
    imageUrl: "/pics/besser_schmeckts_zusammen.jpg",
    imageAlt: "Essen auf Rädern in Duisburg,Gemeinsam genießen",
  },
  {
    id: "hanne",
    title: "Süße Überraschung in Düsseldorf",
    subtitle: "Gemeinsam genießen mit Essen auf Rädern in Düsseldorf",
    paragraphs: [
      "Hanne blickt glücklich aus dem Fenster ihrer Düsseldorfer Wohnung. Heute ist ein besonderer Tag, denn ihre Tochter Sabine hat sich für einen Besuch angekündigt. Die beiden haben sich schon länger nicht mehr gesehen. Hanne möchte die gemeinsame Zeit vollkommen auskosten und nicht stundenlang in der Küche stehen. Sie hat sich deshalb eine Überraschung überlegt.",
      "Da Hanne regelmäßig bei Essen auf Rädern in Düsseldorf bestellt, weiß sie genau, wie lecker das Essen schmeckt. Sie vertraut voll und ganz auf den Service, denn Marie kocht einfach hervorragend und liefert die Speisen direkt ins Haus.",
      "Als Sabine ankommt, bringt sie als süßes Mitbringsel für später eine Packung selbstgebackene Kekse mit. Die Freude über das Wiedersehen ist riesig. Mutter und Tochter setzen sich gemütlich zusammen und fangen sofort an zu erzählen.",
      "Genau zur Mittagszeit schellt es an der Tür. Der Lieferservice von Marie kocht bringt das Essen pünktlich vorbei. Hanne deckt den Tisch und serviert das dampfende Mittagessen. Es gibt zarte Hähnchenstreifen mit Kartoffeln und Gemüse in weißer Sauce.",
      "Sabine probiert begeistert und stellt fest: Essen auf Rädern in Düsseldorf kann so viel mehr sein. Wenn Marie kocht, schmeckt das gemeinsame Mittagessen wie ein Festmahl.",
    ],
    imageUrl: "/pics/Zusammen_schmeckts_besser_Marie_kocht.jpg",
    imageAlt: "Essen auf Rädern in Düsseldorf ,Süße Überraschung in Düsseldorf",
  },
  {
    id: "gerda",
    title: "Gerdas täglicher Lichtblick",
    subtitle: "Herzlicher Service mit Essen auf Rädern in Neuss",
    paragraphs: [
      "Gerda sitzt am Fenster ihrer Wohnung in Neuss und blickt auf die ruhige Straße. Seit ihr Mann verstorben ist, sind die Tage lang und oft sehr still geworden. Ihre Familie wohnt weit weg, und Einsamkeit ist zu einer täglichen Begleiterin geworden. Doch pünktlich zur Mittagszeit hellt sich Gerdas Gesicht auf.",
      "Heute bringt der Service von Marie kocht ihr wieder ein wunderbar duftendes Gericht. Gerda spürt die Fürsorge, die in dieser Arbeit steckt. Das Essen wärmt sie von innen heraus, doch die kurze, menschliche Begegnung wärmt ihr Herz noch viel mehr.",
      "Für die Seniorin ist klar: Essen auf Rädern in Neuss sichert nicht nur die tägliche Verpflegung. Wenn Marie kocht, bringt der Service auch Wärme, Mitgefühl und ein Stück Lebensqualität direkt an die Haustür.",
    ],
    imageUrl: "/pics/Marie_kocht_heiß_geliefert.jpg",
    imageAlt: "Essen auf Rädern in Neuss ,Gerdas täglicher Lichtblick",
  },
  {
    id: "Egon",
    title: "Egons Vorfreude am Mittagstisch",
    subtitle: "Pünktlicher Genuss mit Essen auf Rädern in Krefeld",
    paragraphs: [
      "Egon liebt seine tägliche Routine in Krefeld. Sobald die Uhr die magische Zeit von 10:30 Uhr anzeigt, zieht es den Senior magisch in seine Küche. Er deckt sorgfältig den Tisch, legt das Besteck exakt bereit und nimmt Platz. Obwohl er genau weiß, dass die Lieferung erst ab 11 Uhr erfolgt, sitzt er jeden Tag voller Vorfreude da. Das Besteck hält er dabei schon erwartungsvoll in der Hand und behält das Küchenfenster fest im Blick.",
      "Diese tägliche Wartezeit ist für Egon kein lästiges Warten, sondern die reinste Vorfreude. Er vertraut voll und ganz auf den Lieferservice, denn er weiß genau, wie hervorragend Marie kocht.Essen auf Rädern in Krefeld",
      "Heute ist der Appetit besonders groß. Auf dem Speiseplan steht Egons absolutes Leibgericht: deftiges Gulasch mit zarten Nudeln und knackigem Paprikagemüse. Schon bei dem Gedanken daran läuft dem Krefelder das Wasser im Mund zusammen. Er blickt auf die Uhr, rückt sein Besteck noch einmal zurecht und spitzt die Ohren.",
      "Punktlich nach 11 Uhr hört er das vertraute Geräusch des Lieferwagens. Es klingelt, und der freundliche Fahrer von Marie kocht überreicht ihm die dampfende Mahlzeit. Egon atmet den herrlichen Duft des Gulaschs ein, lächelt glücklich und fängt sofort an zu genießen.",
      "Für den rüstigen Senior ist jede Mahlzeit ein Highlight des Tages. Essen auf Rädern in Krefeld bringt ihm einfach täglich verlässliche Freude und Geschmack auf den Teller.",
    ],
    imageUrl: "/pics/Essen_auf_Rädern_wann_kommt_Marie.jpg",
    imageAlt: "Essen auf Rädern in Krefeld ,Egons Vorfreude am Mittagstisch",
  },
];

export function StoriesPage() {
  return (
    <div className="w-full space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Geschichten
        </h1>
        <p className="max-w-3xl text-sm text-muted-foreground sm:text-base">
          Bewegende Geschichten über gemeinsame Momente, warmes Mittagessen und
          den Alltag mit Marie kocht.
        </p>
      </div>

      <div className="space-y-8">
        {stories.map((story) => (
          <Card key={story.id} className="overflow-hidden rounded-3xl">
            <CardContent className="p-0">
              <div className="grid md:grid-cols-3">
                <div className="flex items-center p-6 md:col-span-2 md:p-8">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <h2 className="text-2xl font-semibold">{story.title}</h2>
                      <p className="text-sm font-medium text-primary sm:text-base">
                        {story.subtitle}
                      </p>
                    </div>

                    <div className="space-y-4 text-sm leading-7 text-muted-foreground sm:text-base">
                      {story.paragraphs.map((paragraph, index) => (
                        <p key={index}>{paragraph}</p>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="h-full md:col-span-1 md:mr-6"> {/* hier sollten die Bilder komplette angezeigt werden, und nicht abgeschnitten */}
                  <img
                    src={story.imageUrl}
                    alt={story.imageAlt}
                    className="h-full min-h-[260px] w-full object-contain"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
