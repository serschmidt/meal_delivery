import { useState } from "react";
import { Routes, Route } from "react-router-dom";

import { Header } from "./components/Header";
import { CartDrawer } from "./components/CartDrawer";
import { CookieBanner } from "./components/CookieBanner";

import type { Client } from "./types/client";

import { SupplierProvider } from "./contexts/SupplierProvider";
import { useSupplier } from "./contexts/useSupplier";
import { CartProvider } from "./contexts/CartProvider";
import { useCart } from "./contexts/useCart";

import { HomePage } from "./pages/HomePage";
import { SupplierRegistrationPage } from "./pages/SupplierRegistrationPage";
import { SupplierLoginPage } from "./pages/SupplierLoginPage";
import { SupplierAuthProvider } from "./contexts/SupplierAuthProvider";
import { SupplierProtectedRoute } from "./components/SupplierProtectedRoute";
import { SupplierPage } from "./pages/SupplierPage";

import { AdminPage } from "./pages/AdminPage";
import { AdminAuthProvider } from "./contexts/AdminAuthProvider";
import { CheckoutPage } from "./pages/CheckoutPage";
import { Toaster } from "sonner";

import { AgbPage } from "./pages/AgbPage";
import { DatenschutzPage } from "./pages/DatenschutzPage";
import { ImpressumPage } from "./pages/ImpressumPage";
import { VersandZahlungPage } from "./pages/VersandZahlungPage";
import { WiderrufsrechtPage } from "./pages/WiderrufsrechtPage";

import nrwLiefergebiete from "./assets/NRW_Liefergebiete.png";

import { Button } from "./components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./components/ui/dialog";

type FooterDialogKey =
  | "agb"
  | "datenschutz"
  | "impressum"
  | "versand-zahlung"
  | "widerrufsrecht"
  | null;

type HeaderDialogKey =
  | "ueber-marie"
  | "liefergebiete"
  | "kontakt"
  | "faq"
  | "sozialamt-zuschuss"
  | null;

