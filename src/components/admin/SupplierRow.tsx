import { useMemo, useState } from "react";
import { Pencil, Save, MapPinned, Plus, X } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { apiPatch, apiPost } from "../../lib/api";
import { toast } from "sonner";
import type { Supplier } from "../../contexts/SupplierContext";
import { SupplierDeliveryAreasPanel } from "./SupplierDeliveryAreasPanel";

type SupplierFormData = {
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
  isActive: boolean;
};

type SupplierRowProps = {
  supplier?: Supplier;
  isExpanded: boolean;
  rowClassName?: string;
  onToggleExpand: () => void;
  onSaved: () => Promise<void>;
  isCreateMode?: boolean;
  onCancelCreate?: () => void;
};

const supplierToForm = (s: Supplier): SupplierFormData => ({
  firstName: s.firstName ?? "",
  lastName: s.lastName ?? "",
  fullName: s.fullName ?? "",
  businessName: s.businessName ?? "",
  email: s.email,
  password: "",
  phone: s.phone ?? "",
  website: s.website ?? "",
  street: s.address.street ?? "",
  houseNumber: s.address.houseNumber ?? "",
  postalCode: s.address.postalCode ?? "",
  city: s.address.city ?? "",
  accountHolder: s.payment.accountHolder ?? "",
  iban: s.payment.iban ?? "",
  paypalLink: s.payment.paypalLink ?? "",
  isActive: s.isActive,
});

const emptySupplierForm = (): SupplierFormData => ({
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
  isActive: true,
});

function buildPayload(form: SupplierFormData, isEdit: boolean) {
  const normalizedFullName =
    form.fullName.trim() ||
    [form.firstName.trim(), form.lastName.trim()].filter(Boolean).join(" ") ||
    form.businessName.trim();

  return {
    firstName: form.firstName.trim() || null,
    lastName: form.lastName.trim() || null,
    fullName: normalizedFullName,
    businessName: form.businessName.trim(),
    email: form.email.trim(),
    ...(isEdit
      ? { password: form.password.trim() || undefined }
      : { password: form.password.trim() }),
    phone: form.phone.trim() || null,
    website: form.website.trim() || null,
    street: form.street.trim(),
    houseNumber: form.houseNumber.trim(),
    postalCode: form.postalCode.trim(),
    city: form.city.trim(),
    accountHolder: form.accountHolder.trim() || null,
    iban: form.iban.trim() || null,
    paypalLink: form.paypalLink.trim() || null,
    isActive: form.isActive,
  };
}

