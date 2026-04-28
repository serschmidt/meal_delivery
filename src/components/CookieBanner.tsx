import { useEffect, useState } from "react";
import { Button } from "./ui/button";

const COOKIE_CONSENT_KEY = "meal_delivery_cookie_consent";

type CookieConsent = "accepted" | "rejected" | null;

export function CookieBanner() {
  const [consent, setConsent] = useState<CookieConsent>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const savedConsent = localStorage.getItem(COOKIE_CONSENT_KEY) as CookieConsent;
    if (savedConsent === "accepted" || savedConsent === "rejected") {
      setConsent(savedConsent);
    }
  }, []);

  const handleAccept = () => {
    setConsent("accepted");
    localStorage.setItem(COOKIE_CONSENT_KEY, "accepted");
  };

  const handleReject = () => {
    setConsent("rejected");
    localStorage.setItem(COOKIE_CONSENT_KEY, "rejected");
  };

  if (consent) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-[100] border-t bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between md:px-6">
        <p className="max-w-4xl text-sm text-muted-foreground">
          Wir verwenden Cookies, um unsere Website zu optimieren und Ihnen das
          bestmögliche Online-Erlebnis zu bieten. Mit einem Klick auf{" "}
          <span className="font-medium text-foreground">„Alle annehmen“</span>{" "}
          stimmen Sie der Verwendung nicht notwendiger Cookies zu. Weitere
          Informationen sowie die Möglichkeit, Ihre Auswahl später zu ändern,
          finden Sie in unserer{" "}
          <a
            href="/datenschutz"
            className="underline underline-offset-4"
          >
            Datenschutzerklärung
          </a>.
        </p>

        <div className="flex shrink-0 gap-2">
          <Button type="button" variant="outline" onClick={handleReject}>
            Alle ablehnen
          </Button>
          <Button type="button" variant="default" onClick={handleAccept}>
            Alle annehmen
          </Button>
        </div>
      </div>
    </div>
  );
}