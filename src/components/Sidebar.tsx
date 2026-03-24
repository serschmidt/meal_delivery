import { Button } from "@/components/ui/button"
import { 
  Home, 
  ShoppingCart, 
  Package, 
  User, 
  Settings 
} from "lucide-react"

export function Sidebar() {
  return (
    <aside className="w-64 border-r bg-background p-4 flex flex-col">
      <nav className="flex-1 space-y-2">
        <Button variant="ghost" className="w-full justify-start">
          <Home className="mr-2 h-4 w-4" />
          Home
        </Button>
        <Button variant="ghost" className="w-full justify-start">
          <ShoppingCart className="mr-2 h-4 w-4" />
          Speisekarte
        </Button>
        <Button variant="ghost" className="w-full justify-start">
          <Package className="mr-2 h-4 w-4" />
          Bestellungen
        </Button>
        <Button variant="ghost" className="w-full justify-start">
          <User className="mr-2 h-4 w-4" />
          Profil
        </Button>
      </nav>
      
      <Button variant="ghost" className="w-full justify-start mt-auto">
        <Settings className="mr-2 h-4 w-4" />
        Einstellungen
      </Button>
    </aside>
  )
}
