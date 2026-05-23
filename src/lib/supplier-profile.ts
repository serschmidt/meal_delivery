import { apiGet, apiPatch } from "./api";

export type SupplierPayment = {
  accountHolder: string | null;
  iban: string | null;
  paypalLink: string | null;
};

export type SupplierProfile = {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  street: string;
  houseNumber: string;
  postalCode: string;
  city: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  payment: SupplierPayment;
};

export type UpdateSupplierProfileInput = {
  fullName: string;
  email: string;
  phone: string | null;
  street: string;
  houseNumber: string;
  postalCode: string;
  city: string;
  payment: SupplierPayment;
};

export async function getSupplierProfile(): Promise<SupplierProfile> {
  const response = await apiGet<{ data: SupplierProfile }>("supplier/profile");
  return response.data;
}

export async function updateSupplierProfile(
  input: UpdateSupplierProfileInput,
): Promise<SupplierProfile> {
  const response = await apiPatch<{ data: SupplierProfile }, UpdateSupplierProfileInput>(
    "supplier/profile",
    input,
  );
  return response.data;
}

export async function changeSupplierPassword(input: {
  currentPassword: string;
  newPassword: string;
}): Promise<{ message: string }> {
  const response = await apiPatch<{ data: { message: string } }, typeof input>(
    "supplier/change-password",
    input,
  );
  return response.data;
}