function AppContent() {
  const { selectedSupplier } = useSupplier();
  const { cartItemCount } = useCart();

  const [user] = useState<Client | null>(null);
  const [searchValue, setSearchValue] = useState("");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [footerDialog, setFooterDialog] = useState<FooterDialogKey>(null);
  const [headerDialog, setHeaderDialog] = useState<HeaderDialogKey>(null);

  const headerDialogConfig = {
    "ueber-marie": {
      title: "Über Marie",
      content: (
        <div className="space-y-4 text-sm leading-6">
          <p className="font-semibold">Essen auf Rädern</p>
          <p>
            Mit „Essen auf Rädern" bleiben Sie kulinarisch unabhängig – egal ob
            dauerhaft im Alter, vorübergehend nach einem Unfall oder als
            Entlastung, wenn Angehörige im Urlaub sind.
          </p>
          <p>Wir liefern gesunde Mahlzeiten direkt nach Hause.</p>
          <p>Wählen Sie Ihr Mittagessen aus, es wird heiß geliefert.</p>
          <p>So bewahren Sie sich Ihre Selbstständigkeit im Alltag.</p>
          <p>
            Erinnern Sie sich an das Gefühl von Geborgenheit und purem Genuss?
            Genau das erwartet Sie, wenn Marie kocht.
          </p>
          <p>
            Mit den besten Zutaten und einer Prise Liebe zubereitet, sind diese
            Gerichte mehr als nur Essen – es ist Ihre persönliche Auszeit vom
            Alltag.
          </p>
          <p>
            Entdecken Sie Ihre neue Leibspeise und bestellen Sie noch heute.
          </p>
          <p>Jeden Tag warm zu Ihnen geliefert.</p>
          <p className="font-medium">Liefermonopol · Marie kocht</p>
          <p className="italic">
            „Marie steht am Herd und zaubert etwas Leckeres."
          </p>
        </div>
      ),
    },
    liefergebiete: {
      title: "Liefergebiete",
      content: (
        <div className="space-y-4 text-sm leading-6">
          <p>NRW Liefergebiete.</p>
          <img
            src={nrwLiefergebiete}
            alt="NRW Liefergebiete"
            className="h-auto w-full max-w-md rounded-md border bg-muted/30 p-2 shadow-sm"
          />
        </div>
      ),
    },
    kontakt: {
      title: "Kontakt",
      content: (
        <div className="space-y-4 text-sm leading-6">
          <p>
            Wenn Sie Hilfe bei Ihrer Bestellung benötigen oder Fragen haben,
            können Sie uns gerne kontaktieren.
          </p>
          <div className="space-y-1">
            <p className="font-medium">Kontakt:</p>
            <p>02801 706239</p>
            <p>01523 3035350</p>
            <p>0170 9337961</p>
            <p>0160 91259999</p>
          </div>
        </div>
      ),
    },
    faq: {
      title: "Fragen und Antworten",
      content: (
        <div className="space-y-5 text-sm leading-6">
          <div className="space-y-2">
            <p className="font-semibold">
              Was kostet der tägliche Mittagstisch?
            </p>
            <p>Warm geliefert 5,60 €.</p>
          </div>
          <div className="space-y-2">
            <p className="font-semibold">
              Was bietet der tägliche Mittagstisch für 5,60 €?
            </p>
            <p>
              Unser täglicher Mittagstisch bietet eine vollwertige, warm
              angelieferte Mahlzeit für einen Festpreis von 5,60 € inklusive
              Lieferung.
            </p>
          </div>
          <div className="space-y-2">
            <p className="font-semibold">
              Zu welcher Uhrzeit wird das Essen geliefert?
            </p>
            <p>
              Die Lieferung erfolgt täglich in der Mittagszeit zwischen 11:00
              und 13:30 Uhr.
            </p>
          </div>
          <div className="space-y-2">
            <p className="font-semibold">Wie wird der Mittagstisch bezahlt?</p>
            <p>Per Überweisung oder PayPal direkt an den Lieferanten.</p>
          </div>
        </div>
      ),
    },
    "sozialamt-zuschuss": {
      title: "Sozialamt-Zuschuss",
      content: (
        <div className="space-y-5 text-sm leading-6">
          <div className="space-y-2">
            <p className="font-semibold">
              Essen auf Rädern Zuschuss Liefermonopol
            </p>
            <p>
              Personen, die Grundsicherung oder Sozialhilfe nach dem SGB XII
              beziehen, können je nach persönlicher Situation Anspruch auf eine
              Kostenübernahme oder einen Zuschuss für „Essen auf Rädern“ haben.
            </p>
            <p>
              Wir unterstützen Sie aktiv bei der Beantragung von
              Mahlzeitenzuschüssen beim Sozialamt.
            </p>
            <p>Täglich warm gelieferter Mittagstisch für nur 5,60 €.</p>
          </div>

          <div className="space-y-2">
            <p className="font-semibold">
              Sie benötigen finanzielle Unterstützung?
            </p>
            <p>
              Für Empfänger von Sozialhilfe oder bei vorhandenem Pflegegrad
              kommen staatliche Zuschüsse häufig in Betracht.
            </p>
            <p>
              Wir helfen Ihnen bei der Vorbereitung der Unterlagen und begleiten
              Sie bei der Beantragung beim Sozialamt.
            </p>
          </div>

          <div className="space-y-4">
            <p className="font-semibold">
              Fragen und Antworten von Liefermonopol
            </p>

            <div className="space-y-2">
              <p className="font-medium">
                Was kostet der tägliche Mittagstisch?
              </p>
              <p>Warm geliefert 5,60 €.</p>
            </div>

            <div className="space-y-2">
              <p className="font-medium">
                Was bietet der tägliche Mittagstisch für 5,60 €?
              </p>
              <p>
                Unser täglicher Mittagstisch bietet eine vollwertige, warm
                angelieferte Mahlzeit für einen Festpreis von 5,60 € inklusive
                Lieferung. Wir legen Wert auf Abwechslung sowie eine
                seniorengerechte und nährstoffreiche Zusammenstellung der
                Speisen.
              </p>
            </div>

            <div className="space-y-2">
              <p className="font-medium">
                Zu welcher Uhrzeit wird das Essen geliefert?
              </p>
              <p>
                Die Lieferung erfolgt täglich in der Mittagszeit zwischen 11:00
                und 13:30 Uhr. Wir liefern das Essen in speziellen Thermoboxen
                aus, damit es heiß bei Ihnen ankommt.
              </p>
            </div>

            <div className="space-y-2">
              <p className="font-medium">
                Wer hat Anspruch auf einen Zuschuss für das Mittagessen beim
                Sozialamt?
              </p>
              <p>
                Anspruchsberechtigt sind häufig Personen, die Leistungen der
                Grundsicherung im Alter oder bei Erwerbsminderung nach dem SGB
                XII beziehen oder nur über ein sehr geringes Einkommen verfügen.
                Auch bei einem Pflegegrad kann eine Kostenübernahme geprüft
                werden.
              </p>
            </div>

            <div className="space-y-2">
              <p className="font-medium">
                Wie hilft Ihr Service bei der Beantragung der Kostenübernahme?
              </p>
              <p>
                Wir unterstützen Sie beim Ausfüllen der notwendigen Unterlagen
                für das Sozialamt und helfen dabei, die erforderlichen Nachweise
                zusammenzustellen, damit das Verfahren möglichst reibungslos
                abläuft.
              </p>
            </div>

            <div className="space-y-2">
              <p className="font-medium">
                Muss ich selbst zum Sozialamt gehen oder erledigen Sie das?
              </p>
              <p>
                Den Antrag reichen Sie grundsätzlich selbst beim zuständigen Amt
                ein. Wir bereiten die Unterlagen mit Ihnen vor und begleiten Sie
                beratend durch den gesamten Ablauf.
              </p>
            </div>

            <div className="space-y-2">
              <p className="font-medium">Wie wird der Mittagstisch bezahlt?</p>
              <p>
                Die Abrechnung erfolgt bequem per Monatsrechnung oder
                SEPA-Lastschrift. Wenn ein Zuschuss bewilligt wird, ist je nach
                Fall auch eine Abrechnung mit dem zuständigen Kostenträger
                möglich, sodass Sie nur Ihren Eigenanteil zahlen.
              </p>
            </div>
          </div>
        </div>
      ),
    },
  } as const;

  const footerDialogConfig = {
    agb: { title: "AGB", content: <AgbPage /> },
    datenschutz: { title: "Datenschutz", content: <DatenschutzPage /> },
    impressum: { title: "Impressum", content: <ImpressumPage /> },
    "versand-zahlung": {
      title: "Versand & Zahlung",
      content: <VersandZahlungPage />,
    },
    widerrufsrecht: {
      title: "Widerrufsrecht",
      content: <WiderrufsrechtPage />,
    },
  } as const;

  return (
    <>
      <div className="flex min-h-screen flex-col bg-background">
        <Header
          user={user}
          selectedSupplier={selectedSupplier}
          cartItemCount={cartItemCount}
          onCartClick={() => setIsCartOpen(true)}
          onOrdersClick={() => console.log("Bestellungen öffnen")}
          onProfileClick={() => console.log("Profil öffnen")}
          onHeaderDialogChange={setHeaderDialog}
        />

        <CartDrawer open={isCartOpen} onOpenChange={setIsCartOpen} />

        <main className="flex-1">
          <Routes>
            <Route
              path="/"
              element={
                <HomePage
                  searchValue={searchValue}
                  onSearchChange={setSearchValue}
                />
              }
            />
            <Route
              path="/partner-login"
              element={
                <SupplierAuthProvider>
                  <SupplierLoginPage />
                </SupplierAuthProvider>
              }
            />
            <Route
              path="/supplier"
              element={
                <SupplierAuthProvider>
                  <SupplierProtectedRoute>
                    <SupplierPage />
                  </SupplierProtectedRoute>
                </SupplierAuthProvider>
              }
            />
            <Route
              path="/lieferant-werden"
              element={<SupplierRegistrationPage />}
            />
            <Route
              path="/admin"
              element={
                <AdminAuthProvider>
                  <AdminPage />
                </AdminAuthProvider>
              }
            />
            <Route path="/checkout" element={<CheckoutPage />} />
          </Routes>
        </main>

        <footer className="border-t bg-background/95 p-4 text-center text-sm text-muted-foreground backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span>© 2026 Marie Kocht.</span>
            <Button
              variant="outline"
              className="h-auto p-0 text-sm"
              onClick={() => setFooterDialog("agb")}
            >
              AGB
            </Button>
            <Button
              variant="outline"
              className="h-auto p-0 text-sm"
              onClick={() => setFooterDialog("datenschutz")}
            >
              Datenschutz
            </Button>
            <Button
              variant="outline"
              className="h-auto p-0 text-sm"
              onClick={() => setFooterDialog("impressum")}
            >
              Impressum
            </Button>
            <Button
              variant="outline"
              className="h-auto p-0 text-sm"
              onClick={() => setFooterDialog("versand-zahlung")}
            >
              Versand & Zahlung
            </Button>
            <Button
              variant="outline"
              className="h-auto p-0 text-sm"
              onClick={() => setFooterDialog("widerrufsrecht")}
            >
              Widerrufsrecht
            </Button>
            <Button variant="outline" className="h-auto p-0 text-sm" disabled>
              Fragen und Antworten
            </Button>
          </div>
        </footer>
      </div>

      <CookieBanner />

      <Dialog
        open={headerDialog !== null}
        onOpenChange={(open) => !open && setHeaderDialog(null)}
      >
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-3xl">
          {headerDialog && (
            <>
              <DialogHeader>
                <DialogTitle>
                  {headerDialogConfig[headerDialog].title}
                </DialogTitle>
              </DialogHeader>
              <div className="pt-2">
                {headerDialogConfig[headerDialog].content}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={footerDialog !== null}
        onOpenChange={(open) => !open && setFooterDialog(null)}
      >
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-3xl">
          {footerDialog && (
            <>
              <DialogHeader>
                <DialogTitle>
                  {footerDialogConfig[footerDialog].title}
                </DialogTitle>
              </DialogHeader>
              <div className="pt-2">
                {footerDialogConfig[footerDialog].content}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function App() {
  return (
    <>
      <SupplierProvider>
        <CartProvider>
          <AppContent />
        </CartProvider>
      </SupplierProvider>
      <Toaster richColors position="bottom-right" />
    </>
  );
}