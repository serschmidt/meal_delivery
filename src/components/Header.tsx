import { Menu, ShoppingCart, User } from "lucide-react";

import type { Client } from "../types/client";
import type { Supplier } from "../contexts/SupplierContext";
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
    value:
      | "ueber-marie"
      | "liefergebiete"
      | "kontakt"
      | "faq"
      | "sozialamt-zuschuss"
      | null,
  ) => void;
  onSidebarToggle?: () => void;
};

export function Header({
  user,
  cartItemCount = 0,
  onCartClick,
  onOrdersClick,
  onProfileClick,
  onHeaderDialogChange,
  onSidebarToggle,
}: HeaderProps) {
  const fullName = user ? `${user.firstName} ${user.lastName}` : "";

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex min-h-16 items-center justify-between gap-2 px-3 py-3 sm:gap-4 sm:px-4">
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="shrink-0 lg:hidden"
            onClick={onSidebarToggle}
            aria-label="Menü ein- oder ausblenden"
          >
            <Menu className="size-5" />
          </Button>

          <a
            href="/"
            className="min-w-0 truncate text-base font-bold tracking-tight sm:text-xl"
          >
            Marie kocht
          </a>
        </div>

        <div className="hidden items-center gap-2 lg:flex">
          <Button
            variant="outline"
            onClick={() => onHeaderDialogChange("ueber-marie")}
          >
            Über Marie
          </Button>
          <Button
            variant="outline"
            onClick={() => onHeaderDialogChange("liefergebiete")}
          >
            Liefergebiete
          </Button>
          <Button
            variant="outline"
            onClick={() => onHeaderDialogChange("kontakt")}
          >
            Kontakt
          </Button>
          <Button variant="outline" onClick={() => onHeaderDialogChange("faq")}>
            Fragen und Antworten
          </Button>
          <Button
            variant="outline"
            onClick={() => onHeaderDialogChange("sozialamt-zuschuss")}
          >
            Sozialamt-Zuschuss
          </Button>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 px-2 sm:px-3">
                  <User className="size-4 shrink-0" />
                  <span className="hidden max-w-[140px] truncate md:inline">
                    {fullName}
                  </span>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Mein Konto</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onCartClick}>
                  Warenkorb
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onOrdersClick}>
                  Bestellungen
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onProfileClick}>
                  Profil
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <Button
            variant="default"
            className="relative gap-2 px-3 sm:px-4"
            onClick={onCartClick}
          >
            <ShoppingCart className="size-4 shrink-0" />
            <span className="hidden sm:inline">Warenkorb</span>
            {cartItemCount > 0 && (
              <span className="absolute -right-2 -top-2 inline-flex size-5 items-center justify-center rounded-full bg-destructive text-xs font-semibold text-destructive-foreground">
                {cartItemCount}
              </span>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
