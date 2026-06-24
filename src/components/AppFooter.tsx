import { useSupplier } from "../contexts/useSupplier";
import { Button } from "./ui/button";

type FooterDialogKey =
  | "agb"
  | "datenschutz"
  | "impressum"
  | "versand-zahlung"
  | "widerrufsrecht";

type AppFooterProps = {
  onOpenPlatformDialog: (dialog: FooterDialogKey) => void;
  onOpenSupplierDialog: (dialog: FooterDialogKey) => void;
};

const footerButtons: Array<{
  key: FooterDialogKey;
  label: string;
}> = [
  { key: "agb", label: "AGB" },
  { key: "datenschutz", label: "Datenschutz" },
  { key: "impressum", label: "Impressum" },
  { key: "versand-zahlung", label: "Versand & Zahlung" },
  { key: "widerrufsrecht", label: "Widerrufsrecht" },
];

export function AppFooter({
  onOpenPlatformDialog,
  onOpenSupplierDialog,
}: AppFooterProps) {
  const { selectedSupplier } = useSupplier();

  const supplierButtonClass =
    "h-9 rounded-lg px-3 text-xs font-medium sm:h-10 sm:px-4 sm:text-sm";

  const platformButtonClass =
    "h-8 rounded-md px-2.5 text-[11px] font-medium sm:h-9 sm:px-3 sm:text-xs";

  return (
    <footer className="border-t bg-background/95 text-muted-foreground backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-7xl px-4 py-3">
        <div className="space-y-3">
          {selectedSupplier && (
            <div className="space-y-2 border-b pb-3 text-center">
              <p className="text-xs font-semibold tracking-wide text-foreground/90 sm:text-sm">
                Rechtliche Informationen von {selectedSupplier.businessName ?? selectedSupplier.businessName}
              </p>

              <div className="flex flex-wrap items-center justify-center gap-2">
                {footerButtons.map((item) => (
                  <Button
                    key={`supplier-${item.key}`}
                    variant="outline"
                    className={supplierButtonClass}
                    onClick={() => onOpenSupplierDialog(item.key)}
                  >
                    {item.label}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2 text-center">
            <p className="text-[11px] font-medium tracking-wide text-foreground/80 sm:text-xs">
              © 2026 Marie kocht · Rechtliche Informationen dieser Plattform
            </p>

            <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
              {footerButtons.map((item) => (
                <Button
                  key={`platform-${item.key}`}
                  variant="ghost"
                  className={platformButtonClass}
                  onClick={() => onOpenPlatformDialog(item.key)}
                >
                  {item.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}