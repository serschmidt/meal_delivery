export type FooterDialogKey =
  | "agb"
  | "datenschutz"
  | "impressum"
  | "versand-zahlung"
  | "widerrufsrecht"
  | null;

export type HeaderDialogKey =
  | "ueber-marie"
  | "liefergebiete"
  | "kontakt"
  | "faq"
  | "sozialamt-zuschuss"
  | null;

export type NonNullFooterDialogKey = Exclude<FooterDialogKey, null>;
export type NonNullHeaderDialogKey = Exclude<HeaderDialogKey, null>;