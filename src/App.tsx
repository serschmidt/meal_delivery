import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { DeliveryPartners } from "./components/DeliveryPartners";
import { Menu } from "./components/Menu";
// ... andere Imports

export default function App() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <div className="flex flex-1">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <main className="flex-1 p-8 m-4">
          <h2>Willkommen zu Meal Delivery</h2>
          <h2 className="mb-4 text-xl font-bold">Lieferanten in deiner Nähe</h2>
          <DeliveryPartners />
          <Menu />
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t p-4 text-center text-sm text-muted-foreground">
        © 2026 Meal Delivery. Alle Rechte vorbehalten.
      </footer>
    </div>
  );
}
