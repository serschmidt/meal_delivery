import { useState } from "react";
import { Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";

import { Header } from "./components/Header";
import { CartDrawer } from "./components/CartDrawer";
import { CookieBanner } from "./components/CookieBanner";
import { AppFooter } from "./components/AppFooter";

import type { Client } from "./types/client";

import { SupplierProvider } from "./contexts/SupplierProvider";
import { useSupplier } from "./contexts/useSupplier";
import { CartProvider } from "./contexts/CartProvider";
import { useCart } from "./contexts/useCart";

import { SupplierAuthProvider } from "./contexts/SupplierAuthProvider";
import { AdminAuthProvider } from "./contexts/AdminAuthProvider";
import { SupplierProtectedRoute } from "./components/SupplierProtectedRoute";

import { HomePage } from "./pages/HomePage";
import { SupplierRegistrationPage } from "./pages/SupplierRegistrationPage";
import { SupplierLoginPage } from "./pages/SupplierLoginPage";
import { SupplierPage } from "./pages/SupplierPage";
import { StoriesPage } from "./pages/StoriesPage";
import { GruendergeschichtePage } from "./pages/GruendergeschichtePage";
import { AdminPage } from "./pages/AdminPage";
import { CheckoutPage } from "./pages/CheckoutPage";
import { LieferdienstPage } from "./pages/LieferdienstPage";
import { LieferdienstCheckoutPage } from "@/pages/LieferdienstCheckoutPage";


import { AppDialog } from "./components/dialogs/AppDialog";
import type {
  FooterDialogKey,
  HeaderDialogKey,
} from "./components/dialogs/dialog-types";
import { headerDialogConfig } from "./components/dialogs/header-dialog-config";
import {
  footerDialogConfig,
  supplierFooterDialogConfig,
} from "./components/dialogs/footer-dialog-config";
import { EssenAufRaedernPage } from "./pages/EssenAufRaedernPage";

function AppContent() {
  const { selectedSupplier } = useSupplier();
  const { cartItemCount } = useCart();

  const [user] = useState<Client | null>(null);
  const [searchValue, setSearchValue] = useState("");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [footerDialog, setFooterDialog] = useState<FooterDialogKey>(null);
  const [supplierFooterDialog, setSupplierFooterDialog] =
    useState<FooterDialogKey>(null);
  const [headerDialog, setHeaderDialog] = useState<HeaderDialogKey>(null);

  return (
    <>
      <div className="flex min-h-screen flex-col bg-background">
        <Header
          user={user}
          selectedSupplier={selectedSupplier}
          cartItemCount={cartItemCount}
          onCartClick={() => setIsCartOpen(true)}
          onOrdersClick={() => console.log("Bestellungen öffnen")}
          onProfileClick={() => console.log("Profil öffnen")}
          onHeaderDialogChange={setHeaderDialog}
        />

        <CartDrawer open={isCartOpen} onOpenChange={setIsCartOpen} />

        <main className="flex-1">
          <Routes>
            <Route
              path="/"
              element={
                <HomePage
                  searchValue={searchValue}
                  onSearchChange={setSearchValue}
                />
              }
            />
            <Route
              path="/partner-login"
              element={
                <SupplierAuthProvider>
                  <SupplierLoginPage />
                </SupplierAuthProvider>
              }
            />
            <Route
              path="/supplier"
              element={
                <SupplierAuthProvider>
                  <SupplierProtectedRoute>
                    <SupplierPage />
                  </SupplierProtectedRoute>
                </SupplierAuthProvider>
              }
            />
            <Route
              path="/lieferant-werden"
              element={<SupplierRegistrationPage />}
            />
            <Route
              path="/admin"
              element={
                <AdminAuthProvider>
                  <AdminPage />
                </AdminAuthProvider>
              }
            />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/geschichten" element={<StoriesPage />} />
            <Route
              path="/gruendergeschichte"
              element={<GruendergeschichtePage />}
            />
            <Route path="/lieferdienst" element={<LieferdienstPage />} />
            <Route path="/lieferdienst/checkout" element={<LieferdienstCheckoutPage />} />
            <Route path="/essen-auf-raedern" element={<EssenAufRaedernPage />} />

          </Routes>
        </main>

        <AppFooter
          onOpenPlatformDialog={setFooterDialog}
          onOpenSupplierDialog={setSupplierFooterDialog}
        />
      </div>

      <CookieBanner />

      {headerDialog && (
        <AppDialog
          open={headerDialog !== null}
          onOpenChange={(open) => {
            if (!open) setHeaderDialog(null);
          }}
          title={headerDialogConfig[headerDialog].title}
        >
          {headerDialogConfig[headerDialog].content}
        </AppDialog>
      )}

      {footerDialog && (
        <AppDialog
          open={footerDialog !== null}
          onOpenChange={(open) => {
            if (!open) setFooterDialog(null);
          }}
          title={footerDialogConfig[footerDialog].title}
        >
          {footerDialogConfig[footerDialog].content}
        </AppDialog>
      )}

      {supplierFooterDialog && (
        <AppDialog
          open={supplierFooterDialog !== null}
          onOpenChange={(open) => {
            if (!open) setSupplierFooterDialog(null);
          }}
          title={supplierFooterDialogConfig[supplierFooterDialog].title}
        >
          {supplierFooterDialogConfig[supplierFooterDialog].content}
        </AppDialog>
      )}
    </>
  );
}

export default function App() {
  return (
    <>
      <SupplierProvider>
        <CartProvider>
          <AppContent />
        </CartProvider>
      </SupplierProvider>
      <Toaster richColors position="bottom-right" />
    </>
  );
}
