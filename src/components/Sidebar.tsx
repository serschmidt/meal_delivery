import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { Button } from "./ui/button";
import {
  Store,
  CalendarDays,
  UserPlus,
  // ImagePlus,
  FileText,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";

type FooterDialogKey =
  | "agb"
  | "datenschutz"
  | "impressum"
  | "versand-zahlung"
  | "widerrufsrecht"
  | null;

type SidebarProps = {
  onFooterDialogChange: (dialog: Exclude<FooterDialogKey, null>) => void;
  isOpen: boolean;
  onClose: () => void;
};

export function Sidebar({
  onFooterDialogChange,
  isOpen,
  onClose,
}: SidebarProps) {
  const location = useLocation();
  const [impressumOpen, setImpressumOpen] = useState(false);

  const isHome = location.pathname === "/";

  const openLegalDialog = (key: Exclude<FooterDialogKey, null>) => {
    setImpressumOpen(false);

    window.setTimeout(() => {
      onFooterDialogChange(key);
    }, 150);
  };

  const handleNavigate = () => {
    onClose();
  };

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 lg:hidden ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-48 shrink-0 flex-col border-r bg-background p-3 transition-transform duration-300 lg:z-30 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="mb-2 flex items-center justify-between lg:hidden">
          <span className="text-sm font-semibold">Menü</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Menü schließen"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="mb-4 mt-2 lg:mt-16 space-y-3 px-1">
          <p className="text-xs leading-5 text-muted-foreground">
            Schnellzugriff auf alle Bereiche
          </p>
        </div>

        <nav className="flex-1 space-y-3 overflow-y-auto">
          <a href="/#lieferanten" className="block" onClick={handleNavigate}>
            <Button
              variant={isHome ? "secondary" : "ghost"}
              className="h-14 w-full justify-start px-3 text-sm"
            >
              <Store className="mr-2 h-4 w-4 shrink-0" />
              <span className="truncate">Liefergebiet </span>
            </Button>
          </a>

          <a href="/#wochenmenue" className="block" onClick={handleNavigate}>
            <Button
              variant={isHome ? "secondary" : "ghost"}
              className="h-14 w-full justify-start px-3 text-sm"
            >
              <CalendarDays className="mr-2 h-4 w-4 shrink-0" />
              <span className="truncate">Wochenmenüs</span>
            </Button>
          </a>

          <Link to="/partner-login" className="block" onClick={handleNavigate}>
            <Button
              variant={
                location.pathname === "/partner-login" ? "secondary" : "ghost"
              }
              className="h-14 w-full justify-start px-3 text-sm"
            >
              <UserPlus className="mr-2 h-4 w-4 shrink-0" />
              <span className="truncate">Partner</span>
            </Button>
          </Link>

          {/* <Button
            variant="ghost"
            className="h-14 w-full justify-start px-3 text-sm"
            disabled
          >
            <ImagePlus className="mr-2 h-4 w-4 shrink-0" />
            <span className="truncate">Partner Banner</span>
          </Button> */}

          <Dialog open={impressumOpen} onOpenChange={setImpressumOpen}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                className="h-14 w-full justify-start px-3 text-sm"
              >
                <FileText className="mr-2 h-4 w-4 shrink-0" />
                <span className="truncate">Impressum</span>
              </Button>
            </DialogTrigger>

            <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>Impressum</DialogTitle>
              </DialogHeader>

              <div className="space-y-6 text-sm leading-6">
                <section className="space-y-2">
                  <h3 className="font-semibold">Impressum</h3>

                  <p>Angaben gemäß § 5 DDG</p>
                  <p>Urban Fleet Logistics UG (haftungsbeschränkt)</p>
                  <p>Rheydter Straße 41</p>
                  <p>41464 Neuss</p>
                  <p>Deutschland</p>

                  <p>Vertreten durch:</p>
                  <p>Amjad Hassan, Geschäftsführer</p>

                  <p>Handelsregister:</p>
                  <p>Amtsgericht Neuss, HRB 25321</p>

                  <p>Umsatzsteuer-Identifikationsnummer:</p>
                  <p>DE462024982</p>

                  <p>Kontakt:</p>
                  <p>Telefon: +49 176 26087299</p>
                  <p>
                    E-Mail:{" "}
                    <a
                      href="mailto:info@urban-fleet.de"
                      className="underline underline-offset-4"
                    >
                      info@urban-fleet.de
                    </a>
                  </p>
                </section>

                <section className="space-y-3 border-t pt-6">
                  <h3 className="font-semibold">Weitere Informationen</h3>

                  <div className="flex flex-col items-start gap-2">
                    <Button
                      variant="ghost"
                      className="h-auto p-0 text-sm text-muted-foreground hover:text-foreground"
                      onClick={() => openLegalDialog("agb")}
                    >
                      AGB
                    </Button>

                    <Button
                      variant="ghost"
                      className="h-auto p-0 text-sm text-muted-foreground hover:text-foreground"
                      onClick={() => openLegalDialog("datenschutz")}
                    >
                      Datenschutz
                    </Button>

                    <Button
                      variant="ghost"
                      className="h-auto p-0 text-sm text-muted-foreground hover:text-foreground"
                      onClick={() => openLegalDialog("versand-zahlung")}
                    >
                      Versand und Zahlung
                    </Button>

                    <Button
                      variant="ghost"
                      className="h-auto p-0 text-sm text-muted-foreground hover:text-foreground"
                      onClick={() => openLegalDialog("widerrufsrecht")}
                    >
                      Widerrufsrecht
                    </Button>
                  </div>
                </section>

                <section className="pt-10">
                  <p className="text-sm text-muted-foreground">
                    Bilder:{" "}
                    <span className="font-medium text-foreground">Pixabay</span>
                  </p>
                </section>

                <section className="space-y-2">
                  <h3 className="font-semibold">
                    Verbraucherstreitbeilegung / Universalschlichtungsstelle
                  </h3>
                  <p>
                    Wir sind nicht bereit oder verpflichtet, an
                    Streitbeilegungsverfahren vor einer
                    Verbraucherschlichtungsstelle teilzunehmen.
                  </p>
                </section>

                <section className="space-y-2">
                  <h3 className="font-semibold">Haftung für Inhalte</h3>
                  <p>
                    Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene
                    Inhalte auf diesen Seiten nach den allgemeinen Gesetzen
                    verantwortlich. Nach §§ 8 bis 10 TMG sind wir als
                    Diensteanbieter jedoch nicht verpflichtet, übermittelte oder
                    gespeicherte fremde Informationen zu überwachen oder nach
                    Umständen zu forschen, die auf eine rechtswidrige Tätigkeit
                    hinweisen.
                  </p>
                  <p>
                    Verpflichtungen zur Entfernung oder Sperrung der Nutzung von
                    Informationen nach den allgemeinen Gesetzen bleiben hiervon
                    unberührt. Eine diesbezügliche Haftung ist jedoch erst ab
                    dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung
                    möglich. Bei Bekanntwerden von entsprechenden
                    Rechtsverletzungen werden wir diese Inhalte umgehend
                    entfernen.
                  </p>
                </section>
              </div>
            </DialogContent>
          </Dialog>
        </nav>
      </aside>
    </>
  );
}
