import { apiGet, apiPost, setAccessToken } from "./api";

export type SupplierUser = {
  id: string;
  full_name: string;
  email: string;
};

export type SupplierAuthTokenPayload = {
  type: "Bearer";
  access_token: string;
  expires_in: number;
};

export type SupplierLoginResponse = {
  supplier: SupplierUser;
  token: SupplierAuthTokenPayload;
};

export type CurrentSupplierResponse = {
  iss: string;
  aud: string;
  iat: number;
  nbf: number;
  exp: number;
  sub: string;
  email: string;
  full_name: string;
  role: "supplier";
  type: "access";
};

export async function loginSupplier(
  email: string,
  password: string,
): Promise<SupplierLoginResponse> {
  const result = await apiPost<
    SupplierLoginResponse,
    { email: string; password: string }
  >("supplier-auth/login", { email, password });

  setAccessToken(result.token.access_token);

  return result;
}

export async function getCurrentSupplier(): Promise<CurrentSupplierResponse> {
  return apiGet<CurrentSupplierResponse>("supplier-auth/me");
}

export async function refreshSupplierSession(): Promise<SupplierLoginResponse> {
  const result = await apiPost<SupplierLoginResponse>("supplier-auth/refresh");
  setAccessToken(result.token.access_token);
  return result;
}

export async function logoutSupplier() {
  await apiPost("supplier-auth/logout");
  setAccessToken(null);
}