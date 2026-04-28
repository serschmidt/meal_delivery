import { ShoppingCart, User } from "lucide-react";

import type { Client } from "../types/client";
import type { Supplier } from "../contexts/supplier-context";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

type HeaderProps = {
  user: Client | null;
  selectedSupplier?: Supplier | null;
  cartItemCount?: number;
  onCartClick: () => void;
  onOrdersClick: () => void;
  onProfileClick: () => void;
  onHeaderDialogChange: (
    value: "ueber-marie" | "liefergebiete" | "kontakt" | "faq" | null
  ) => void;
};

export function Header({
  user,
  selectedSupplier,
  cartItemCount = 0,
  onCartClick,
  onOrdersClick,
  onProfileClick,
  onHeaderDialogChange,
}: HeaderProps) {
  const fullName = user ? `${user.firstName} ${user.lastName}` : "";

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <div className="flex min-w-[140px] items-center">
          <a href="/" className="text-xl font-bold tracking-tight">
            Marie kocht
          </a>
        </div>

        <div className="hidden items-center gap-2 lg:flex">
          <Button variant="outline" onClick={() => onHeaderDialogChange("ueber-marie")}>
            Über Marie
          </Button>
          <Button variant="outline" onClick={() => onHeaderDialogChange("liefergebiete")}>
            Liefergebiete
          </Button>
          <Button variant="outline" onClick={() => onHeaderDialogChange("kontakt")}>
            Kontakt
          </Button>
          <Button variant="outline" onClick={() => onHeaderDialogChange("faq")}>
            Fragen und Antworten
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <User className="size-4" />
                  <span className="hidden sm:inline">{fullName}</span>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Mein Konto</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onCartClick}>Warenkorb</DropdownMenuItem>
                <DropdownMenuItem onClick={onOrdersClick}>Bestellungen</DropdownMenuItem>
                <DropdownMenuItem onClick={onProfileClick}>Profil</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <Button variant="default" className="relative gap-2" onClick={onCartClick}>
            <ShoppingCart className="size-4" />
            <span className="hidden sm:inline">Warenkorb</span>
            {cartItemCount > 0 && (
              <span className="absolute -right-2 -top-2 inline-flex size-5 items-center justify-center rounded-full bg-destructive text-xs font-semibold text-destructive-foreground">
                {cartItemCount}
              </span>
            )}
          </Button>
        </div>
      </div>

      {selectedSupplier && (
        <div className="border-t px-4 py-2">
          <div className="mx-auto flex max-w-7xl items-center gap-2 text-sm">
            <span>Ausgewählt:</span>
            <span className="font-medium">{selectedSupplier.fullName}</span>
          </div>
        </div>
      )}
    </header>
  );
}