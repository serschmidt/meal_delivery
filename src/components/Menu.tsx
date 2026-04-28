import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { useCart } from "../contexts/useCart";
import { useSupplier } from "../contexts/useSupplier";
import { toast } from "sonner";

const API_BASE_URL = "http://localhost:8080";

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

type WeeklyMeal = {
  id: string;
  name: string;
  description: string;
  price: number;
  available: boolean;
  imageUrl?: string;
};

type WeeklyMenuEntry = {
  id: string;
  dayOfWeek: string;
  dayLabel: string;
  menuDate: string | null;
  position: number | null;
  meal: WeeklyMeal;
};

type WeeklyMenu = {
  id: string;
  calendarWeek: number | null;
  startDate: string | null;
  endDate: string | null;
  title: string;
  description: string;
  imageUrl?: string;
  supplierId?: string;
  supplierName?: string;
  entries: WeeklyMenuEntry[];
};

type CartItem = {
  mealId: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
};

const dayOrder: Record<string, number> = {
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
  SUNDAY: 7,
};

function formatPrice(value: number) {
  return value.toFixed(2).replace(".", ",");
}

function formatDateRange(startDate: string | null, endDate: string | null) {
  if (!startDate && !endDate) return "";
  if (startDate && endDate) return `${startDate} bis ${endDate}`;
  return startDate ?? endDate ?? "";
}

function normalizeMeal(meal: ApiMeal | null | undefined): WeeklyMeal {
  return {
    id: meal?.id ?? crypto.randomUUID(),
    name: meal?.name ?? "Unbenanntes Gericht",
    description: meal?.description ?? "Keine Beschreibung vorhanden.",
    price: Number(meal?.price ?? 0),
    available: meal?.available ?? true,
    imageUrl: meal?.imageUrl ?? undefined,
  };
}

function normalizeEntry(
  entry: ApiWeeklyMenuEntry,
  index: number,
): WeeklyMenuEntry {
  return {
    id: entry.id ?? `entry-${index}-${crypto.randomUUID()}`,
    dayOfWeek: entry.dayOfWeek ?? "",
    dayLabel: entry.dayLabel ?? entry.dayOfWeek ?? `Tag ${index + 1}`,
    menuDate: entry.menuDate ?? null,
    position: entry.position ?? null,
    meal: normalizeMeal(entry.meal),
  };
}

function normalizeWeeklyMenu(menu: ApiWeeklyMenu, index: number): WeeklyMenu {
  const normalizedEntries = (menu.entries ?? [])
    .map((entry, entryIndex) => normalizeEntry(entry, entryIndex))
    .sort((a, b) => {
      const posA = a.position ?? Number.MAX_SAFE_INTEGER;
      const posB = b.position ?? Number.MAX_SAFE_INTEGER;

      if (posA !== posB) return posA - posB;

      return (dayOrder[a.dayOfWeek] ?? 999) - (dayOrder[b.dayOfWeek] ?? 999);
    })
    .slice(0, 7);

  return {
    id: menu.id ?? `weekly-menu-${index}`,
    calendarWeek: menu.calendarWeek ?? null,
    startDate: menu.startDate ?? null,
    endDate: menu.endDate ?? null,
    title:
      menu.title?.trim() ||
      (menu.calendarWeek
        ? `Wochenmenü KW ${menu.calendarWeek}`
        : `Wochenmenü ${index + 1}`),
    description:
      menu.description?.trim() ||
      "Frisch zusammengestellte Gerichte für diese Woche.",
    imageUrl: menu.imageUrl ?? normalizedEntries[0]?.meal.imageUrl ?? undefined,
    supplierId: menu.supplierId ?? undefined,
    supplierName: menu.supplierName ?? undefined,
    entries: normalizedEntries,
  };
}

