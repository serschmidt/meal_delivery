const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://liefermonopol.de/backend/public";

type ApiResponse<T> = {
  data: T;
  error?: string;
  message?: string;
};

type QueryParams = Record<string, string | number | boolean | null | undefined>;

function buildUrl(route: string, queryParams?: QueryParams) {
  const baseUrl = API_BASE_URL.endsWith("/") ? API_BASE_URL : `${API_BASE_URL}/`;
  const url = new URL(baseUrl);

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

async function request<T>(
  route: string,
  options: RequestInit = {},
  queryParams?: QueryParams
): Promise<T> {
  const response = await fetch(buildUrl(route, queryParams), {
    ...options,
    headers: {
      Accept: "application/json",
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(options.headers ?? {}),
    },
  });

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
  signal?: AbortSignal
): Promise<T> {
  return request<T>(
    route,
    {
      method: "GET",
      signal,
    },
    queryParams
  );
}

export async function apiPost<TResponse, TBody = unknown>(
  route: string,
  body?: TBody,
  signal?: AbortSignal
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
  signal?: AbortSignal
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
  signal?: AbortSignal
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
  signal?: AbortSignal
): Promise<TResponse> {
  return request<TResponse>(
    route,
    {
      method: "DELETE",
      signal,
    },
    queryParams
  );
}