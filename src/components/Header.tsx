// z.B. in src/Header.tsx
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="flex items-center justify-between px-4 py-2 border-b bg-white">
      {/* Links: Projektname */}
      <div className="text-lg font-semibold">
        Meal Delivery
      </div>

      {/* Mitte: Suchleiste */}
      <div className="flex-1 max-w-xl mx-4">
        <Input
          type="search"
          placeholder="Suche..."
          className="w-full"
        />
      </div>

      {/* Rechts: Login */}
      <div>
        <Button variant="outline">
          Login
        </Button>
      </div>
    </header>
  );
}