export function Menu() {
  const { addToCart } = useCart();
  const { selectedSupplier } = useSupplier();

  const [weeklyMenus, setWeeklyMenus] = useState<WeeklyMenu[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    const loadWeeklyMenus = async () => {
      try {
        setIsLoading(true);
        setError("");

        const response = await fetch(`${API_BASE_URL}/api/weekly-menus`, {
          signal: controller.signal,
          headers: {
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Wochenübersichten konnten nicht geladen werden.");
        }

        const data: ApiWeeklyMenu[] = await response.json();

        const normalized = Array.isArray(data)
          ? data.map((menu, index) => normalizeWeeklyMenu(menu, index))
          : [];

        setWeeklyMenus(normalized);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;

        setError(
          err instanceof Error
            ? err.message
            : "Fehler beim Laden der Wochenübersichten.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadWeeklyMenus();

    return () => controller.abort();
  }, []);

  const filteredMenus = useMemo(() => {
    if (!selectedSupplier?.id) return weeklyMenus;
    return weeklyMenus.filter(
      (menu) => menu.supplierId === selectedSupplier.id,
    );
  }, [weeklyMenus, selectedSupplier]);

  return (
    <div className="m-4 space-y-6">
      {selectedSupplier && (
        <p className="text-sm text-muted-foreground">
          Aktiver Supplier:{" "}
          <span className="font-medium text-foreground">
            {selectedSupplier.fullName}
          </span>
        </p>
      )}

      {isLoading && (
        <p className="text-sm text-muted-foreground">
          Wochenübersichten werden geladen...
        </p>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      {!isLoading && !error && filteredMenus.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Für den ausgewählten Supplier wurden keine Wochenmenüs gefunden.
        </p>
      )}

      {!isLoading &&
        !error &&
        filteredMenus.map((menu) => {
          const firstRow = menu.entries.slice(0, 4);
          const secondRow = menu.entries.slice(4, 7);
          const dateRange = formatDateRange(menu.startDate, menu.endDate);

          return (
            <Card key={menu.id} className="overflow-hidden rounded-3xl">
              <CardHeader className="space-y-2">
                <CardTitle className="text-2xl">{menu.title}</CardTitle>

                <p className="text-sm text-muted-foreground">
                  {menu.description}
                </p>

                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  {menu.calendarWeek && <span>KW {menu.calendarWeek}</span>}
                  {dateRange && <span>{dateRange}</span>}
                  {menu.supplierName && <span>von {menu.supplierName}</span>}
                </div>
              </CardHeader>

              <CardContent>
                <div className="grid gap-6 lg:grid-cols-[180px_1fr]">
                  <div className="overflow-hidden rounded-2xl border bg-muted/30">
                    {menu.imageUrl ? (
                      <img
                        src={menu.imageUrl}
                        alt={menu.title}
                        className="h-[160px] w-full object-cover lg:h-full"
                      />
                    ) : (
                      <div className="flex h-[160px] items-center justify-center px-4 text-center text-sm text-muted-foreground">
                        Kein Bild vorhanden
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    {menu.entries.length === 0 && (
                      <div className="rounded-2xl border bg-background p-4 text-sm text-muted-foreground">
                        Für dieses Wochenmenü sind aktuell noch keine Gerichte
                        eingetragen.
                      </div>
                    )}

                    {firstRow.length > 0 && (
                      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        {firstRow.map((entry) => (
                          <div
                            key={entry.id}
                            className="flex h-full flex-col rounded-2xl border bg-background p-4 shadow-sm"
                          >
                            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                              {entry.dayLabel}
                            </p>

                            <h3 className="mt-2 line-clamp-2 font-semibold">
                              {entry.meal.name}
                            </h3>

                            <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">
                              {entry.meal.description}
                            </p>

                            <p className="mt-3 font-medium">
                              € {formatPrice(entry.meal.price)}
                            </p>

                            <Button
                              type="button"
                              size="sm"
                              className="mt-auto pt-3"
                              onClick={() => {
                                addToCart({
                                  mealId: entry.meal.id,
                                  name: entry.meal.name,
                                  description: entry.meal.description,
                                  price: entry.meal.price,
                                  imageUrl: entry.meal.imageUrl,
                                } as CartItem);

                                toast.success("Zum Warenkorb hinzugefügt", {
                                  description: `${entry.meal.name} wurde hinzugefügt.`,
                                });
                              }}
                              disabled={!entry.meal.available}
                            >
                              {entry.meal.available
                                ? "In den Warenkorb"
                                : "Nicht verfügbar"}
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}

                    {secondRow.length > 0 && (
                      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {secondRow.map((entry) => (
                          <div
                            key={entry.id}
                            className="flex h-full flex-col rounded-2xl border bg-background p-4 shadow-sm"
                          >
                            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                              {entry.dayLabel}
                            </p>

                            <h3 className="mt-2 line-clamp-2 font-semibold">
                              {entry.meal.name}
                            </h3>

                            <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">
                              {entry.meal.description}
                            </p>

                            <p className="mt-3 font-medium">
                              € {formatPrice(entry.meal.price)}
                            </p>

                            <Button
                              type="button"
                              size="sm"
                              className="mt-auto pt-3"
                              onClick={() =>
                                addToCart({
                                  mealId: entry.meal.id,
                                  name: entry.meal.name,
                                  description: entry.meal.description,
                                  price: entry.meal.price,
                                  imageUrl: entry.meal.imageUrl,
                                } as CartItem)
                              }
                              disabled={!entry.meal.available}
                            >
                              {entry.meal.available
                                ? "In den Warenkorb"
                                : "Nicht verfügbar"}
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
    </div>
  );
}
