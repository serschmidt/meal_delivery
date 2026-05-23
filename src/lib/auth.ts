import { apiGet, apiPost, setAccessToken } from "./api";

export type AdminUser = {
  id: string;
  full_name: string;
  email: string;
};

export type AuthTokenPayload = {
  type: "Bearer";
  access_token: string;
  expires_in: number;
};

export type LoginResponse = {
  admin: AdminUser;
  token: AuthTokenPayload;
};

export type CurrentAdminResponse = {
  iss: string;
  aud: string;
  iat: number;
  nbf: number;
  exp: number;
  sub: string;
  email: string;
  full_name: string;
  role: "admin";
  type: "access";
};

export async function loginAdmin(email: string, password: string): Promise<LoginResponse> {
  const result = await apiPost<LoginResponse, { email: string; password: string }>(
    "auth/login",
    { email, password }
  );

  setAccessToken(result.token.access_token);

  return result;
}

export async function getCurrentAdmin(): Promise<CurrentAdminResponse> {
  return apiGet<CurrentAdminResponse>("auth/me");
}

export async function refreshAdminSession(): Promise<LoginResponse> {
  const result = await apiPost<LoginResponse>("auth/refresh");
  setAccessToken(result.token.access_token);
  return result;
}

export async function logoutAdmin() {
  await apiPost("auth/logout");
  setAccessToken(null);
}