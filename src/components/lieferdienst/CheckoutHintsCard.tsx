import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AGE_CONFIRM_TEXT,
  AGE_GATE_TEXT,
  EXCLUDED_ITEMS_TEXT,
  LIMIT_HINT_TEXT,
  REACHABILITY_TEXT,
} from "./constants";

type Props = {
  hasSensitiveItems: boolean;
  reachableConfirmed: boolean;
  ageConfirmed: boolean;
  onReachableChange: (value: boolean) => void;
  onAgeChange: (value: boolean) => void;
};

export function CheckoutHintsCard({
  hasSensitiveItems,
  reachableConfirmed,
  ageConfirmed,
  onReachableChange,
  onAgeChange,
}: Props) {
  const navigate = useNavigate();

  return (
    <Card className="rounded-3xl">
      <CardHeader>
        <CardTitle>Check-out Hinweise</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="rounded-2xl border bg-muted/30 p-4 text-sm leading-6 text-muted-foreground">
          {EXCLUDED_ITEMS_TEXT} {LIMIT_HINT_TEXT} {REACHABILITY_TEXT}
        </div>

        <label className="flex items-start gap-3 rounded-2xl border p-4 text-sm">
          <Checkbox
            checked={reachableConfirmed}
            onCheckedChange={(value) => onReachableChange(Boolean(value))}
          />
          <span>{REACHABILITY_TEXT}</span>
        </label>

        {hasSensitiveItems && (
          <>
            <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4 text-sm leading-6 text-slate-800">
              {AGE_GATE_TEXT}
            </div>

            <label className="flex items-start gap-3 rounded-2xl border p-4 text-sm">
              <Checkbox
                checked={ageConfirmed}
                onCheckedChange={(value) => onAgeChange(Boolean(value))}
              />
              <span>{AGE_CONFIRM_TEXT}</span>
            </label>
          </>
        )}

        <div className="flex flex-wrap gap-3">
          <Button size="lg" onClick={() => navigate("/lieferdienst/checkout")}>
            Weiter zum Checkout
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}