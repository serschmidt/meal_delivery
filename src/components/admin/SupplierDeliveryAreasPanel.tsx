import { useCallback, useEffect, useMemo, useState } from "react";
import { Pencil, Plus, Save, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { apiDelete, apiGet, apiPatch, apiPost } from "../../lib/api";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { ScrollArea } from "../ui/scroll-area";
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

type SupplierDeliveryArea = {
  id: string;
  city: string;
  postalCode: string;
};

type EditableRow = {
  id: string;
  city: string;
  postalCode: string;
  isNew?: boolean;
};

type SupplierDeliveryAreasPanelProps = {
  supplierId: string;
};

function normalizePostalCode(value: string) {
  return value.replace(/\D/g, "").slice(0, 5);
}

function isValidPostalCode(value: string) {
  return /^[0-9]{5}$/.test(value);
}

export function SupplierDeliveryAreasPanel({
  supplierId,
}: SupplierDeliveryAreasPanelProps) {
  const [areas, setAreas] = useState<SupplierDeliveryArea[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, EditableRow>>({});
  const [deleteCandidate, setDeleteCandidate] =
    useState<SupplierDeliveryArea | null>(null);
  const [isSavingId, setIsSavingId] = useState<string | null>(null);

  const loadAreas = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await apiGet<SupplierDeliveryArea[]>(
        `suppliers/${supplierId}/delivery-areas`,
      );
      const next = Array.isArray(data) ? data : [];
      setAreas(next);
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Liefergebiete konnten nicht geladen werden.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [supplierId]);

  useEffect(() => {
    void loadAreas();
  }, [loadAreas]);

  const sortedAreas = useMemo(
    () =>
      [...areas].sort((a, b) =>
        `${a.postalCode}-${a.city}`.localeCompare(
          `${b.postalCode}-${b.city}`,
          "de",
        ),
      ),
    [areas],
  );

  const startEdit = (area: SupplierDeliveryArea) => {
    setDrafts((current) => ({
      ...current,
      [area.id]: {
        id: area.id,
        city: area.city,
        postalCode: area.postalCode,
      },
    }));
    setEditingRowId(area.id);
  };

  const startCreate = () => {
    const tempId = `new-${Date.now()}`;
    setDrafts((current) => ({
      ...current,
      [tempId]: {
        id: tempId,
        city: "",
        postalCode: "",
        isNew: true,
      },
    }));
    setEditingRowId(tempId);
  };

  const updateDraft = (
    id: string,
    field: "city" | "postalCode",
    value: string,
  ) => {
    setDrafts((current) => ({
      ...current,
      [id]: {
        ...current[id],
        [field]: field === "postalCode" ? normalizePostalCode(value) : value,
      },
    }));
  };

  const cancelEdit = (id: string) => {
    setDrafts((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });
    setEditingRowId((current) => (current === id ? null : current));
  };

  const handleSave = async (id: string) => {
    const draft = drafts[id];
    if (!draft) return;

    const city = draft.city.trim();
    const postalCode = normalizePostalCode(draft.postalCode);

    if (!city || !isValidPostalCode(postalCode)) {
      toast.error("Bitte Stadt und gültige 5-stellige PLZ eingeben.");
      return;
    }

    try {
      setIsSavingId(id);

      if (draft.isNew) {
        const created = await apiPost<SupplierDeliveryArea>(
          `suppliers/${supplierId}/delivery-areas`,
          { city, postalCode },
        );

        setAreas((current) => [...current, created]);
      } else {
        const updated = await apiPatch<SupplierDeliveryArea>(
          `suppliers/${supplierId}/delivery-areas/${id}`,
          { city, postalCode },
        );

        setAreas((current) =>
          current.map((area) => (area.id === id ? updated : area)),
        );
      }

      cancelEdit(id);
      toast.success("Liefergebiet gespeichert.");
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Liefergebiet konnte nicht gespeichert werden.",
      );
    } finally {
      setIsSavingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteCandidate) return;

    try {
      await apiDelete(`suppliers/${supplierId}/delivery-areas/${deleteCandidate.id}`);
      setAreas((current) => current.filter((area) => area.id !== deleteCandidate.id));
      toast.success("Liefergebiet gelöscht.");
      setDeleteCandidate(null);
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Liefergebiet konnte nicht gelöscht werden.",
      );
    }
  };

  const rows: EditableRow[] = useMemo(() => {
    const existing = sortedAreas.map((area) => drafts[area.id] ?? area);
    const newRows = Object.values(drafts).filter((row) => row.isNew);
    return [...newRows, ...existing];
  }, [drafts, sortedAreas]);

  if (isLoading) {
    return (
      <p className="text-xs text-muted-foreground">
        Liefergebiete werden geladen...
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={startCreate}
          className="h-8 px-2"
        >
          <Plus className="size-4" />
          <span className="ml-1">Liefergebiet</span>
        </Button>
      </div>

      <ScrollArea className="h-[36rem] w-full rounded-md border">
        <div className="space-y-1 p-1">
          {rows.length === 0 && (
            <div className="rounded-sm border border-dashed px-2 py-1 text-xs text-muted-foreground">
              Noch keine Liefergebiete vorhanden.
            </div>
          )}

          {rows.map((row) => {
            const isEditing = editingRowId === row.id;
            const draft = drafts[row.id] ?? row;
            const canSave =
              draft.city.trim() !== "" &&
              isValidPostalCode(normalizePostalCode(draft.postalCode));

            return (
              <div
                key={row.id}
                className="rounded-sm border bg-background px-2 py-1"
              >
                {!isEditing ? (
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0 truncate text-xs">
                      <span className="font-medium">{row.postalCode}</span>
                      <span className="text-muted-foreground"> · </span>
                      <span>{row.city}</span>
                    </div>

                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 shrink-0 text-yellow-700 hover:bg-yellow-50"
                      onClick={() => startEdit(row as SupplierDeliveryArea)}
                    >
                      <Pencil className="size-3.5" />
                      <span className="sr-only">Bearbeiten</span>
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-[auto_96px_1fr_auto_auto] items-end gap-1">
                    <Button
                      type="button"
                      size="icon"
                      variant="destructive"
                      className="h-7 w-7"
                      onClick={() => {
                        if (draft.isNew) {
                          cancelEdit(row.id);
                          return;
                        }
                        setDeleteCandidate(row as SupplierDeliveryArea);
                      }}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>

                    <div className="space-y-0">
                      <span className="text-[10px] text-muted-foreground">PLZ</span>
                      <Input
                        inputMode="numeric"
                        value={draft.postalCode}
                        onChange={(e) =>
                          updateDraft(row.id, "postalCode", e.target.value)
                        }
                        placeholder="41464"
                        className="h-8 px-2"
                      />
                    </div>

                    <div className="space-y-0">
                      <span className="text-[10px] text-muted-foreground">Stadt</span>
                      <Input
                        value={draft.city}
                        onChange={(e) => updateDraft(row.id, "city", e.target.value)}
                        placeholder="Neuss"
                        className="h-8 px-2"
                      />
                    </div>

                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      className="h-7 w-7"
                      onClick={() => cancelEdit(row.id)}
                    >
                      <X className="size-3.5" />
                    </Button>

                    <Button
                      type="button"
                      size="icon"
                      className="h-7 w-7 bg-green-600 text-white hover:bg-green-700"
                      disabled={!canSave || isSavingId === row.id}
                      onClick={() => handleSave(row.id)}
                    >
                      <Save className="size-3.5" />
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>

      <AlertDialog
        open={deleteCandidate !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteCandidate(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Liefergebiet löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Möchtest du das Liefergebiet{" "}
              <span className="font-medium text-foreground">
                {deleteCandidate?.postalCode} · {deleteCandidate?.city}
              </span>{" "}
              wirklich löschen?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
            >
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}