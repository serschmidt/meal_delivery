import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import distributorImage from "../assets/delivery-7491357_1920.png";

type FormData = {
  distributorName: string;
  supplierName: string;
  email: string;
  password: string;
  address: string;
  paymentDetails: string;
};

export function DistributorRegistrationPage() {
  const [formData, setFormData] = useState<FormData>({
    distributorName: "",
    supplierName: "",
    email: "",
    password: "",
    address: "",
    paymentDetails: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Distributor registration:", formData);
  };

  return (
    <div className="w-full px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-5xl space-y-10">
        <section className="rounded-3xl bg-muted/40 px-6 py-10">
          <div className="grid items-center gap-8 lg:grid-cols-[1.6fr_0.9fr]">
            <div className="space-y-5 text-left">
              <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                Partner werden
              </p>

              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                Werden Sie heute noch zum Helden des Alltags.
              </h1>

              <div className="space-y-4 text-base text-muted-foreground sm:text-lg">
                <p>
                  Nicht nur Burger bringen, sondern soziale Teilhabe
                  ermöglichen: Gutes Essen darf kein Luxus sein.
                </p>
                <p>
                  Werden Sie unser Logistikpartner für Gerechtigkeit, lokale
                  Sichtbarkeit und positive PR in der Region durch eine
                  Kooperation auf Augenhöhe.
                </p>
                <p>
                  Eure Fahrer können mehr als nur Pizza. Jeder kann Fastfood –
                  aber wer traut sich, für 5,60 € echte Nachbarschaftshilfe an
                  die Tür zu bringen?
                </p>
                <p>
                  Marie hat den Herd im Griff, aber keinen Bock auf Stau. Wer
                  liefert unsere 5,60-€-Revolution aus?
                </p>
              </div>
            </div>

            <div className="flex justify-center lg:justify-end">
              <div className="w-full max-w-xs overflow-hidden rounded-3xl border bg-background p-3 shadow-sm sm:max-w-sm">
                <img
                  src={distributorImage}
                  alt="Lieferung von Essen durch einen Logistikpartner"
                  className="h-[240px] w-full rounded-2xl object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border bg-background p-6 shadow-sm">
          <div className="mx-auto max-w-3xl space-y-6">
            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-semibold">
                Registrierung als Lieferpartner
              </h2>
              <p className="text-sm text-muted-foreground">
                Tragen Sie Ihre Daten ein, damit wir Ihre Anfrage prüfen können.
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>

              <div className="space-y-2">
                <label htmlFor="supplierName" className="text-sm font-medium">
                  Name des Lieferanten
                </label>
                <Input
                  id="supplierName"
                  name="supplierName"
                  type="text"
                  value={formData.supplierName}
                  onChange={handleChange}
                  placeholder="z. B. Max Mustermann"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  E-Mail
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@beispiel.de"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Passwort
                </label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Passwort eingeben"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="address" className="text-sm font-medium">
                  Adresse
                </label>
                <Input
                  id="address"
                  name="address"
                  type="text"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Straße, Hausnummer, PLZ, Ort"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="paymentDetails" className="text-sm font-medium">
                  Bankverbindung / PayPal
                </label>
                <textarea
                  id="paymentDetails"
                  name="paymentDetails"
                  value={formData.paymentDetails}
                  onChange={handleChange}
                  placeholder="IBAN, Kontoinhaber oder PayPal-Adresse"
                  className="min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  required
                />
              </div>

                            <div className="space-y-2">
                <label
                  htmlFor="distributorName"
                  className="text-sm font-medium"
                >
                  Distributor Name
                </label>
                <Input
                  id="distributorName"
                  name="distributorName"
                  type="text"
                  value={formData.distributorName}
                  onChange={handleChange}
                  placeholder="z. B. Muster Logistik GmbH"
                  required
                />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button type="submit" className="w-full">
                  Registrierung absenden
                </Button>

                <Link to="/" className="w-full">
                  <Button type="button" variant="outline" className="w-full">
                    Zurück zur Startseite
                  </Button>
                </Link>
              </div>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}
