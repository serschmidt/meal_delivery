import { Link, useLocation } from "react-router-dom";
import { Button } from "./ui/button";
import {
  Store,
  CalendarDays,
  UserPlus,
  ImagePlus,
  ShieldCheck,
} from "lucide-react";
import { useSupplier } from "../contexts/useSupplier";

export function Sidebar() {
  const location = useLocation();
  const { selectedSupplier } = useSupplier();

  const isHome = location.pathname === "/";
  const isRegister = location.pathname === "/lieferant-werden";
  const isAdmin = location.pathname.startsWith("/admin");

  return (
    <aside className="fixed left-0 top-0 flex h-screen w-48 shrink-0 flex-col border-r bg-background p-3">
      <div className="mt-16 mb-4 space-y-3 px-1">
        {selectedSupplier && (
          <div className="rounded-lg border bg-primary/10 px-2 py-2">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
              Ausgewählt
            </p>
            <p className="truncate text-sm font-medium">
              {selectedSupplier.fullName}
            </p>
          </div>
        )}

        <p className="text-xs leading-5 text-muted-foreground">
          Schnellzugriff auf alle Bereiche
        </p>
      </div>

      <nav className="flex-1 space-y-3">
        <a href="/#lieferanten" className="block">
          <Button
            variant={isHome ? "secondary" : "ghost"}
            className="h-14 w-full justify-start px-3 text-sm"
          >
            <Store className="mr-2 h-4 w-4 shrink-0" />
            <span className="truncate">Lieferanten wählen</span>
          </Button>
        </a>

        <a href="/#wochenmenue" className="block">
          <Button
            variant={isHome ? "secondary" : "ghost"}
            className="h-14 w-full justify-start px-3 text-sm"
          >
            <CalendarDays className="mr-2 h-4 w-4 shrink-0" />
            <span className="truncate">Wochenmenüs ansehen</span>
          </Button>
        </a>

        <Link to="/lieferant-werden" className="block">
          <Button
            variant={isRegister ? "secondary" : "ghost"}
            className="h-14 w-full justify-start px-3 text-sm"
          >
            <UserPlus className="mr-2 h-4 w-4 shrink-0" />
            <span className="truncate">Lieferant werden</span>
          </Button>
        </Link>

        <Button
          variant="ghost"
          className="h-14 w-full justify-start px-3 text-sm"
          disabled
        >
          <ImagePlus className="mr-2 h-4 w-4 shrink-0" />
          <span className="truncate">Partner Banner</span>
        </Button>

        {/* Trennlinie vor Admin */}
        <div className="border-t pt-3">
          <Link to="/admin" className="block">
            <Button
              variant={isAdmin ? "secondary" : "ghost"}
              className="h-14 w-full justify-start px-3 text-sm"
            >
              <ShieldCheck className="mr-2 h-4 w-4 shrink-0" />
              <span className="truncate">Admin</span>
            </Button>
          </Link>
        </div>
      </nav>
    </aside>
  );
}