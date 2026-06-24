import { Menu, ShoppingCart, User } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import marieLogo from "../assets/marie-logo.png";

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
};

export function Header({
  user,
  cartItemCount = 0,
  onCartClick,
  onOrdersClick,
  onProfileClick,
  onHeaderDialogChange,
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const fullName = user ? `${user.firstName} ${user.lastName}` : "";

  const handleDialogAndClose = (
    value:
      | "ueber-marie"
      | "liefergebiete"
      | "kontakt"
      | "faq"
      | "sozialamt-zuschuss",
  ) => {
    onHeaderDialogChange(value);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex min-h-16 items-center justify-between gap-2 px-3 py-3 sm:gap-4 sm:px-4">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <Link
            to="/"
            className="flex min-w-0 items-center gap-2 truncate text-base font-bold tracking-tight sm:text-xl"
          >
            <img
              src={marieLogo}
              alt="Marie kocht Logo"
              className="h-6 w-auto shrink-0 sm:h-8"
            />
            <span className="truncate">Marie kocht</span>
          </Link>
        </div>

        <div className="hidden items-center gap-2 lg:flex">
          <Button
            variant="outline"
            onClick={() => onHeaderDialogChange("ueber-marie")}
          >
            Über Marie
          </Button>

          <Link to="/gruendergeschichte">
            <Button variant="outline">Gründergeschichte</Button>
          </Link>

          <Link to="/geschichten">
            <Button variant="outline">Geschichten</Button>
          </Link>

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
          <div className="lg:hidden">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Navigationsmenü öffnen"
                  className="h-10 w-10"
                >
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>

              <SheetContent side="left" className="w-[85vw] max-w-sm">
                <SheetHeader>
                  <SheetTitle>Menü</SheetTitle>
                </SheetHeader>

                <div className="mt-6 flex flex-col gap-3">
                  <Button
                    variant="outline"
                    className="justify-start"
                    onClick={() => handleDialogAndClose("ueber-marie")}
                  >
                    Über Marie
                  </Button>

                  <Link
                    to="/gruendergeschichte"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Button variant="outline" className="w-full justify-start">
                      Gründergeschichte
                    </Button>
                  </Link>

                  <Link
                    to="/geschichten"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Button variant="outline" className="w-full justify-start">
                      Geschichten
                    </Button>
                  </Link>

                  <Button
                    variant="outline"
                    className="justify-start"
                    onClick={() => handleDialogAndClose("liefergebiete")}
                  >
                    Liefergebiete
                  </Button>

                  <Button
                    variant="outline"
                    className="justify-start"
                    onClick={() => handleDialogAndClose("kontakt")}
                  >
                    Kontakt
                  </Button>

                  <Button
                    variant="outline"
                    className="justify-start"
                    onClick={() => handleDialogAndClose("faq")}
                  >
                    Fragen und Antworten
                  </Button>

                  <Button
                    variant="outline"
                    className="justify-start"
                    onClick={() => handleDialogAndClose("sozialamt-zuschuss")}
                  >
                    Sozialamt-Zuschuss
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>

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
            asChild
            size="icon"
            className="h-10 w-10 shrink-0 rounded-full bg-[#1877F2] text-white hover:bg-[#166fe5]"
          >
            <a
              href="https://www.facebook.com/profile.php?id=61590587091661"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook-Seite von Marie kocht öffnen"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="size-4 fill-current"
                aria-hidden="true"
              >
                <path d="M13.5 22v-8h2.7l.4-3h-3.1V9.1c0-.9.3-1.6 1.6-1.6H16.7V4.8c-.3 0-1.2-.1-2.3-.1-2.3 0-3.8 1.4-3.8 4V11H8v3h2.6v8h2.9Z" />
              </svg>
            </a>
          </Button>

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