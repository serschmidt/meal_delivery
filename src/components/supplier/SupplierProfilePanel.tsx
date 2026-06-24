import { useEffect, useState } from "react";
import {
  getSupplierProfile,
  updateSupplierProfile,
  type SupplierProfile,
  type UpdateSupplierProfileInput,
} from "../../lib/supplier-profile";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

type FormState = {
  firstName: string;
  lastName: string;
  fullName: string;
  businessName: string;
  website: string;
  email: string;
  phone: string;
  street: string;
  houseNumber: string;
  postalCode: string;
  city: string;
  accountHolder: string;
  iban: string;
  paypalLink: string;
};

type SupplierProfilePanelProps = {
  onClose?: () => void;
};

function mapProfileToForm(profile: SupplierProfile): FormState {
  return {
    firstName: profile.firstName ?? "",
    lastName: profile.lastName ?? "",
    fullName: profile.fullName ?? "",
    businessName: profile.businessName ?? "",
    website: profile.website ?? "",
    email: profile.email ?? "",
    phone: profile.phone ?? "",
    street: profile.street ?? "",
    houseNumber: profile.houseNumber ?? "",
    postalCode: profile.postalCode ?? "",
    city: profile.city ?? "",
    accountHolder: profile.payment?.accountHolder ?? "",
    iban: profile.payment?.iban ?? "",
    paypalLink: profile.payment?.paypalLink ?? "",
  };
}