export function SupplierRow({
  supplier,
  isExpanded,
  rowClassName,
  onToggleExpand,
  onSaved,
  isCreateMode = false,
  onCancelCreate,
}: SupplierRowProps) {
  const fallbackSupplier = {
    id: "",
    firstName: "",
    lastName: "",
    fullName: "",
    businessName: "",
    email: "",
    phone: "",
    website: "",
    isActive: true,
    address: {
      street: "",
      houseNumber: "",
      postalCode: "",
      city: "",
    },
    payment: {
      accountHolder: "",
      iban: "",
      paypalLink: "",
    },
  } as Supplier;

  const rowSupplier = supplier ?? fallbackSupplier;

  const [form, setForm] = useState<SupplierFormData>(() =>
    isCreateMode ? emptySupplierForm() : supplierToForm(rowSupplier),
  );
  const [originalForm, setOriginalForm] = useState<SupplierFormData>(() =>
    isCreateMode ? emptySupplierForm() : supplierToForm(rowSupplier),
  );
  const [isSaving, setIsSaving] = useState(false);
  const [deliveryAreasOpen, setDeliveryAreasOpen] = useState(false);

  const updateField = <K extends keyof SupplierFormData>(
    key: K,
    value: SupplierFormData[K],
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const changedFields = useMemo(() => {
    const originalPayload = buildPayload(originalForm, true);
    const currentPayload = buildPayload(form, true);
    const changed: Record<string, unknown> = {};

    for (const key of Object.keys(currentPayload) as Array<
      keyof typeof currentPayload
    >) {
      if (currentPayload[key] !== originalPayload[key]) {
        changed[key] = currentPayload[key];
      }
    }

    return changed;
  }, [form, originalForm]);

  const hasChanges = Object.keys(changedFields).length > 0;

  const handleSave = async () => {
    const payload = buildPayload(form, !isCreateMode);

    if (!payload.businessName.trim()) {
      toast.error("Bitte Firmenname eingeben.");
      return;
    }

    if (!payload.email.trim()) {
      toast.error("Bitte E-Mail eingeben.");
      return;
    }

    if (!payload.street.trim() || !payload.houseNumber.trim()) {
      toast.error("Bitte Straße und Hausnummer eingeben.");
      return;
    }

    if (!payload.postalCode.trim() || !payload.city.trim()) {
      toast.error("Bitte PLZ und Ort eingeben.");
      return;
    }

    if (isCreateMode && !form.password.trim()) {
      toast.error("Bitte ein Passwort für den neuen Lieferanten eingeben.");
      return;
    }

    if (!isCreateMode && !supplier) {
      toast.error("Kein Lieferant zum Bearbeiten vorhanden.");
      return;
    }

    if (!isCreateMode && !hasChanges) {
      toast.error("Es wurden keine Änderungen vorgenommen.");
      return;
    }

    try {
      setIsSaving(true);

      if (isCreateMode) {
        await apiPost("suppliers", payload);
        toast.success("Lieferant angelegt.");
        onCancelCreate?.();
      } else {
        await apiPatch(`suppliers/${supplier!.id}`, changedFields);
        toast.success("Lieferant aktualisiert.");
        const nextOriginal = { ...form, password: "" };
        setOriginalForm(nextOriginal);
        setForm(nextOriginal);
      }

      await onSaved();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Fehler beim Speichern.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <tr className={rowClassName}>
        <td className="px-4 py-3 font-medium">
          {isCreateMode ? "Neuer Lieferant" : rowSupplier.businessName ?? "—"}
        </td>
        <td className="px-4 py-3 text-muted-foreground">
          {isCreateMode ? "—" : rowSupplier.fullName}
        </td>
        <td className="px-4 py-3 text-muted-foreground">
          {isCreateMode ? "—" : rowSupplier.email}
        </td>
        <td className="px-4 py-3 text-muted-foreground">
          {isCreateMode
            ? "—"
            : `${rowSupplier.address.postalCode ?? ""} ${rowSupplier.address.city ?? ""}`}
        </td>
        <td className="px-4 py-3">
          <span
            className={
              isCreateMode
                ? "font-medium text-blue-600"
                : rowSupplier.isActive
                  ? "font-medium text-green-600"
                  : "font-medium text-destructive"
            }
          >
            {isCreateMode ? "Neu" : rowSupplier.isActive ? "Aktiv" : "Inaktiv"}
          </span>
        </td>
        <td className="px-4 py-3 text-right">
          <div className="flex justify-end gap-1">
            {isCreateMode && onCancelCreate ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onCancelCreate}
              >
                <X className="size-4" />
              </Button>
            ) : null}

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onToggleExpand}
            >
              {isCreateMode ? (
                <Plus className="size-4" />
              ) : (
                <Pencil className="size-4" />
              )}
            </Button>
          </div>
        </td>
      </tr>

      {isExpanded && (
        <tr>
          <td colSpan={6} className="border-t bg-muted/10 px-4 py-5">
            <div className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-1">
                      <Label>Vorname</Label>
                      <Input
                        value={form.firstName}
                        onChange={(e) => updateField("firstName", e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Nachname</Label>
                      <Input
                        value={form.lastName}
                        onChange={(e) => updateField("lastName", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label>Firmenname</Label>
                    <Input
                      value={form.businessName}
                      onChange={(e) => updateField("businessName", e.target.value)}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label>Anzeigename / Vollständiger Name</Label>
                    <Input
                      value={form.fullName}
                      onChange={(e) => updateField("fullName", e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-1">
                      <Label>E-Mail</Label>
                      <Input
                        type="email"
                        value={form.email}
                        onChange={(e) => updateField("email", e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Website</Label>
                      <Input
                        type="url"
                        value={form.website}
                        onChange={(e) => updateField("website", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label>
                      {isCreateMode
                        ? "Passwort"
                        : "Neues Passwort (leer = unverändert)"}
                    </Label>
                    <Input
                      type="password"
                      value={form.password}
                      onChange={(e) => updateField("password", e.target.value)}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label>Telefon</Label>
                    <Input
                      value={form.phone}
                      onChange={(e) => updateField("phone", e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-[2fr_1fr] gap-4">
                    <div className="space-y-1">
                      <Label>Straße</Label>
                      <Input
                        value={form.street}
                        onChange={(e) => updateField("street", e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Hausnummer</Label>
                      <Input
                        value={form.houseNumber}
                        onChange={(e) => updateField("houseNumber", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-[1fr_2fr] gap-4">
                    <div className="space-y-1">
                      <Label>PLZ</Label>
                      <Input
                        value={form.postalCode}
                        onChange={(e) => updateField("postalCode", e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Ort</Label>
                      <Input
                        value={form.city}
                        onChange={(e) => updateField("city", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-4 border-t pt-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Zahlungsdaten
                    </p>

                    <div className="space-y-1">
                      <Label>Kontoinhaber</Label>
                      <Input
                        value={form.accountHolder}
                        onChange={(e) =>
                          updateField("accountHolder", e.target.value)
                        }
                      />
                    </div>

                    <div className="space-y-1">
                      <Label>IBAN</Label>
                      <Input
                        value={form.iban}
                        onChange={(e) => updateField("iban", e.target.value)}
                      />
                    </div>

                    <div className="space-y-1">
                      <Label>PayPal-Link</Label>
                      <Input
                        value={form.paypalLink}
                        onChange={(e) => updateField("paypalLink", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      id={`supplier-active-${supplier?.id ?? "new"}`}
                      type="checkbox"
                      checked={form.isActive}
                      onChange={(e) => updateField("isActive", e.target.checked)}
                      className="size-4 rounded border"
                    />
                    <Label htmlFor={`supplier-active-${supplier?.id ?? "new"}`}>
                      Aktiv
                    </Label>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    {isCreateMode && onCancelCreate && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={onCancelCreate}
                        disabled={isSaving}
                      >
                        <X className="mr-2 size-4" />
                        Abbrechen
                      </Button>
                    )}

                    <Button
                      type="button"
                      onClick={handleSave}
                      disabled={isSaving || (!isCreateMode && !hasChanges)}
                    >
                      <Save className="mr-2 size-4" />
                      {isSaving
                        ? isCreateMode
                          ? "Anlegen..."
                          : "Speichern..."
                        : isCreateMode
                          ? "Lieferant anlegen"
                          : "Speichern"}
                    </Button>
                  </div>
                </div>

                <div className="rounded-lg border bg-background p-4">
                  {!isCreateMode && supplier ? (
                    (() => {
                      const currentSupplier = supplier;

                      return (
                        <>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() =>
                              setDeliveryAreasOpen((prev) => !prev)
                            }
                          >
                            <MapPinned className="mr-2 size-4" />
                            Liefergebiete laden
                          </Button>

                          <div className="mb-3 mt-3">
                            <h3 className="font-semibold">Liefergebiete</h3>
                            <p className="text-sm text-muted-foreground">
                              Verwalten Sie Städte und Postleitzahlen dieses
                              Lieferanten.
                            </p>
                          </div>

                          {deliveryAreasOpen ? (
                            <SupplierDeliveryAreasPanel
                              supplierId={currentSupplier.id}
                            />
                          ) : (
                            <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
                              Klicken Sie auf „Liefergebiete“, um die
                              Liefergebiete zu laden.
                            </div>
                          )}
                        </>
                      );
                    })()
                  ) : (
                    <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
                      Liefergebiete können nach dem Anlegen des Lieferanten
                      verwaltet werden.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}