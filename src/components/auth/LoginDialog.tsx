import { useState } from "react";
import { Loader2 } from "lucide-react";

import type { Client, LoginFormData, UserRole } from "../../types/client";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";

type LoginDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRegisterClick: () => void;
  onLoginSuccess: (user: Client) => void;
  onRolePreview: (role: UserRole) => void;
};

export function LoginDialog({
  open,
  onOpenChange,
  onRegisterClick,
  onLoginSuccess,
  onRolePreview,
}: LoginDialogProps) {
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (field: keyof LoginFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const fillCredentials = (email: string, password: string) => {
    setFormData({
      email,
      password,
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 700));

      const mockUser: Client = {
        id: "1",
        email: formData.email,
        firstName: "Sergej",
        lastName: "Schmidt",
        address: "Kleve",
        role: "CUSTOMER",
      };

      onLoginSuccess(mockUser);
      onOpenChange(false);
      setFormData({
        email: "",
        password: "",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterClick = () => {
    onOpenChange(false);
    onRegisterClick();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-md">
        <DialogHeader>
          <DialogTitle>Login</DialogTitle>
          <DialogDescription>
            Melde dich mit deiner E-Mail und deinem Passwort an.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
  <p className="text-sm font-medium text-muted-foreground">
    Testzugänge
  </p>

  <div className="flex flex-wrap gap-2">
    <Button
      type="button"
      variant="secondary"
      size="sm"
      onClick={() => {
        fillCredentials(
          "admin@mealdelivery.de",
          "$2a$10$abcdefghijklmnopqrstuv"
        );
        onRolePreview("ADMIN");
      }}
    >
      Admin
    </Button>

    <Button
      type="button"
      variant="secondary"
      size="sm"
      onClick={() => {
        fillCredentials(
          "schnitzelhaus.xanten@example.com",
          "1234"
        );
        onRolePreview("SUPPLIER");
      }}
    >
      Lieferant
    </Button>

    <Button
      type="button"
      variant="secondary"
      size="sm"
      onClick={() => {
        fillCredentials(
          "max.mustermann@example.com",
          "customer"
        );
        onRolePreview("CUSTOMER");
      }}
    >
      Kunde
    </Button>
  </div>
</div>

          <div className="space-y-2">
            <Label htmlFor="email">E-Mail</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Passwort</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => handleChange("password", e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <div className="flex flex-col gap-2 pt-2 sm:flex-row">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Einloggen...
                </>
              ) : (
                "Login"
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleRegisterClick}
            >
              Registrieren
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}