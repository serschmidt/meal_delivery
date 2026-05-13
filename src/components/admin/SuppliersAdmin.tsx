import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { apiGet, apiPost, apiPut } from "../../lib/api";
import { toast } from "sonner";
import type { Supplier } from "../../contexts/SupplierContext";

type SupplierFormData = {
  supplierName: string;
  email: string;
  password: string;
  phone: string;
  street: string;
  houseNumber: string;
  postalCode: string;
  city: string;
  accountHolder: string;
  iban: string;
  paypalLink: string;
  referrerName: string;
  isActive: boolean;
};

const emptyForm: SupplierFormData = {
  supplierName: "",
  email: "",
  password: "",
  phone: "",
  street: "",
  houseNumber: "",
  postalCode: "",
  city: "",
  accountHolder: "",
  iban: "",
  paypalLink: "",
  referrerName: "",
  isActive: true,
};

function supplierToForm(s: Supplier): SupplierFormData {
  return {
    supplierName: s.fullName,
    email: s.email,
    password: "",
    phone: s.phone ?? "",
    street: s.address.street,
    houseNumber: s.address.houseNumber,
    postalCode: s.address.postalCode,
    city: s.address.city,
    accountHolder: s.payment.accountHolder ?? "",
    iban: s.payment.iban ?? "",
    paypalLink: s.payment.paypalLink ?? "",
    referrerName: "",
    isActive: s.isActive,
  };
}

