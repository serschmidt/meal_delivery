import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "./ui/sheet";
import { Button } from "./ui/button";
import { useCart } from "../contexts/useCart";

type CartDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CartDrawer({ open, onOpenChange }: CartDrawerProps) {
  const { cartItems, removeFromCart, clearCart } = useCart();

  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex h-[100dvh] w-full flex-col overflow-hidden p-0 sm:max-w-lg">
        <SheetHeader className="shrink-0 border-b px-6 py-4">
          <SheetTitle>Warenkorb</SheetTitle>
          <SheetDescription>Deine ausgewählten Gerichte.</SheetDescription>
        </SheetHeader>

        {cartItems.length === 0 ? (
          <div className="flex flex-1 items-center justify-center px-6">
            <p className="text-sm text-muted-foreground">
              Dein Warenkorb ist aktuell leer.
            </p>
          </div>
        ) : (
          <>
            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
              <div className="space-y-4 pb-4">
                {cartItems.map((item) => (
                  <div
                    key={`${item.mealId}-${item.supplierId ?? "guest"}`}
                    className="rounded-lg border p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.description}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Supplier: {item.supplierName ?? "Nicht gewählt"}
                        </p>
                        <p className="text-sm">
                          Menge: {item.quantity} × € {item.price.toFixed(2)}
                        </p>
                      </div>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeFromCart(item.mealId)}
                      >
                        Entfernen
                      </Button>
                    </div>
                  </div>
                ))}
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

                <Button type="button" className="w-full">
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
