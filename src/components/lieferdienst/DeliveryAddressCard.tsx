import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Address, DeliveryAreaStatus } from "./types";
import { formatKm } from "./utils";

type Props = {
  customerAddress: Address;
  deliveryMapSrc: string;
  deliveryAreaStatus: DeliveryAreaStatus;
  isAddressIncomplete: boolean;
  onAddressChange: (field: keyof Address, value: string) => void;
  onValidate: () => void;
};

export function DeliveryAddressCard({
  customerAddress,
  deliveryMapSrc,
  deliveryAreaStatus,
  isAddressIncomplete,
  onAddressChange,
  onValidate,
}: Props) {
  return (
    <Card className="rounded-3xl">
      <CardHeader>
        <CardTitle>Lieferadresse und Kartenansicht</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-1">
            <div className="space-y-2">
              <Label htmlFor="delivery-street">Straße</Label>
              <Input id="delivery-street" value={customerAddress.street} onChange={(e) => onAddressChange("street", e.target.value)} placeholder="z. B. Reydter Straße" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="delivery-house-number">Hausnummer</Label>
              <Input id="delivery-house-number" value={customerAddress.houseNumber} onChange={(e) => onAddressChange("houseNumber", e.target.value)} placeholder="z. B. 41" />
            </div>
            <div className="grid gap-4 sm:grid-cols-[140px_1fr]">
              <div className="space-y-2">
                <Label htmlFor="delivery-postal">PLZ</Label>
                <Input id="delivery-postal" value={customerAddress.postalCode} onChange={(e) => onAddressChange("postalCode", e.target.value)} placeholder="z. B. 41464" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="delivery-city">Stadt</Label>
                <Input id="delivery-city" value={customerAddress.city} onChange={(e) => onAddressChange("city", e.target.value)} placeholder="z. B. Neuss" />
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button type="button" variant="outline" onClick={onValidate} disabled={deliveryAreaStatus.loading}>
                {deliveryAreaStatus.loading ? "Liefergebiet wird geprüft..." : "Liefergebiet prüfen"}
              </Button>
              {deliveryAreaStatus.isInside === true && (
                <div className="rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
                  Im Liefergebiet
                  {deliveryAreaStatus.distanceKm !== null ? ` · ${formatKm(deliveryAreaStatus.distanceKm)} km` : ""}
                </div>
              )}
              {deliveryAreaStatus.isInside === false && (
                <div className="rounded-full bg-destructive/10 px-4 py-2 text-sm font-medium text-destructive">
                  Außerhalb Liefergebiet
                </div>
              )}
            </div>
            {deliveryAreaStatus.message && (
              <div className={`rounded-2xl border p-4 text-sm ${deliveryAreaStatus.isInside ? "border-primary/30 bg-primary/5 text-primary" : "border-destructive/30 bg-destructive/10 text-destructive"}`}>
                {deliveryAreaStatus.message}
              </div>
            )}
            {!isAddressIncomplete && deliveryAreaStatus.isInside !== true && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4 text-sm text-slate-800">
                Bitte prüfen Sie zuerst, ob die Lieferadresse im Liefergebiet liegt. Erst danach kann die Fahrt verbindlich angefragt werden.
              </div>
            )}
          </div>
          <div className="min-h-[420px] overflow-hidden rounded-2xl border lg:col-span-2">
            <iframe title="Liefergebietskarte" src={deliveryMapSrc} className="h-full min-h-[420px] w-full" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}