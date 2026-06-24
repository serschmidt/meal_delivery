import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { DeliveryAddressCard } from "@/components/lieferdienst/DeliveryAddressCard";
import { CheckoutHintsCard } from "@/components/lieferdienst/CheckoutHintsCard";
import { RideCard } from "@/components/lieferdienst/RideCard";
import { SummaryCard } from "@/components/lieferdienst/SummaryCard";
import type {
  Address,
  CheckoutDraft,
  DeliveryAreaStatus,
  Ride,
} from "@/components/lieferdienst/types";
import { STORAGE_KEY } from "@/components/lieferdienst/constants";
import {
    buildPlainAddressText,
    createEmptyRide,
  createInitialDeliveryAreaStatus,
  createInitialDraft,
  geocodeAddress,
  hasIncompleteCustomerAddress,
  hasSensitiveItemsInText,
  hydrateDraft,
  shoppingItemsToText,
  validateDeliveryAreaAgainstConfig,
} from "@/components/lieferdienst/utils";

export function LieferdienstPage() {

  const [draft, setDraft] = useState<CheckoutDraft>(() => {
    if (typeof window === "undefined") return createInitialDraft();
    return hydrateDraft(window.localStorage.getItem(STORAGE_KEY));
  });

  const [deliveryAreaStatus, setDeliveryAreaStatus] =
    useState<DeliveryAreaStatus>(createInitialDeliveryAreaStatus());

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  }, [draft]);

  const deliveryMapQuery = useMemo(() => {
    return [
      draft.customerAddress.street,
      draft.customerAddress.houseNumber,
      draft.customerAddress.postalCode,
      draft.customerAddress.city,
    ]
      .filter(Boolean)
      .join(" ")
      .trim();
  }, [draft.customerAddress]);

  const deliveryMapSrc = `https://www.google.com/maps?q=${encodeURIComponent(
    deliveryMapQuery || draft.customerAddress.city || "Neuss",
  )}&z=11&output=embed`;

  const hasSensitiveItems = draft.rides.some(
    (ride: Ride) =>
      ride.option !== "already_paid" &&
      hasSensitiveItemsInText(shoppingItemsToText(ride.shoppingItems)),
  );

  const isAddressIncomplete = hasIncompleteCustomerAddress(
    draft.customerAddress,
  );


  const updateCustomerAddress = (field: keyof Address, value: string) => {
    setDraft((prev: CheckoutDraft) => ({
      ...prev,
      customerAddress: {
        ...prev.customerAddress,
        [field]: value,
      },
    }));
    setDeliveryAreaStatus(createInitialDeliveryAreaStatus());
  };

  const updateRide = (rideId: string, updater: (ride: Ride) => Ride) => {
    setDraft((prev: CheckoutDraft) => ({
      ...prev,
      rides: prev.rides.map((ride: Ride) =>
        ride.id === rideId ? updater(ride) : ride,
      ),
    }));
  };

  const addRide = () => {
    setDraft((prev: CheckoutDraft) => ({
      ...prev,
      rides: [...prev.rides, createEmptyRide()],
    }));
  };

  const removeRide = (rideId: string) => {
    setDraft((prev: CheckoutDraft) => ({
      ...prev,
      rides:
        prev.rides.length === 1
          ? prev.rides
          : prev.rides.filter((ride: Ride) => ride.id !== rideId),
    }));
  };

  const addShoppingInput = (rideId: string) => {
    updateRide(rideId, (ride: Ride) => ({
      ...ride,
      shoppingItems: [
        ...ride.shoppingItems.map((item) => ({ ...item, isEditing: false })),
        { id: crypto.randomUUID(), value: "", isEditing: true },
      ],
    }));
  };

  const updateShoppingItem = (
    rideId: string,
    itemId: string,
    value: string,
  ) => {
    updateRide(rideId, (ride: Ride) => ({
      ...ride,
      shoppingItems: ride.shoppingItems.map((item) =>
        item.id === itemId ? { ...item, value } : item,
      ),
    }));
  };

  const saveShoppingItem = (rideId: string, itemId: string) => {
    updateRide(rideId, (ride: Ride) => ({
      ...ride,
      shoppingItems: ride.shoppingItems.map((item) =>
        item.id === itemId
          ? {
              ...item,
              value: item.value.trim(),
              isEditing: item.value.trim().length === 0,
            }
          : { ...item, isEditing: false },
      ),
    }));
  };

  const editShoppingItem = (rideId: string, itemId: string) => {
    updateRide(rideId, (ride: Ride) => ({
      ...ride,
      shoppingItems: ride.shoppingItems.map((item) => ({
        ...item,
        isEditing: item.id === itemId,
      })),
    }));
  };

  const removeShoppingItem = (rideId: string, itemId: string) => {
    updateRide(rideId, (ride: Ride) => {
      const nextItems = ride.shoppingItems.filter((item) => item.id !== itemId);

      return {
        ...ride,
        shoppingItems:
          nextItems.length > 0
            ? nextItems
            : [{ id: crypto.randomUUID(), value: "", isEditing: true }],
      };
    });
  };

  const validateDeliveryArea = async () => {
    await validateDeliveryAreaAgainstConfig(
      draft.customerAddress.postalCode,
      draft.customerAddress.city,
      setDeliveryAreaStatus,
    );
  };

  const calculateRideDistance = async (rideId: string) => {
    const ride = draft.rides.find((item: Ride) => item.id === rideId);
    if (!ride) return;
const storeAddressText = buildPlainAddressText(ride.store.address);
const customerAddressText = buildPlainAddressText(draft.customerAddress);


    if (!storeAddressText || !customerAddressText) {
      updateRide(rideId, (currentRide: Ride) => ({
        ...currentRide,
        routeError:
          "Bitte Lieferadresse und Geschäftsadresse vollständig ausfüllen.",
      }));
      return;
    }

    updateRide(rideId, (currentRide: Ride) => ({
      ...currentRide,
      routeLoading: true,
      routeError: "",
    }));

    try {
      const startCoords = await geocodeAddress(storeAddressText);
      const endCoords = await geocodeAddress(customerAddressText);

      const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${startCoords[1]},${startCoords[0]};${endCoords[1]},${endCoords[0]}?overview=false`;
      const response = await fetch(osrmUrl, {
        headers: { Accept: "application/json" },
      });

      if (!response.ok) {
        throw new Error("Route konnte nicht berechnet werden.");
      }

      const data: { code: string; routes?: Array<{ distance: number }> } =
        await response.json();

      if (data.code !== "Ok" || !data.routes?.length) {
        throw new Error("Keine Route gefunden.");
      }

      const km = Number((data.routes[0].distance / 1000).toFixed(1));

      updateRide(rideId, (currentRide: Ride) => ({
        ...currentRide,
        distanceKm: km,
        routeLoading: false,
        routeError: "",
      }));
    } catch (error) {
      updateRide(rideId, (currentRide: Ride) => ({
        ...currentRide,
        distanceKm: null,
        routeLoading: false,
        routeError:
          error instanceof Error
            ? error.message
            : "Die Strecke konnte nicht berechnet werden.",
      }));
    }
  };

  const totalDistanceKm = draft.rides.reduce(
    (sum: number, ride: Ride) =>
      sum + (typeof ride.distanceKm === "number" ? ride.distanceKm : 0),
    0,
  );

  const totalRides = draft.rides.length;
  const orderBasePrice = 8.5;
  const driverExtra = Math.max(0, Math.ceil(totalDistanceKm - 3));

  return (
    <div className="w-full space-y-8 px-4 py-6 sm:px-6 lg:px-8">
      <div className="space-y-3">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Hol- und Bringdienst
        </h1>
        <p className="max-w-4xl text-sm text-muted-foreground sm:text-base">
          Lieferadresse erfassen, mehrere Fahrten zu verschiedenen Geschäften
          planen, Einkaufslisten speichern und die Datenvorschau für die spätere
          Backend-Übergabe prüfen.
        </p>
      </div>

      <DeliveryAddressCard
        customerAddress={draft.customerAddress}
        deliveryMapSrc={deliveryMapSrc}
        deliveryAreaStatus={deliveryAreaStatus}
        isAddressIncomplete={isAddressIncomplete}
        onAddressChange={updateCustomerAddress}
        onValidate={validateDeliveryArea}
      />

      <div className="space-y-6">
        {draft.rides.map((ride: Ride, index: number) => (
          <RideCard
            key={ride.id}
            ride={ride}
            index={index}
            canRemove={draft.rides.length > 1}
            onRemove={() => removeRide(ride.id)}
            onCalculateDistance={() => calculateRideDistance(ride.id)}
            onSelectOption={(option: Ride["option"]) =>
              updateRide(ride.id, (currentRide: Ride) => ({
                ...currentRide,
                option,
              }))
            }
            onCategoryChange={(category: Ride["category"]) =>
              updateRide(ride.id, (currentRide: Ride) => ({
                ...currentRide,
                category: category ?? "",
              }))
            }
            onStoreFieldChange={(_field: "name", value: string) =>
              updateRide(ride.id, (currentRide: Ride) => ({
                ...currentRide,
                store: { ...currentRide.store, name: value },
              }))
            }
            onStoreAddressChange={(
              field: "street" | "houseNumber" | "postalCode" | "city",
              value: string,
            ) =>
              updateRide(ride.id, (currentRide: Ride) => ({
                ...currentRide,
                store: {
                  ...currentRide.store,
                  address: { ...currentRide.store.address, [field]: value },
                },
              }))
            }
            onPickupCodeChange={(value: string) =>
              updateRide(ride.id, (currentRide: Ride) => ({
                ...currentRide,
                pickupCode: value,
              }))
            }
            onShoppingItemChange={(itemId: string, value: string) =>
              updateShoppingItem(ride.id, itemId, value)
            }
            onShoppingItemSave={(itemId: string) =>
              saveShoppingItem(ride.id, itemId)
            }
            onShoppingItemEdit={(itemId: string) =>
              editShoppingItem(ride.id, itemId)
            }
            onShoppingItemRemove={(itemId: string) =>
              removeShoppingItem(ride.id, itemId)
            }
            onAddShoppingItem={() => addShoppingInput(ride.id)}
          />
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <Button type="button" variant="outline" onClick={addRide}>
          Weitere Fahrt hinzufügen
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            setDraft(createInitialDraft());
            setDeliveryAreaStatus(createInitialDeliveryAreaStatus());
          }}
        >
          Formular zurücksetzen
        </Button>
      </div>

      <SummaryCard
        totalRides={totalRides}
        totalDistanceKm={totalDistanceKm}
        orderBasePrice={orderBasePrice}
        driverExtra={driverExtra}
      />

<CheckoutHintsCard
  hasSensitiveItems={hasSensitiveItems}
  reachableConfirmed={draft.reachableConfirmed}
  ageConfirmed={draft.ageConfirmed}
  onReachableChange={(value: boolean) =>
    setDraft((prev: CheckoutDraft) => ({
      ...prev,
      reachableConfirmed: value,
    }))
  }
  onAgeChange={(value: boolean) =>
    setDraft((prev: CheckoutDraft) => ({
      ...prev,
      ageConfirmed: value,
    }))
  }
/>
    </div>
  );
}