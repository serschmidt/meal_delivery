import type { ReactNode } from "react";
import type { NonNullFooterDialogKey } from "./dialog-types";

import { AgbPage } from "../../pages/AgbPage";
import { DatenschutzPage } from "../../pages/DatenschutzPage";
import { ImpressumPage } from "../../pages/ImpressumPage";
import { VersandZahlungPage } from "../../pages/VersandZahlungPage";
import { WiderrufsrechtPage } from "../../pages/WiderrufsrechtPage";
import { SupplierImpressumPage } from "../../pages/SupplierImpressumPage";

type FooterDialogConfig = Record<
  NonNullFooterDialogKey,
  {
    title: string;
    content: ReactNode;
  }
>;

export const footerDialogConfig: FooterDialogConfig = {
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
};

export const supplierFooterDialogConfig: FooterDialogConfig = {
  agb: { title: "AGB", content: <AgbPage /> },
  datenschutz: { title: "Datenschutz", content: <DatenschutzPage /> },
  impressum: { title: "Impressum", content: <SupplierImpressumPage /> },
  "versand-zahlung": {
    title: "Versand & Zahlung",
    content: <VersandZahlungPage />,
  },
  widerrufsrecht: {
    title: "Widerrufsrecht",
    content: <WiderrufsrechtPage />,
  },
};