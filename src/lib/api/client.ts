import { ApiError } from "@/lib/api/errors";
import { tokenStorage } from "@/lib/auth/tokenStorage";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? "/api" : "https://meatng-api.onrender.com")
).replace(/\/+$/, "");

interface RequestOptions extends Omit<RequestInit, "body"> {
  token?: string | null;
  body?: unknown;
}

const parseJsonSafe = async (response: Response): Promise<unknown> => {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

const readPath = (obj: unknown, path: string): unknown => {
  return path.split(".").reduce<unknown>((acc, part) => {
    if (!acc || typeof acc !== "object") return undefined;
    return (acc as Record<string, unknown>)[part];
  }, obj);
};

const resolveErrorMessage = (payload: unknown, fallback: string): string => {
  if (typeof payload === "string") return payload;
  if (!payload || typeof payload !== "object") return fallback;

  const directMessage = (payload as Record<string, unknown>).message;
  if (typeof directMessage === "string") return directMessage;
  if (Array.isArray(directMessage) && directMessage.length > 0) {
    return String(directMessage[0]);
  }

  const directError = (payload as Record<string, unknown>).error;
  if (typeof directError === "string") return directError;

  const nestedCandidates: unknown[] = [
    readPath(payload, "data.attributes.message"),
    readPath(payload, "data.attributes.error"),
    readPath(payload, "data.attributes.data.message"),
    readPath(payload, "errors.0.detail"),
    readPath(payload, "errors.0.title"),
  ];

  for (const candidate of nestedCandidates) {
    if (typeof candidate === "string" && candidate.trim()) return candidate;
    if (Array.isArray(candidate) && candidate.length > 0) return String(candidate[0]);
  }

  return fallback;
};

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { token, body, headers, ...rest } = options;
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;

  const response = await fetch(`${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`, {
    ...rest,
    headers: {
      Accept: "application/json",
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers || {}),
    },
    body: body == null ? undefined : isFormData ? (body as FormData) : JSON.stringify(body),
  });

  const payload = await parseJsonSafe(response);
  if (!response.ok) {
    // Clear stale tokens and redirect to login on 401 Unauthorized
    if (response.status === 401) {
      tokenStorage.clearCustomerToken();
      tokenStorage.clearAdminToken();
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/auth") && !window.location.pathname.startsWith("/admin/login")) {
        window.location.assign("/auth/signin");
      }
    }
    throw new ApiError(
      resolveErrorMessage(payload, `Request failed (${response.status})`),
      response.status,
      payload,
    );
  }

  return payload as T;
}
