const API_BASE_URL = import.meta.env.VITE_API_URL || "/backend/index.php";

type ApiResponse<T> = {
  data: T;
  error?: string;
  message?: string;
};

type QueryParams = Record<string, string | number | boolean | null | undefined>;

let accessToken: string | null = null;
let refreshPromise: Promise<void> | null = null;
let unauthorizedHandler: (() => void) | null = null;
let refreshRoute = "auth/refresh";

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

export function setUnauthorizedHandler(handler: (() => void) | null) {
  unauthorizedHandler = handler;
}

export function setRefreshRoute(route: string) {
  refreshRoute = route;
}

function notifyUnauthorized() {
  unauthorizedHandler?.();
}

function buildUrl(route: string, queryParams?: QueryParams) {
  const url = new URL(API_BASE_URL, window.location.origin);

  url.searchParams.set("route", route);

  if (queryParams) {
    Object.entries(queryParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    });
  }

  return url.toString();
}

async function tryRefreshToken() {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const response = await fetch(buildUrl(refreshRoute), {
        method: "POST",
        credentials: "include",
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        setAccessToken(null);
        notifyUnauthorized();
        throw new Error("Sitzung abgelaufen.");
      }

      const payload = await response.json();
      const newAccessToken = payload?.data?.token?.access_token;

      if (!newAccessToken) {
        setAccessToken(null);
        notifyUnauthorized();
        throw new Error("Kein neuer Access-Token erhalten.");
      }

      setAccessToken(newAccessToken);
    })().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

async function request<T>(
  route: string,
  options: RequestInit = {},
  queryParams?: QueryParams,
  retry = true,
): Promise<T> {
  const headers: HeadersInit = {
    Accept: "application/json",
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    ...(options.headers ?? {}),
  };

  const response = await fetch(buildUrl(route, queryParams), {
    ...options,
    credentials: "include",
    headers,
  });

  if (
    response.status === 401 &&
    retry &&
    route !== "auth/login" &&
    route !== "auth/refresh" &&
    route !== "auth/logout" &&
    route !== "supplier-auth/login" &&
    route !== "supplier-auth/refresh" &&
    route !== "supplier-auth/logout"
  ) {
    await tryRefreshToken();
    return request<T>(route, options, queryParams, false);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const payload = isJson ? await response.json() : null;

  if (!response.ok) {
    const message =
      payload?.error ||
      payload?.message ||
      `API-Fehler: ${response.status} ${response.statusText}`;

    if (response.status === 401) {
      setAccessToken(null);
      notifyUnauthorized();
    }

    throw new Error(message);
  }

  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as ApiResponse<T>).data;
  }

  return payload as T;
}

export async function apiGet<T>(
  route: string,
  queryParams?: QueryParams,
  signal?: AbortSignal,
): Promise<T> {
  return request<T>(
    route,
    {
      method: "GET",
      signal,
    },
    queryParams,
  );
}

export async function apiPost<TResponse, TBody = unknown>(
  route: string,
  body?: TBody,
  signal?: AbortSignal,
): Promise<TResponse> {
  return request<TResponse>(route, {
    method: "POST",
    body: body ? JSON.stringify(body) : undefined,
    signal,
  });
}

export async function apiPut<TResponse, TBody = unknown>(
  route: string,
  body?: TBody,
  signal?: AbortSignal,
): Promise<TResponse> {
  return request<TResponse>(route, {
    method: "PUT",
    body: body ? JSON.stringify(body) : undefined,
    signal,
  });
}

export async function apiPatch<TResponse, TBody = unknown>(
  route: string,
  body?: TBody,
  signal?: AbortSignal,
): Promise<TResponse> {
  return request<TResponse>(route, {
    method: "PATCH",
    body: body ? JSON.stringify(body) : undefined,
    signal,
  });
}

export async function apiDelete<TResponse = void>(
  route: string,
  queryParams?: QueryParams,
  signal?: AbortSignal,
): Promise<TResponse> {
  return request<TResponse>(
    route,
    {
      method: "DELETE",
      signal,
    },
    queryParams,
  );
}