type ApiMeal = {
  id?: string;
  name?: string;
  description?: string | null;
  price?: number | string;
  available?: boolean;
  imageUrl?: string | null;
};

type ApiWeeklyMenuEntry = {
  id?: string;
  dayOfWeek?: string;
  dayLabel?: string;
  menuDate?: string | null;
  position?: number | null;
  meal?: ApiMeal | null;
};

type ApiWeeklyMenu = {
  id?: string;
  calendarWeek?: number;
  startDate?: string | null;
  endDate?: string | null;
  title?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  supplierId?: string;
  supplierName?: string;
  entries?: ApiWeeklyMenuEntry[] | null;
};

export const mockWeeklyMenus: ApiWeeklyMenu[] = [
  {
    id: "aaaaaaa1-0000-0000-0000-000000000001",
    calendarWeek: 20,
    startDate: "2025-05-05",
    endDate: "2025-05-11",
    title: "Wochenmenü KW 20 – Klassiker",
    description: "Bunte Auswahl an Klassikern für den Wochenstart.",
    imageUrl: null,
    supplierId: "supplier-1",
    supplierName: "Lieferant Xanten",
    entries: [
      {
        id: "bbbbbbb1-0000-0000-0000-000000000001",
        dayOfWeek: "MONDAY",
        dayLabel: "Montag",
        menuDate: "2025-05-05",
        position: 1,
        meal: {
          id: "11111111-1111-1111-1111-111111111111",
          name: "Spaghetti Bolognese",
          description: "Hausgemachte Spaghetti mit fruchtiger Tomatensoße.",
          price: 9.9,
          available: true,
          imageUrl: null,
        },
      },
      {
        id: "bbbbbbb2-0000-0000-0000-000000000002",
        dayOfWeek: "TUESDAY",
        dayLabel: "Dienstag",
        menuDate: "2025-05-06",
        position: 2,
        meal: {
          id: "22222222-2222-2222-2222-222222222222",
          name: "Griechischer Salat",
          description: "Frischer Salat mit Feta, Gurke, Tomaten und Oliven.",
          price: 8.5,
          available: true,
          imageUrl: null,
        },
      },
      {
        id: "bbbbbbb3-0000-0000-0000-000000000003",
        dayOfWeek: "WEDNESDAY",
        dayLabel: "Mittwoch",
        menuDate: "2025-05-07",
        position: 3,
        meal: {
          id: "33333333-3333-3333-3333-333333333333",
          name: "Schnitzel mit Pommes",
          description: "Knuspriges Schnitzel mit Pommes frites.",
          price: 11.9,
          available: true,
          imageUrl: null,
        },
      },
      {
        id: "bbbbbbb4-0000-0000-0000-000000000004",
        dayOfWeek: "THURSDAY",
        dayLabel: "Donnerstag",
        menuDate: "2025-05-08",
        position: 4,
        meal: {
          id: "44444444-4444-4444-4444-444444444444",
          name: "Gemüse-Curry mit Reis",
          description: "Vegetarisches Curry mit Kichererbsen und Gemüse.",
          price: 9.5,
          available: true,
          imageUrl: null,
        },
      },
      {
        id: "bbbbbbb5-0000-0000-0000-000000000005",
        dayOfWeek: "FRIDAY",
        dayLabel: "Freitag",
        menuDate: "2025-05-09",
        position: 5,
        meal: {
          id: "55555555-5555-5555-5555-555555555555",
          name: "Linsensuppe",
          description: "Milde Linsensuppe mit Gemüse und Kräutern.",
          price: 7.2,
          available: true,
          imageUrl: null,
        },
      },
      {
        id: "bbbbbbb6-0000-0000-0000-000000000006",
        dayOfWeek: "SATURDAY",
        dayLabel: "Samstag",
        menuDate: "2025-05-10",
        position: 6,
        meal: {
          id: "66666666-6666-6666-6666-666666666666",
          name: "Ofenkartoffel mit Quark",
          description: "Ofenkartoffel mit Kräuterquark und Salat.",
          price: 8.9,
          available: true,
          imageUrl: null,
        },
      },
      {
        id: "bbbbbbb7-0000-0000-0000-000000000007",
        dayOfWeek: "SUNDAY",
        dayLabel: "Sonntag",
        menuDate: "2025-05-11",
        position: 7,
        meal: {
          id: "77777777-7777-7777-7777-777777777777",
          name: "Pizza Margherita",
          description: "Hausgemachte Pizza Margherita mit Mozzarella.",
          price: 10.5,
          available: true,
          imageUrl: null,
        },
      },
    ],
  },
];