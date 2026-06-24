import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { apiPost } from "../lib/api";
import supplierImage from "../assets/liefer.png";

type SupplierRegistrationFormData = {
  firstName: string;
  lastName: string;
  fullName: string;
  businessName: string;
  email: string;
  password: string;
  phone: string;
  website: string;
  street: string;
  houseNumber: string;
  postalCode: string;
  city: string;
  accountHolder: string;
  iban: string;
  paypalLink: string;
  referrerName: string;
};

const initialFormData: SupplierRegistrationFormData = {
  firstName: "",
  lastName: "",
  fullName: "",
  businessName: "",
  email: "",
  password: "",
  phone: "",
  website: "",
  street: "",
  houseNumber: "",
  postalCode: "",
  city: "",
  accountHolder: "",
  iban: "",
  paypalLink: "",
  referrerName: "",
};

type SupplierResponse = {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  fullName: string;
  businessName?: string | null;
  email: string;
  phone: string | null;
  website?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  payment: {
    accountHolder: string | null;
    iban: string | null;
    paypalLink: string | null;
  };
  address: {
    street: string;
    houseNumber: string;
    postalCode: string;
    city: string;
  };
};

export function SupplierRegistrationPage() {
  const [formData, setFormData] =
    useState<SupplierRegistrationFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;

    setSuccessMessage("");
    setErrorMessage("");
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const isFormValid =
    formData.businessName.trim() !== "" &&
    formData.email.trim() !== "" &&
    formData.password.trim() !== "" &&
    formData.street.trim() !== "" &&
    formData.houseNumber.trim() !== "" &&
    formData.postalCode.trim() !== "" &&
    formData.city.trim() !== "" &&
    (formData.iban.trim() !== "" || formData.paypalLink.trim() !== "");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage("");
    setErrorMessage("");

    const normalizedFullName =
      formData.fullName.trim() ||
      [formData.firstName.trim(), formData.lastName.trim()]
        .filter(Boolean)
        .join(" ") ||
      formData.businessName.trim();

    try {
      await apiPost<SupplierResponse, SupplierRegistrationFormData>(
        "suppliers",
        {
          ...formData,
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          fullName: normalizedFullName,
          businessName: formData.businessName.trim(),
          email: formData.email.trim(),
          password: formData.password,
          phone: formData.phone.trim(),
          website: formData.website.trim(),
          street: formData.street.trim(),
          houseNumber: formData.houseNumber.trim(),
          postalCode: formData.postalCode.trim(),
          city: formData.city.trim(),
          accountHolder: formData.accountHolder.trim(),
          iban: formData.iban.trim(),
          paypalLink: formData.paypalLink.trim(),
          referrerName: formData.referrerName.trim(),
        },
      );

      setSuccessMessage(
        "Die Registrierung wurde erfolgreich gespeichert. Wir prüfen Ihre Angaben.",
      );
      setFormData(initialFormData);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Die Registrierung konnte nicht gespeichert werden.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-5xl space-y-10">
        <section className="rounded-3xl bg-muted/40 px-6 py-10">
          <div className="grid items-center gap-8 lg:grid-cols-[1.6fr_0.9fr]">
            <div className="space-y-5 text-left">
              <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                Partner werden
              </p>

              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                Registrieren Sie sich als Lieferant.
              </h1>

              <div className="space-y-4 text-base text-muted-foreground sm:text-lg">
                <p>
                  Bieten Sie Ihre Gerichte über unsere Plattform an und
                  erreichen Sie Kundinnen und Kunden in Ihrer Region.
                </p>
                <p>
                  Hinterlegen Sie Ihre Stammdaten sowie Ihre bevorzugten
                  Zahlungsarten, damit Kundinnen und Kunden nach der Bestellung
                  eine passende Bezahlaufforderung erhalten können.
                </p>
                <p>
                  Wenn Sie nur mit PayPal arbeiten möchten, genügt ein
                  klickbarer PayPal-Link. Eine IBAN ist dann nicht erforderlich.
                </p>
              </div>
            </div>

            <div className="flex justify-center lg:justify-end">
              <div className="w-full max-w-xs overflow-hidden rounded-3xl border bg-background p-3 shadow-sm sm:max-w-sm">
                <img
                  src={supplierImage}
                  alt="Lieferung von Essen durch einen Lieferpartner"
                  className="h-[240px] w-full rounded-2xl object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        <p className="pb-8 text-sm text-muted-foreground">
          Sie haben bereits ein Partnerkonto?{" "}
          <Link
            to="/partner-login"
            className="font-medium underline underline-offset-4"
          >
            Hier zum Login
          </Link>
        </p>

        <section className="rounded-3xl border bg-background p-6 shadow-sm">
          <div className="mx-auto max-w-3xl space-y-6">
            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-semibold">
                Registrierung als Lieferant
              </h2>
              <p className="text-sm text-muted-foreground">
                Tragen Sie Ihre Daten ein. Firmenname sowie mindestens IBAN oder
                PayPal-Link sind erforderlich.
              </p>
            </div>

            {successMessage && (
              <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                {successMessage}
              </div>
            )}

            {errorMessage && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {errorMessage}
              </div>
            )}

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="firstName" className="text-sm font-medium">
                    Vorname
                  </label>
                  <Input
                    id="firstName"
                    name="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="z. B. Max"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="lastName" className="text-sm font-medium">
                    Nachname
                  </label>
                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="z. B. Mustermann"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="businessName" className="text-sm font-medium">
                  Firmenname
                </label>
                <Input
                  id="businessName"
                  name="businessName"
                  type="text"
                  value={formData.businessName}
                  onChange={handleChange}
                  placeholder="z. B. Musterküche GmbH"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="fullName" className="text-sm font-medium">
                  Anzeigename / Vollständiger Name
                </label>
                <Input
                  id="fullName"
                  name="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Optional, sonst automatisch aus Vorname/Nachname oder Firmenname"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="website" className="text-sm font-medium">
                  Website
                </label>
                <Input
                  id="website"
                  name="website"
                  type="url"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="https://example.de"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  E-Mail
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@beispiel.de"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Passwort
                </label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Mindestens 8 Zeichen"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-medium">
                  Telefon
                </label>
                <Input
                  id="phone"
                  name="phone"
                  type="text"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="z. B. 02801 123456"
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="street" className="text-sm font-medium">
                    Straße
                  </label>
                  <Input
                    id="street"
                    name="street"
                    type="text"
                    value={formData.street}
                    onChange={handleChange}
                    placeholder="Straße"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="houseNumber" className="text-sm font-medium">
                    Hausnummer
                  </label>
                  <Input
                    id="houseNumber"
                    name="houseNumber"
                    type="text"
                    value={formData.houseNumber}
                    onChange={handleChange}
                    placeholder="Hausnummer"
                    required
                  />
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="postalCode" className="text-sm font-medium">
                    PLZ
                  </label>
                  <Input
                    id="postalCode"
                    name="postalCode"
                    type="text"
                    value={formData.postalCode}
                    onChange={handleChange}
                    placeholder="PLZ"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="city" className="text-sm font-medium">
                    Ort
                  </label>
                  <Input
                    id="city"
                    name="city"
                    type="text"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Ort"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="accountHolder" className="text-sm font-medium">
                  Kontoinhaber
                </label>
                <Input
                  id="accountHolder"
                  name="accountHolder"
                  type="text"
                  value={formData.accountHolder}
                  onChange={handleChange}
                  placeholder="z. B. Max Mustermann"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="iban" className="text-sm font-medium">
                  IBAN
                </label>
                <Input
                  id="iban"
                  name="iban"
                  type="text"
                  value={formData.iban}
                  onChange={handleChange}
                  placeholder="z. B. DE89 3704 0044 0532 0130 00"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="paypalLink" className="text-sm font-medium">
                  PayPal-Link
                </label>
                <Input
                  id="paypalLink"
                  name="paypalLink"
                  type="url"
                  value={formData.paypalLink}
                  onChange={handleChange}
                  placeholder="https://paypal.me/ihrlink"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="referrerName" className="text-sm font-medium">
                  Empfohlen von (optional)
                </label>
                <Input
                  id="referrerName"
                  name="referrerName"
                  type="text"
                  value={formData.referrerName}
                  onChange={handleChange}
                  placeholder="z. B. Name eines bestehenden Lieferanten"
                />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting || !isFormValid}
                >
                  {isSubmitting
                    ? "Registrierung läuft..."
                    : "Registrierung absenden"}
                </Button>

                <Link to="/" className="w-full">
                  <Button type="button" variant="outline" className="w-full">
                    Zurück zur Startseite
                  </Button>
                </Link>
              </div>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}