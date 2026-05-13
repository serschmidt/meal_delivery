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
import { apiGet, apiPost, apiPut, apiDelete } from "../../lib/api";
import { toast } from "sonner";

type Meal = {
  id: string;
  name: string;
  price: number;
  description: string | null;
  imageUrl: string | null;
  available: boolean;
};

type MealFormData = {
  name: string;
  price: string;
  description: string;
  imageUrl: string;
  available: boolean;
};

const emptyForm: MealFormData = {
  name: "",
  price: "",
  description: "",
  imageUrl: "",
  available: true,
};

function mealToForm(meal: Meal): MealFormData {
  return {
    name: meal.name,
    price: meal.price.toFixed(2),
    description: meal.description ?? "",
    imageUrl: meal.imageUrl ?? "",
    available: meal.available,
  };
}

export function MealsAdmin() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [form, setForm] = useState<MealFormData>(emptyForm);
  const [isSaving, setIsSaving] = useState(false);

  const loadMeals = async () => {
    try {
      setIsLoading(true);
      const data = await apiGet<Meal[]>("meals");
      setMeals(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Fehler beim Laden der Mahlzeiten.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMeals();
  }, []);

  const handleAdd = () => {
    setForm(emptyForm);
    setAddOpen(true);
  };

  const handleEdit = (meal: Meal) => {
    setSelectedMeal(meal);
    setForm(mealToForm(meal));
    setEditOpen(true);
  };

  const handleSaveNew = async () => {
    try {
      setIsSaving(true);
      await apiPost("meals", {
        name: form.name,
        price: parseFloat(form.price),
        description: form.description || null,
        imageUrl: form.imageUrl || null,
        available: form.available,
      });
      toast.success("Mahlzeit hinzugefügt.");
      setAddOpen(false);
      loadMeals();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Fehler beim Speichern.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedMeal) return;
    try {
      setIsSaving(true);
      await apiPut(`meals/${selectedMeal.id}`, {
        name: form.name,
        price: parseFloat(form.price),
        description: form.description || null,
        imageUrl: form.imageUrl || null,
        available: form.available,
      });
      toast.success("Mahlzeit aktualisiert.");
      setEditOpen(false);
      loadMeals();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Fehler beim Speichern.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedMeal) return;
    try {
      await apiDelete(`meals/${selectedMeal.id}`);
      toast.success("Mahlzeit gelöscht.");
      setDeleteOpen(false);
      setEditOpen(false);
      loadMeals();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Fehler beim Löschen.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Mahlzeiten</h2>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 size-4" />
          Mahlzeit hinzufügen
        </Button>
      </div>

      {isLoading && (
        <p className="text-sm text-muted-foreground">Wird geladen...</p>
      )}

      {!isLoading && meals.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Noch keine Mahlzeiten vorhanden.
        </p>
      )}

      {!isLoading && meals.length > 0 && (
        <div className="rounded-xl border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Preis</th>
                <th className="px-4 py-3">Verfügbar</th>
                <th className="px-4 py-3 text-right">Aktion</th>
              </tr>
            </thead>
            <tbody>
              {meals.map((meal, index) => (
                <tr
                  key={meal.id}
                  className={index % 2 === 0 ? "bg-background" : "bg-muted/20"}
                >
                  <td className="px-4 py-3 font-medium">{meal.name}</td>
                  <td className="px-4 py-3">
                    € {meal.price.toFixed(2).replace(".", ",")}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        meal.available
                          ? "font-medium text-green-600"
                          : "font-medium text-destructive"
                      }
                    >
                      {meal.available ? "Ja" : "Nein"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(meal)}
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

      {/* Dialog: Mahlzeit hinzufügen */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mahlzeit hinzufügen</DialogTitle>
          </DialogHeader>
          <MealForm form={form} onChange={setForm} />
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

      {/* Dialog: Mahlzeit bearbeiten */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mahlzeit bearbeiten</DialogTitle>
          </DialogHeader>
          <MealForm form={form} onChange={setForm} />
          <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-between">
            <Button
              variant="destructive"
              onClick={() => {
                setEditOpen(false);
                setDeleteOpen(true);
              }}
            >
              <Trash2 className="mr-2 size-4" />
              Löschen
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

      {/* AlertDialog: Löschen bestätigen */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mahlzeit löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Möchtest du{" "}
              <span className="font-medium text-foreground">
                {selectedMeal?.name}
              </span>{" "}
              wirklich löschen? Diese Aktion kann nicht rückgängig gemacht
              werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
            >
              Endgültig löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

type MealFormProps = {
  form: MealFormData;
  onChange: (form: MealFormData) => void;
};

function MealForm({ form, onChange }: MealFormProps) {
  return (
    <div className="space-y-4 py-2">
      <div className="space-y-1">
        <Label htmlFor="meal-name">Name</Label>
        <Input
          id="meal-name"
          value={form.name}
          onChange={(e) => onChange({ ...form, name: e.target.value })}
          placeholder="z. B. Hähnchenstreifen mit Kartoffeln"
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="meal-price">Preis (€)</Label>
        <Input
          id="meal-price"
          type="number"
          step="0.01"
          min="0"
          value={form.price}
          onChange={(e) => onChange({ ...form, price: e.target.value })}
          placeholder="5.60"
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="meal-description">Beschreibung / Allergene</Label>
        <Input
          id="meal-description"
          value={form.description}
          onChange={(e) => onChange({ ...form, description: e.target.value })}
          placeholder="z. B. Allergene: Eier, Milch"
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="meal-image">Bild-URL</Label>
        <Input
          id="meal-image"
          value={form.imageUrl}
          onChange={(e) => onChange({ ...form, imageUrl: e.target.value })}
          placeholder="/assets/gericht.jpg"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          id="meal-available"
          type="checkbox"
          checked={form.available}
          onChange={(e) => onChange({ ...form, available: e.target.checked })}
          className="size-4 rounded border"
        />
        <Label htmlFor="meal-available">Verfügbar</Label>
      </div>
    </div>
  );
}