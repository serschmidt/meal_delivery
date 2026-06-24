export const STORAGE_KEY = "urban-fleet-shopping-draft-v2";

export const RIDE_OPTION_COPY = {
  already_paid: {
    title: "Option A: Ich habe schon bezahlt",
    description:
      "Click & Collect: Die Ware ist bereits bezahlt. Der Fahrer holt nur ab und benötigt den Abholcode oder die Abholnummer.",
  },
  shopping_service: {
    title: "Option B: Bitte für mich einkaufen & auslegen",
    description:
      "Einkaufsservice: Der Fahrer kauft ein, legt das Geld im Markt aus und kassiert den Warenwert erst bei Übergabe an der Haustür.",
  },
} as const;

export const EXCLUDED_ITEMS_TEXT =
  "Nicht transportiert werden zubereitete Speisen aus Restaurants oder Cafés, (teil-)aufgebaute Möbel, Sperrgut sowie rezeptpflichtige Medikamente.";

export const REACHABILITY_TEXT =
  "Der Kunde muss während des Einkaufs telefonisch erreichbar sein, damit Rückfragen oder Ersatzprodukte sofort abgestimmt werden können.";

export const AGE_GATE_TEXT =
  "Die Lieferung von Alkohol, Tabakwaren und apothekenpflichtigen Medikamenten erfolgt ausschließlich an Personen, die das gesetzliche Mindestalter erreicht haben. Bitte halten Sie Ihren Lichtbildausweis für unseren Fahrer bereit. Eine Übergabe an Minderjährige oder die Ablage vor der Tür ist gesetzlich verboten.";

export const AGE_CONFIRM_TEXT =
  "Ich bestätige, dass ich das gesetzlich vorgeschriebene Mindestalter für die bestellten Produkte erreicht habe und bei Übergabe einen gültigen Ausweis vorzeigen kann.";

export const LIMIT_HINT_TEXT =
  "Pro Fahrt gelten maximal 4 Getränkekisten sowie maximal 20 kg bei Blumenerde und Tiernahrung.";