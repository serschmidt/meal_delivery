import { Header } from "@/components/Header"
import { Sidebar } from "@/components/Sidebar"
import { DeliveryPartners } from "./components/DeliveryPartners"
// ... andere Imports

export default function App() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <div className="flex flex-1">
        {/* Sidebar */}
        <Sidebar />
        
        {/* Main Content */}
        <main className="flex-1 p-8 overflow-auto">
          <h2>Willkommen zu Meal Delivery</h2>
          <DeliveryPartners />
        </main>
      </div>
      
      {/* Footer */}
      <footer className="border-t p-4 text-center text-sm text-muted-foreground">
        © 2026 Meal Delivery. Alle Rechte vorbehalten.
      </footer>
    </div>
  )
}
