import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RIDE_OPTION_COPY } from "./constants";
import { STORE_CATEGORIES } from "./types";
import type { Ride } from "./types";
import {
  formatKm,
  getRidePriceBreakdown,
  hasSensitiveItemsInText,
  shoppingItemsToText,
} from "./utils";

type RideCardProps = {
  ride: Ride;
  index: number;
  canRemove: boolean;
  onRemove: () => void;
  onCalculateDistance: () => void;
  onSelectOption: (option: Ride["option"]) => void;
  onCategoryChange: (category: Ride["category"]) => void;
  onStoreFieldChange: (field: "name", value: string) => void;
  onStoreAddressChange: (
    field: "street" | "houseNumber" | "postalCode" | "city",
    value: string,
  ) => void;
  onPickupCodeChange: (value: string) => void;
  onShoppingItemChange: (itemId: string, value: string) => void;
  onShoppingItemSave: (itemId: string) => void;
  onShoppingItemEdit: (itemId: string) => void;
  onShoppingItemRemove: (itemId: string) => void;
  onAddShoppingItem: () => void;
};

export function RideCard({
  ride,
  index,
  canRemove,
  onRemove,
  onCalculateDistance,
  onSelectOption,
  onCategoryChange,
  onStoreFieldChange,
  onStoreAddressChange,
  onPickupCodeChange,
  onShoppingItemChange,
  onShoppingItemSave,
  onShoppingItemEdit,
  onShoppingItemRemove,
  onAddShoppingItem,
}: RideCardProps) {
  const hasSensitiveItems = hasSensitiveItemsInText(
    shoppingItemsToText(ride.shoppingItems),
  );
  const { driverExtra } = getRidePriceBreakdown(ride.distanceKm);

  return (
    <Card className="rounded-3xl">
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle>Fahrt {index + 1}</CardTitle>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={onCalculateDistance}>
            {ride.routeLoading ? "Berechne Strecke..." : "Strecke berechnen"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={onRemove}
            disabled={!canRemove}
          >
            Fahrt entfernen
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          {(["already_paid", "shopping_service"] as const).map((optionKey) => (
            <button
              key={optionKey}
              type="button"
              onClick={() => onSelectOption(optionKey)}
              className={`rounded-2xl border p-5 text-left transition ${
                ride.option === optionKey
                  ? "border-primary bg-primary/5"
                  : "border-border bg-background hover:border-primary/40"
              }`}
            >
              <p className="text-base font-semibold">
                {RIDE_OPTION_COPY[optionKey].title}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                {RIDE_OPTION_COPY[optionKey].description}
              </p>
            </button>
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-[220px_360px_1fr]">
          <div className="space-y-3">
            <p className="text-sm font-medium">Geschäft auswählen</p>

            <div className="hidden rounded-2xl border p-4 xl:block">
              <div className="space-y-3">
                {STORE_CATEGORIES.map((category) => (
                  <label
                    key={category}
                    className="flex items-center gap-3 text-sm"
                  >
                    <input
                      type="radio"
                      name={`store-category-${ride.id}`}
                      checked={ride.category === category}
                      onChange={() => onCategoryChange(category)}
                      className="h-4 w-4"
                    />
                    <span>{category}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="xl:hidden">
              <ScrollArea className="w-full whitespace-nowrap rounded-2xl border">
                <div className="flex w-max gap-2 p-3">
                  {STORE_CATEGORIES.map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => onCategoryChange(category)}
                      className={`rounded-full border px-3 py-1.5 text-sm ${
                        ride.category === category
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-background"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </div>
          </div>

          <div className="space-y-4 rounded-2xl border p-4">
            <div className="space-y-2">
              <Label htmlFor={`store-name-${ride.id}`}>
                Name des Geschäfts
              </Label>
              <Input
                id={`store-name-${ride.id}`}
                value={ride.store.name}
                onChange={(e) => onStoreFieldChange("name", e.target.value)}
                placeholder="z. B. Aldi, dm oder Fressnapf"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-[1fr_120px]">
              <div className="space-y-2">
                <Label htmlFor={`store-street-${ride.id}`}>Straße</Label>
                <Input
                  id={`store-street-${ride.id}`}
                  value={ride.store.address.street}
                  onChange={(e) =>
                    onStoreAddressChange("street", e.target.value)
                  }
                  placeholder="Straße des Geschäfts"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`store-house-number-${ride.id}`}>
                  Hausnummer
                </Label>
                <Input
                  id={`store-house-number-${ride.id}`}
                  value={ride.store.address.houseNumber}
                  onChange={(e) =>
                    onStoreAddressChange("houseNumber", e.target.value)
                  }
                  placeholder="Nr."
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-[140px_1fr]">
              <div className="space-y-2">
                <Label htmlFor={`store-postal-${ride.id}`}>PLZ</Label>
                <Input
                  id={`store-postal-${ride.id}`}
                  value={ride.store.address.postalCode}
                  onChange={(e) =>
                    onStoreAddressChange("postalCode", e.target.value)
                  }
                  placeholder="PLZ"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`store-city-${ride.id}`}>Stadt</Label>
                <Input
                  id={`store-city-${ride.id}`}
                  value={ride.store.address.city}
                  onChange={(e) => onStoreAddressChange("city", e.target.value)}
                  placeholder="Stadt"
                />
              </div>
            </div>



            <div className="flex flex-wrap items-center gap-3">
              <Button type="button" onClick={onCalculateDistance}>
                {ride.routeLoading ? "Suche..." : "OK"}
              </Button>
              {ride.distanceKm !== null && (
                <>
                  <div className="rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
                    Fahrstrecke: {formatKm(ride.distanceKm)} km
                  </div>
                  <div className="rounded-full bg-muted px-4 py-2 text-sm font-medium">
                    8,50 € + {driverExtra} € an den Fahrer
                  </div>
                </>
              )}
            </div>

            {ride.routeError && (
              <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                {ride.routeError}
              </div>
            )}
          </div>

          <div className="space-y-3 rounded-2xl border p-4">
            <div>
                            {ride.option === "already_paid" && (
              <div className="space-y-2 rounded-2xl border border-primary/20 bg-primary/5 p-4">
                <Label htmlFor={`pickup-code-${ride.id}`}>
                  Abholcode / Abholnummer
                </Label>
                <Input
                  id={`pickup-code-${ride.id}`}
                  value={ride.pickupCode}
                  onChange={(e) => onPickupCodeChange(e.target.value)}
                  placeholder="z. B. Bestellnummer, QR-Code-Text oder Abholschein-Nr."
                />
                <p className="text-xs text-muted-foreground">
                  Diese Angabe ist bei Click &amp; Collect erforderlich, damit
                  der Fahrer die bereits bezahlte Ware abholen kann.
                </p>
              </div>
            )}
              <p className="text-sm font-medium">
                {ride.option === "already_paid"
                  ? "Abholhinweise"
                  : "Einkaufsliste für den Fahrer"}
              </p>

              <p className="text-xs text-muted-foreground">
                {ride.option === "already_paid"
                  ? "Zusätzliche Hinweise zur Abholung, z. B. Abholort, Kühlung oder Tütennummer."
                  : "Bitte Artikel möglichst konkret eintragen: Marke, Produkt, Sorte, Größe oder Menge."}
              </p>
            </div>

            <div className="space-y-2">
              {ride.shoppingItems.map((item) =>
                item.isEditing ? (
                  <div key={item.id} className="flex items-center gap-1.5">
                    <Input
                      value={item.value}
                      onChange={(e) =>
                        onShoppingItemChange(item.id, e.target.value)
                      }
                      placeholder={
                        ride.option === "already_paid"
                          ? "z. B. Abholung am Servicepoint, Tüte 2, Kühlware"
                          : "z. B. Coca-Cola Zero 1,5 l, Barilla Spaghetti Nr. 5, 2x"
                      }
                      className="h-9"
                    />
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 p-0"
                      onClick={() => onShoppingItemSave(item.id)}
                      aria-label={`Eintrag speichern: ${item.value || "neuer Eintrag"}`}
                    >
                      ✓
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-destructive"
                      onClick={() => onShoppingItemRemove(item.id)}
                      aria-label={`Eintrag löschen: ${item.value || "neuer Eintrag"}`}
                    >
                      ×
                    </Button>
                  </div>
                ) : item.value.trim() ? (
                  <div
                    key={item.id}
                    className="flex items-center gap-1.5 rounded-lg border px-2.5 py-2"
                  >
                    <div className="flex-1 text-sm leading-5">{item.value}</div>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 p-0"
                      onClick={() => onShoppingItemEdit(item.id)}
                      aria-label={`Eintrag bearbeiten: ${item.value}`}
                    >
                      ✎
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 p-0 text-destructive"
                      onClick={() => onShoppingItemRemove(item.id)}
                      aria-label={`Eintrag löschen: ${item.value}`}
                    >
                      ×
                    </Button>
                  </div>
                ) : null,
              )}

              <Button
                type="button"
                variant="ghost"
                onClick={onAddShoppingItem}
                className="h-8 justify-start px-2 text-sm"
              >
                + Weiteren Eintrag hinzufügen
              </Button>
            </div>

            {hasSensitiveItems && ride.option !== "already_paid" && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4 text-sm text-slate-800">
                Diese Einkaufsliste enthält sensible Begriffe. Für Alkohol,
                Tabak oder apothekenpflichtige Produkte ist eine
                Altersbestätigung im Checkout erforderlich.
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
