import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "./ui/sheet";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { useCart } from "../contexts/useCart";
import { useSupplier } from "../contexts/useSupplier";
import { useNavigate } from "react-router-dom";

type CartDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CartDrawer({ open, onOpenChange }: CartDrawerProps) {
  const { cartItems, removeFromCart, clearCart, updateQuantity } = useCart();
  const { selectedSupplier } = useSupplier();
  const navigate = useNavigate();

  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const handleCheckout = () => {
    onOpenChange(false);
    navigate("/checkout");
  };

  // Mahlzeiten nach weeklyMenuId gruppieren
  const groupedByMenu = cartItems.reduce<
    Record<string, { menuId: string; items: typeof cartItems }>
  >((acc, item) => {
    const key = item.weeklyMenuId;
    if (!acc[key]) {
      acc[key] = { menuId: key, items: [] };
    }
    acc[key].items.push(item);
    return acc;
  }, {});

  function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
}

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex h-[100dvh] w-full flex-col overflow-hidden p-0 sm:max-w-lg">
        <SheetHeader className="shrink-0 border-b px-6 py-4">
          <SheetTitle>Warenkorb</SheetTitle>
          <SheetDescription>Deine ausgewählten Gerichte.</SheetDescription>
        </SheetHeader>

        {/* Lieferanten-Anzeige */}
        <div className="shrink-0 border-b px-6 py-3">
          {selectedSupplier ? (
            <p className="text-sm">
              <span className="text-muted-foreground">Lieferant: </span>
              <span className="font-medium">{selectedSupplier.fullName}</span>
            </p>
          ) : (
            <p className="text-sm text-destructive">
              ⚠ Kein Lieferant ausgewählt
            </p>
          )}
        </div>

        {cartItems.length === 0 ? (
          <div className="flex flex-1 items-center justify-center px-6">
            <p className="text-sm text-muted-foreground">
              Dein Warenkorb ist aktuell leer.
            </p>
          </div>
        ) : (
          <>
            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
              <div className="space-y-6">
                {Object.values(groupedByMenu).map(({ menuId, items }) => {
                  // KW-Nummer aus dem ersten Item lesen (weeklyMenuLabel optional)
                  const firstItem = items[0];
                  const menuLabel = firstItem.weeklyMenuLabel
                    ? `KW ${firstItem.weeklyMenuLabel}`
                    : `Menü`;

                  return (
                    <div key={menuId} className="space-y-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        {menuLabel}
                      </p>

                      {items.map((item) => (
                        <div
                          key={`${item.mealId}-${item.supplierId ?? "guest"}`}
                          className="rounded-lg border p-4"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1 space-y-1">
                              <p className="font-medium leading-snug">
                                {item.name}
                              </p>

                              {item.deliveryDate && (
                                <p className="text-xs text-muted-foreground">
                                  Liefertag: {formatDate(item.deliveryDate)}
                                </p>
                              )}
                              <p className="line-clamp-2 text-sm text-muted-foreground">
                                {item.description}
                              </p>
                              <p className="text-sm font-medium">
                                € {(item.price * item.quantity).toFixed(2)}
                                <span className="ml-1 text-xs font-normal text-muted-foreground">
                                  ({item.quantity} × € {item.price.toFixed(2)})
                                </span>
                              </p>
                            </div>

                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="shrink-0 text-muted-foreground hover:text-destructive"
                              onClick={() => removeFromCart(item.mealId)}
                            >
                              ✕
                            </Button>
                          </div>

                          {/* Mengensteuerung */}
                          <div className="mt-3 flex items-center gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-7 w-7 p-0"
                              onClick={() =>
                                updateQuantity(item.mealId, item.quantity - 1)
                              }
                              disabled={item.quantity <= 1}
                            >
                              −
                            </Button>
                            <span className="w-6 text-center text-sm font-medium">
                              {item.quantity}
                            </span>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-7 w-7 p-0"
                              onClick={() =>
                                updateQuantity(item.mealId, item.quantity + 1)
                              }
                            >
                              +
                            </Button>
                          </div>
                        </div>
                      ))}

                      <Separator />
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="sticky bottom-0 shrink-0 border-t bg-background px-6 py-4">
              <div className="mb-4 flex items-center justify-between text-sm">
                <span className="font-medium">Gesamtsumme</span>
                <span className="font-bold">€ {totalAmount.toFixed(2)}</span>
              </div>

              <div className="flex flex-col gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={clearCart}
                >
                  Warenkorb leeren
                </Button>

                <Button
                  type="button"
                  className="w-full"
                  onClick={handleCheckout}
                >
                  Zur Kasse
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
