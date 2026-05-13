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
};

type WeeklyMenuEntry = {
  day_of_week: string;
  menu_date: string;
  position: number;
  meal_id: string;
};

type WeeklyMenu = {
  id: string;
  calendarWeek: number | null;
  title: string;
  description: string;
  startDate: string | null;
  endDate: string | null;
  imageUrl: string | null;
  entries: {
    id: string;
    dayOfWeek: string;
    menuDate: string;
    position: number;
    meal: { id: string; name: string };
  }[];
};

type WeeklyMenuFormData = {
  calendar_week: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  image_url: string;
  entries: WeeklyMenuEntry[];
};

const DAY_OPTIONS = [
  { value: "MONDAY", label: "Montag" },
  { value: "TUESDAY", label: "Dienstag" },
  { value: "WEDNESDAY", label: "Mittwoch" },
  { value: "THURSDAY", label: "Donnerstag" },
  { value: "FRIDAY", label: "Freitag" },
  { value: "SATURDAY", label: "Samstag" },
  { value: "SUNDAY", label: "Sonntag" },
];

const emptyForm: WeeklyMenuFormData = {
  calendar_week: "",
  title: "",
  description: "",
  start_date: "",
  end_date: "",
  image_url: "",
  entries: [],
};

function weeklyMenuToForm(menu: WeeklyMenu): WeeklyMenuFormData {
  return {
    calendar_week: menu.calendarWeek?.toString() ?? "",
    title: menu.title ?? "",
    description: menu.description ?? "",
    start_date: menu.startDate ?? "",
    end_date: menu.endDate ?? "",
    image_url: menu.imageUrl ?? "",
    entries: menu.entries.map((e, i) => ({
      day_of_week: e.dayOfWeek,
      menu_date: e.menuDate,
      position: i + 1,
      meal_id: e.meal.id,
    })),
  };
}