export function SuppliersAdmin() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deactivateOpen, setDeactivateOpen] = useState(false);

  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [form, setForm] = useState<SupplierFormData>(emptyForm);
  const [isSaving, setIsSaving] = useState(false);

  const loadSuppliers = async () => {
    try {
      setIsLoading(true);
      const data = await apiGet<Supplier[]>("suppliers/all");
      setSuppliers(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Fehler beim Laden der Lieferanten.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSuppliers();
  }, []);

  const handleSaveNew = async () => {
    try {
      setIsSaving(true);
      await apiPost("suppliers", form);
      toast.success("Lieferant hinzugefügt.");
      setAddOpen(false);
      loadSuppliers();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Fehler beim Speichern.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedSupplier) return;
    try {
      setIsSaving(true);
      await apiPut(`suppliers/${selectedSupplier.id}`, form);
      toast.success("Lieferant aktualisiert.");
      setEditOpen(false);
      loadSuppliers();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Fehler beim Speichern.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeactivate = async () => {
    if (!selectedSupplier) return;
    try {
      await apiPut(`suppliers/${selectedSupplier.id}`, {
        ...supplierToForm(selectedSupplier),
        isActive: false,
      });
      toast.success("Lieferant deaktiviert.");
      setDeactivateOpen(false);
      setEditOpen(false);
      loadSuppliers();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Fehler.");
    }
  };

  const formContent = (isEdit: boolean) => (
    <div className="max-h-[60vh] space-y-4 overflow-y-auto py-2 pr-1">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label>Name</Label>
          <Input
            value={form.supplierName}
            onChange={(e) => setForm({ ...form, supplierName: e.target.value })}
            placeholder="Anna Becker"
          />
        </div>
        <div className="space-y-1">
          <Label>E-Mail</Label>
          <Input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="anna@example.de"
          />
        </div>
      </div>

      <div className="space-y-1">
        <Label>{isEdit ? "Neues Passwort (leer = unverändert)" : "Passwort"}</Label>
        <Input
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          placeholder="Mindestens 8 Zeichen"
        />
      </div>

      <div className="space-y-1">
        <Label>Telefon</Label>
        <Input
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          placeholder="0151..."
        />
      </div>

      <div className="grid grid-cols-[2fr_1fr] gap-4">
        <div className="space-y-1">
          <Label>Straße</Label>
          <Input
            value={form.street}
            onChange={(e) => setForm({ ...form, street: e.target.value })}
            placeholder="Marktstraße"
          />
        </div>
        <div className="space-y-1">
          <Label>Hausnummer</Label>
          <Input
            value={form.houseNumber}
            onChange={(e) => setForm({ ...form, houseNumber: e.target.value })}
            placeholder="12"
          />
        </div>
      </div>

      <div className="grid grid-cols-[1fr_2fr] gap-4">
        <div className="space-y-1">
          <Label>PLZ</Label>
          <Input
            value={form.postalCode}
            onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
            placeholder="46509"
          />
        </div>
        <div className="space-y-1">
          <Label>Ort</Label>
          <Input
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
            placeholder="Xanten"
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
            onChange={(e) => setForm({ ...form, accountHolder: e.target.value })}
            placeholder="Anna Becker"
          />
        </div>
        <div className="space-y-1">
          <Label>IBAN</Label>
          <Input
            value={form.iban}
            onChange={(e) => setForm({ ...form, iban: e.target.value })}
            placeholder="DE02..."
          />
        </div>
        <div className="space-y-1">
          <Label>PayPal-Link</Label>
          <Input
            value={form.paypalLink}
            onChange={(e) => setForm({ ...form, paypalLink: e.target.value })}
            placeholder="https://paypal.me/..."
          />
        </div>
      </div>

      <div className="space-y-1">
        <Label>Empfohlen von</Label>
        <Input
          value={form.referrerName}
          onChange={(e) => setForm({ ...form, referrerName: e.target.value })}
          placeholder="Optional"
        />
      </div>

      {isEdit && (
        <div className="flex items-center gap-2">
          <input
            id="supplier-active"
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
            className="size-4 rounded border"
          />
          <Label htmlFor="supplier-active">Aktiv</Label>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Lieferanten</h2>
        <Button
          onClick={() => {
            setForm(emptyForm);
            setAddOpen(true);
          }}
        >
          <Plus className="mr-2 size-4" />
          Lieferant hinzufügen
        </Button>
      </div>

      {isLoading && (
        <p className="text-sm text-muted-foreground">Wird geladen...</p>
      )}

      {!isLoading && suppliers.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Noch keine Lieferanten vorhanden.
        </p>
      )}

      {!isLoading && suppliers.length > 0 && (
        <div className="rounded-xl border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">E-Mail</th>
                <th className="px-4 py-3">Ort</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Aktion</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map((supplier, index) => (
                <tr
                  key={supplier.id}
                  className={index % 2 === 0 ? "bg-background" : "bg-muted/20"}
                >
                  <td className="px-4 py-3 font-medium">{supplier.fullName}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {supplier.email}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {supplier.address.postalCode} {supplier.address.city}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        supplier.isActive
                          ? "font-medium text-green-600"
                          : "font-medium text-destructive"
                      }
                    >
                      {supplier.isActive ? "Aktiv" : "Inaktiv"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedSupplier(supplier);
                        setForm(supplierToForm(supplier));
                        setEditOpen(true);
                      }}
                    >
                      <Pencil className="size-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Dialog: Hinzufügen */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Lieferant hinzufügen</DialogTitle>
          </DialogHeader>
          {formContent(false)}
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleSaveNew} disabled={isSaving}>
              {isSaving ? "Speichern..." : "Speichern"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Bearbeiten */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Lieferant bearbeiten</DialogTitle>
          </DialogHeader>
          {formContent(true)}
          <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-between">
            <Button
              variant="destructive"
              onClick={() => {
                setEditOpen(false);
                setDeactivateOpen(true);
              }}
            >
              <Trash2 className="mr-2 size-4" />
              Deaktivieren
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setEditOpen(false)}>
                Abbrechen
              </Button>
              <Button onClick={handleSaveEdit} disabled={isSaving}>
                {isSaving ? "Speichern..." : "Speichern"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AlertDialog: Deaktivieren */}
      <AlertDialog open={deactivateOpen} onOpenChange={setDeactivateOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Lieferant deaktivieren?</AlertDialogTitle>
            <AlertDialogDescription>
              Möchtest du{" "}
              <span className="font-medium text-foreground">
                {selectedSupplier?.fullName}
              </span>{" "}
              deaktivieren? Der Lieferant wird nicht gelöscht, sondern nur als
              inaktiv markiert.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDeactivate}
            >
              Deaktivieren
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}