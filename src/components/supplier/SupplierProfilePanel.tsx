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
  fullName: string;
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

export function SupplierProfilePanel({
  onClose,
}: SupplierProfilePanelProps) {
  const [form, setForm] = useState<FormState>({
    fullName: "",
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

  useEffect(() => {
    async function loadProfile() {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const profile: SupplierProfile = await getSupplierProfile();

        if (!profile) {
          throw new Error("Leeres Profil vom Server erhalten.");
        }

        setForm({
          fullName: profile.fullName,
          email: profile.email,
          phone: profile.phone ?? "",
          street: profile.street,
          houseNumber: profile.houseNumber,
          postalCode: profile.postalCode,
          city: profile.city,
          accountHolder: profile.payment.accountHolder ?? "",
          iban: profile.payment.iban ?? "",
          paypalLink: profile.payment.paypalLink ?? "",
        });
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

    loadProfile();
  }, []);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setMessage("");
    setErrorMessage("");

    const payload: UpdateSupplierProfileInput = {
      fullName: form.fullName,
      email: form.email,
      phone: form.phone || null,
      street: form.street,
      houseNumber: form.houseNumber,
      postalCode: form.postalCode,
      city: form.city,
      payment: {
        accountHolder: form.accountHolder || null,
        iban: form.iban || null,
        paypalLink: form.paypalLink || null,
      },
    };

    try {
      await updateSupplierProfile(payload);
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
            Bearbeiten Sie hier Ihre Kontaktdaten und Zahlungsinformationen.
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
        <div className="space-y-2 md:col-span-2">
          <label htmlFor="supplier-full-name" className="text-sm font-medium">
            Name
          </label>
          <Input
            id="supplier-full-name"
            value={form.fullName}
            onChange={(e) => updateField("fullName", e.target.value)}
            required
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

        <div className="md:col-span-2 flex justify-end">
          <Button type="submit" disabled={isSaving}>
            {isSaving ? "Speichern..." : "Profildaten speichern"}
          </Button>
        </div>
      </form>
    </section>
  );
}