export function WeeklyMenusAdmin() {
  const [menus, setMenus] = useState<WeeklyMenu[]>([]);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [selectedMenu, setSelectedMenu] = useState<WeeklyMenu | null>(null);
  const [form, setForm] = useState<WeeklyMenuFormData>(emptyForm);
  const [isSaving, setIsSaving] = useState(false);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [menusData, mealsData] = await Promise.all([
        apiGet<WeeklyMenu[]>("weekly-menus"),
        apiGet<Meal[]>("meals"),
      ]);
      setMenus(Array.isArray(menusData) ? menusData : []);
      setMeals(Array.isArray(mealsData) ? mealsData : []);
    } catch {
      toast.error("Fehler beim Laden der Daten.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const addEntry = () => {
    setForm((prev) => ({
      ...prev,
      entries: [
        ...prev.entries,
        {
          day_of_week: "MONDAY",
          menu_date: "",
          position: prev.entries.length + 1,
          meal_id: meals[0]?.id ?? "",
        },
      ],
    }));
  };

  const removeEntry = (index: number) => {
    setForm((prev) => ({
      ...prev,
      entries: prev.entries
        .filter((_, i) => i !== index)
        .map((e, i) => ({ ...e, position: i + 1 })),
    }));
  };

  const updateEntry = (
    index: number,
    field: keyof WeeklyMenuEntry,
    value: string | number,
  ) => {
    setForm((prev) => ({
      ...prev,
      entries: prev.entries.map((e, i) =>
        i === index ? { ...e, [field]: value } : e,
      ),
    }));
  };

  const buildPayload = () => ({
    calendar_week: parseInt(form.calendar_week),
    title: form.title || null,
    description: form.description || null,
    start_date: form.start_date,
    end_date: form.end_date,
    image_url: form.image_url || null,
    entries: form.entries,
  });

  const handleSaveNew = async () => {
    try {
      setIsSaving(true);
      await apiPost("weekly-menus", buildPayload());
      toast.success("Wochenmenü erstellt.");
      setAddOpen(false);
      loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Fehler beim Speichern.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedMenu) return;
    try {
      setIsSaving(true);
      await apiPut(`weekly-menus/${selectedMenu.id}`, buildPayload());
      toast.success("Wochenmenü aktualisiert.");
      setEditOpen(false);
      loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Fehler beim Speichern.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedMenu) return;
    try {
      await apiDelete(`weekly-menus/${selectedMenu.id}`);
      toast.success("Wochenmenü gelöscht.");
      setDeleteOpen(false);
      setEditOpen(false);
      loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Fehler beim Löschen.");
    }
  };

  const formContent = (
    <div className="max-h-[60vh] space-y-4 overflow-y-auto py-2 pr-1">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label>Kalenderwoche</Label>
          <Input
            type="number"
            value={form.calendar_week}
            onChange={(e) => setForm({ ...form, calendar_week: e.target.value })}
            placeholder="z. B. 20"
          />
        </div>
        <div className="space-y-1">
          <Label>Titel</Label>
          <Input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="z. B. Wochenmenü KW 20"
          />
        </div>
      </div>

      <div className="space-y-1">
        <Label>Beschreibung</Label>
        <Input
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Kurze Beschreibung"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label>Startdatum</Label>
          <Input
            type="date"
            value={form.start_date}
            onChange={(e) => setForm({ ...form, start_date: e.target.value })}
          />
        </div>
        <div className="space-y-1">
          <Label>Enddatum</Label>
          <Input
            type="date"
            value={form.end_date}
            onChange={(e) => setForm({ ...form, end_date: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-1">
        <Label>Bild-URL</Label>
        <Input
          value={form.image_url}
          onChange={(e) => setForm({ ...form, image_url: e.target.value })}
          placeholder="/assets/KW_20.jpg"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Einträge</Label>
          <Button type="button" variant="outline" size="sm" onClick={addEntry}>
            <Plus className="mr-1 size-3" />
            Eintrag hinzufügen
          </Button>
        </div>

        {form.entries.length === 0 && (
          <p className="text-xs text-muted-foreground">Noch keine Einträge.</p>
        )}

        {form.entries.map((entry, index) => (
          <div
            key={index}
            className="grid grid-cols-[1fr_1fr_2fr_auto] gap-2 rounded-lg border p-2"
          >
            <select
              value={entry.day_of_week}
              onChange={(e) => updateEntry(index, "day_of_week", e.target.value)}
              className="rounded-md border bg-background px-2 py-1 text-sm"
            >
              {DAY_OPTIONS.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>

            <Input
              type="date"
              value={entry.menu_date}
              onChange={(e) => updateEntry(index, "menu_date", e.target.value)}
              className="text-sm"
            />

            <select
              value={entry.meal_id}
              onChange={(e) => updateEntry(index, "meal_id", e.target.value)}
              className="rounded-md border bg-background px-2 py-1 text-sm"
            >
              {meals.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeEntry(index)}
            >
              <Trash2 className="size-4 text-destructive" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Wochenmenüs</h2>
        <Button
          onClick={() => {
            setForm(emptyForm);
            setAddOpen(true);
          }}
        >
          <Plus className="mr-2 size-4" />
          Wochenmenü hinzufügen
        </Button>
      </div>

      {isLoading && (
        <p className="text-sm text-muted-foreground">Wird geladen...</p>
      )}

      {!isLoading && menus.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Noch keine Wochenmenüs vorhanden.
        </p>
      )}

      {!isLoading && menus.length > 0 && (
        <div className="rounded-xl border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3">KW</th>
                <th className="px-4 py-3">Titel</th>
                <th className="px-4 py-3">Zeitraum</th>
                <th className="px-4 py-3">Einträge</th>
                <th className="px-4 py-3 text-right">Aktion</th>
              </tr>
            </thead>
            <tbody>
              {menus.map((menu, index) => (
                <tr
                  key={menu.id}
                  className={index % 2 === 0 ? "bg-background" : "bg-muted/20"}
                >
                  <td className="px-4 py-3 font-medium">
                    {menu.calendarWeek ?? "—"}
                  </td>
                  <td className="px-4 py-3">{menu.title}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {menu.startDate} – {menu.endDate}
                  </td>
                  <td className="px-4 py-3">{menu.entries.length} Tage</td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedMenu(menu);
                        setForm(weeklyMenuToForm(menu));
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
            <DialogTitle>Wochenmenü hinzufügen</DialogTitle>
          </DialogHeader>
          {formContent}
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
            <DialogTitle>Wochenmenü bearbeiten</DialogTitle>
          </DialogHeader>
          {formContent}
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

      {/* AlertDialog: Löschen */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Wochenmenü löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Möchtest du{" "}
              <span className="font-medium text-foreground">
                {selectedMenu?.title}
              </span>{" "}
              wirklich löschen? Alle zugehörigen Einträge werden ebenfalls
              gelöscht.
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