export function SupplierProfilePanel({ onClose }: SupplierProfilePanelProps) {
  const [form, setForm] = useState<FormState>({
    firstName: "",
    lastName: "",
    fullName: "",
    businessName: "",
    website: "",
    email: "",
    phone: "",
    street: "",
    houseNumber: "",
    postalCode: "",
    city: "",
    accountHolder: "",
    iban: "",
    paypalLink: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const isFormValid =
    form.businessName.trim() !== "" &&
    form.email.trim() !== "" &&
    form.street.trim() !== "" &&
    form.houseNumber.trim() !== "" &&
    form.postalCode.trim() !== "" &&
    form.city.trim() !== "" &&
    (form.iban.trim() !== "" || form.paypalLink.trim() !== "");

  useEffect(() => {
    async function loadProfile() {
      setIsLoading(true);
      setErrorMessage("");
      setMessage("");

      try {
        const profile = await getSupplierProfile();

        if (!profile) {
          throw new Error("Leeres Profil vom Server erhalten.");
        }

        setForm(mapProfileToForm(profile));
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Profil konnte nicht geladen werden.",
        );
      } finally {
        setIsLoading(false);
      }
    }

    void loadProfile();
  }, []);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setMessage("");
    setErrorMessage("");
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setMessage("");
    setErrorMessage("");

    const normalizedFullName =
      form.fullName.trim() ||
      [form.firstName.trim(), form.lastName.trim()].filter(Boolean).join(" ") ||
      form.businessName.trim();

    const payload: UpdateSupplierProfileInput = {
      firstName: form.firstName.trim() || null,
      lastName: form.lastName.trim() || null,
      fullName: normalizedFullName,
      businessName: form.businessName.trim() || null,
      website: form.website.trim() || null,
      email: form.email.trim(),
      phone: form.phone.trim() || null,
      street: form.street.trim(),
      houseNumber: form.houseNumber.trim(),
      postalCode: form.postalCode.trim(),
      city: form.city.trim(),
      payment: {
        accountHolder: form.accountHolder.trim() || null,
        iban: form.iban.trim() || null,
        paypalLink: form.paypalLink.trim() || null,
      },
    };

    try {
      const updatedProfile = await updateSupplierProfile(payload);
      setForm(mapProfileToForm(updatedProfile));
      setMessage("Profildaten erfolgreich gespeichert.");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Profil konnte nicht gespeichert werden.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <section className="rounded-3xl border bg-background p-6 shadow-sm">
        <p className="text-sm text-muted-foreground">
          Profildaten werden geladen...
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border bg-background p-6 shadow-sm">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Lieferantendaten</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Bearbeiten Sie hier Ihre Kontaktdaten, Firmendaten und
            Zahlungsinformationen.
          </p>
        </div>

        {onClose ? (
          <Button type="button" variant="outline" onClick={onClose}>
            Schließen
          </Button>
        ) : null}
      </div>

      {message ? (
        <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {message}
        </div>
      ) : null}

      {errorMessage ? (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      ) : null}

      <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label htmlFor="supplier-first-name" className="text-sm font-medium">
            Vorname
          </label>
          <Input
            id="supplier-first-name"
            value={form.firstName}
            onChange={(e) => updateField("firstName", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="supplier-last-name" className="text-sm font-medium">
            Nachname
          </label>
          <Input
            id="supplier-last-name"
            value={form.lastName}
            onChange={(e) => updateField("lastName", e.target.value)}
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <label
            htmlFor="supplier-business-name"
            className="text-sm font-medium"
          >
            Firmenname
          </label>
          <Input
            id="supplier-business-name"
            value={form.businessName}
            onChange={(e) => updateField("businessName", e.target.value)}
            required
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <label htmlFor="supplier-full-name" className="text-sm font-medium">
            Anzeigename / Vollständiger Name
          </label>
          <Input
            id="supplier-full-name"
            value={form.fullName}
            onChange={(e) => updateField("fullName", e.target.value)}
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <label htmlFor="supplier-website" className="text-sm font-medium">
            Website
          </label>
          <Input
            id="supplier-website"
            type="url"
            value={form.website}
            onChange={(e) => updateField("website", e.target.value)}
            placeholder="https://example.de"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="supplier-email" className="text-sm font-medium">
            E-Mail
          </label>
          <Input
            id="supplier-email"
            type="email"
            value={form.email}
            onChange={(e) => updateField("email", e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="supplier-phone" className="text-sm font-medium">
            Telefon
          </label>
          <Input
            id="supplier-phone"
            value={form.phone}
            onChange={(e) => updateField("phone", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="supplier-street" className="text-sm font-medium">
            Straße
          </label>
          <Input
            id="supplier-street"
            value={form.street}
            onChange={(e) => updateField("street", e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="supplier-house-number"
            className="text-sm font-medium"
          >
            Hausnummer
          </label>
          <Input
            id="supplier-house-number"
            value={form.houseNumber}
            onChange={(e) => updateField("houseNumber", e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="supplier-postal-code" className="text-sm font-medium">
            PLZ
          </label>
          <Input
            id="supplier-postal-code"
            value={form.postalCode}
            onChange={(e) => updateField("postalCode", e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="supplier-city" className="text-sm font-medium">
            Ort
          </label>
          <Input
            id="supplier-city"
            value={form.city}
            onChange={(e) => updateField("city", e.target.value)}
            required
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <p className="text-sm font-medium">Zahlungsdaten</p>
        </div>

        <div className="space-y-2 md:col-span-2">
          <label
            htmlFor="supplier-account-holder"
            className="text-sm font-medium"
          >
            Kontoinhaber
          </label>
          <Input
            id="supplier-account-holder"
            value={form.accountHolder}
            onChange={(e) => updateField("accountHolder", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="supplier-iban" className="text-sm font-medium">
            IBAN
          </label>
          <Input
            id="supplier-iban"
            value={form.iban}
            onChange={(e) => updateField("iban", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="supplier-paypal" className="text-sm font-medium">
            PayPal-Link
          </label>
          <Input
            id="supplier-paypal"
            value={form.paypalLink}
            onChange={(e) => updateField("paypalLink", e.target.value)}
          />
        </div>

        <div className="flex justify-end md:col-span-2">
          <Button type="submit" disabled={isSaving || !isFormValid}>
            {isSaving ? "Speichern..." : "Profildaten speichern"}
          </Button>
        </div>
      </form>
    </section>
  );
}
