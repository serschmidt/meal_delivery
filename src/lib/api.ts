const API_BASE_URL = "http://localhost:8000";

type ApiResponse<T> = {
  data: T;
};

type QueryParams = Record<string, string | number | boolean | null | undefined>;

function buildUrl(route: string, queryParams?: QueryParams) {
  const url = new URL(API_BASE_URL);

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
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API-Fehler: ${response.status} ${response.statusText}`);
  }

  const json: ApiResponse<T> = await response.json();
  return json.data;
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
  return request<TResponse>(
    route,
    {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
      signal,
    }
  );
}

export async function apiPut<TResponse, TBody = unknown>(
  route: string,
  body?: TBody,
  signal?: AbortSignal
): Promise<TResponse> {
  return request<TResponse>(
    route,
    {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
      signal,
    }
  );
}

export async function apiPatch<TResponse, TBody = unknown>(
  route: string,
  body?: TBody,
  signal?: AbortSignal
): Promise<TResponse> {
  return request<TResponse>(
    route,
    {
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
      signal,
    }
  );
}

export async function apiDelete<TResponse>(
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