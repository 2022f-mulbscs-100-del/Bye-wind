import { getStoredToken } from "./auth";

export type ApiErrorDetail = {
  field?: string;
  message: string;
};

export type ApiResponsePayload<T> = {
  success: boolean;
  message: string;
  data: T;
  meta?: unknown;
  errors?: ApiErrorDetail[];
};

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000/api/v1";

type ApiRequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  headers?: HeadersInit;
  useToken?: boolean;
};

const buildUrl = (path: string) => {
  if (path.startsWith("http")) return path;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};

const parseResponse = async <T>(response: Response) => {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as ApiResponsePayload<T>;
  } catch {
    return null;
  }
};

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}) {
  const { method = "GET", body, headers = {}, useToken = true } = options;
  const url = buildUrl(path);
  const mergedHeaders: Record<string, string> = {};
  const storageToken = useToken ? getStoredToken() : null;

  if (body && !(body instanceof FormData)) {
    mergedHeaders["Content-Type"] = "application/json";
  }

  if (storageToken) {
    mergedHeaders["Authorization"] = `Bearer ${storageToken}`;
  }

  Object.assign(mergedHeaders, headers);

  const response = await fetch(url, {
    method,
    headers: mergedHeaders,
    body:
      body && !(body instanceof FormData) ? JSON.stringify(body) : (body as BodyInit | undefined),
  });

  const parsed = await parseResponse<T>(response);

  if (!response.ok) {
    const fallbackMessage = response.statusText || "Request failed";
    const message = parsed?.message ?? fallbackMessage;
    const error = new Error(message) as Error & { errors?: ApiErrorDetail[] };
    if (parsed?.errors) {
      error.errors = parsed.errors;
    }
    throw error;
  }

  if (!parsed) {
    throw new Error("Invalid JSON response");
  }

  return parsed;
}

export const getJson = <T>(path: string, options?: Omit<ApiRequestOptions, "method">) =>
  apiRequest<T>(path, { method: "GET", ...options });

export const postJson = <T>(path: string, body?: unknown, options?: Omit<ApiRequestOptions, "method">) =>
  apiRequest<T>(path, { method: "POST", body, ...options });

export const putJson = <T>(path: string, body?: unknown, options?: Omit<ApiRequestOptions, "method">) =>
  apiRequest<T>(path, { method: "PUT", body, ...options });

export const deleteJson = <T>(path: string, options?: Omit<ApiRequestOptions, "method">) =>
  apiRequest<T>(path, { method: "DELETE", ...options });
