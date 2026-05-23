import { useState } from "react";
import { changeSupplierPassword } from "../../lib/supplier-profile";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

type SupplierPasswordPanelProps = {
  onClose?: () => void;
};

export function SupplierPasswordPanel({ onClose }: SupplierPasswordPanelProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setErrorMessage("");

    if (newPassword !== confirmPassword) {
      setErrorMessage("Die neue Passwortbestätigung stimmt nicht überein.");
      return;
    }

    setIsSaving(true);

    try {
      const result = await changeSupplierPassword({
        currentPassword,
        newPassword,
      });

      setMessage(result.message);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Passwort konnte nicht geändert werden.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="rounded-3xl border bg-background p-6 shadow-sm">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Passwort ändern</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Mindestens 8 Zeichen, mit Großbuchstabe, Kleinbuchstabe, Zahl und
            Sonderzeichen.
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

      <form className="grid gap-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label htmlFor="current-password" className="text-sm font-medium">
            Aktuelles Passwort
          </label>
          <Input
            id="current-password"
            type="password"
            autoComplete="current-password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="new-password" className="text-sm font-medium">
            Neues Passwort
          </label>
          <Input
            id="new-password"
            type="password"
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="confirm-password" className="text-sm font-medium">
            Neues Passwort bestätigen
          </label>
          <Input
            id="confirm-password"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSaving}>
            {isSaving ? "Speichern..." : "Passwort ändern"}
          </Button>
        </div>
      </form>
    </section>
  );
}
