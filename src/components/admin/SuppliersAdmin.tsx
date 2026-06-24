import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "../ui/button";
import { apiGet } from "../../lib/api";
import { toast } from "sonner";
import type { Supplier } from "../../contexts/SupplierContext";
import { SupplierRow } from "./SupplierRow";

export function SuppliersAdmin() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedSupplierId, setExpandedSupplierId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

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
    void loadSuppliers();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Lieferanten</h2>
        <Button
          type="button"
          onClick={() => {
            setIsCreating((current) => {
              const next = !current;
              setExpandedSupplierId(next ? "new" : null);
              return next;
            });
          }}
        >
          <Plus className="mr-2 size-4" />
          Lieferant hinzufügen
        </Button>
      </div>

      {isLoading && (
        <p className="text-sm text-muted-foreground">Wird geladen...</p>
      )}

      {!isLoading && suppliers.length === 0 && !isCreating && (
        <p className="text-sm text-muted-foreground">
          Noch keine Lieferanten vorhanden.
        </p>
      )}

      {(!isLoading && (suppliers.length > 0 || isCreating)) && (
        <div className="rounded-xl border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3">Firma</th>
                <th className="px-4 py-3">Ansprechpartner</th>
                <th className="px-4 py-3">E-Mail</th>
                <th className="px-4 py-3">Ort</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Aktion</th>
              </tr>
            </thead>
            <tbody>
              {isCreating && (
                <SupplierRow
                  isCreateMode
                  isExpanded={expandedSupplierId === "new"}
                  rowClassName="bg-blue-50/40"
                  onToggleExpand={() =>
                    setExpandedSupplierId((current) =>
                      current === "new" ? null : "new",
                    )
                  }
                  onCancelCreate={() => {
                    setIsCreating(false);
                    setExpandedSupplierId(null);
                  }}
                  onSaved={async () => {
                    await loadSuppliers();
                    setIsCreating(false);
                    setExpandedSupplierId(null);
                  }}
                />
              )}

              {suppliers.map((supplier, index) => (
                <SupplierRow
                  key={supplier.id}
                  supplier={supplier}
                  isExpanded={expandedSupplierId === supplier.id}
                  rowClassName={index % 2 === 0 ? "bg-background" : "bg-muted/20"}
                  onToggleExpand={() =>
                    setExpandedSupplierId((current) =>
                      current === supplier.id ? null : supplier.id,
                    )
                  }
                  onSaved={loadSuppliers}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}