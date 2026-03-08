import { apiRequest } from "@/lib/api/client";

export interface CustomerProfile {
  id: string;
  email: string;
  role?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  isActive?: boolean;
  isEmailVerified?: boolean;
}

interface UserApiPayload {
  data?: unknown;
}

interface UpdateUserPayload {
  firstName?: string;
  lastName?: string;
  phone?: string;
}

const readPath = (obj: unknown, path: string): unknown => {
  return path.split(".").reduce<unknown>((acc, part) => {
    if (!acc || typeof acc !== "object") return undefined;
    return (acc as Record<string, unknown>)[part];
  }, obj);
};

const asString = (value: unknown): string | undefined => {
  return typeof value === "string" && value.length > 0 ? value : undefined;
};

const mapProfile = (payload: UserApiPayload): CustomerProfile => {
  const attributes =
    readPath(payload, "data.relationships.data.data.attributes") ||
    readPath(payload, "data.attributes.data") ||
    {};
  const id =
    asString(readPath(payload, "data.relationships.data.data.id")) ||
    asString(readPath(payload, "data.id")) ||
    "";

  const obj = (attributes && typeof attributes === "object" ? attributes : {}) as Record<string, unknown>;

  return {
    id,
    email: asString(obj.email) || "",
    role: asString(obj.role),
    firstName: asString(obj.first_name),
    lastName: asString(obj.last_name),
    phone: asString(obj.phone),
    isActive: typeof obj.is_active === "boolean" ? obj.is_active : undefined,
    isEmailVerified: typeof obj.is_email_verified === "boolean" ? obj.is_email_verified : undefined,
  };
};

export const getCurrentUser = async (token?: string | null): Promise<CustomerProfile> => {
  const response = await apiRequest<UserApiPayload>("/users/me", {
    method: "GET",
    token,
  });
  return mapProfile(response);
};

export const updateCurrentUser = async (
  updates: UpdateUserPayload,
  token?: string | null,
): Promise<CustomerProfile> => {
  const body: Record<string, string> = {};
  if (updates.firstName) body.first_name = updates.firstName;
  if (updates.lastName) body.last_name = updates.lastName;
  if (updates.phone) body.phone = updates.phone;

  const response = await apiRequest<UserApiPayload>("/users/me", {
    method: "PATCH",
    body,
    token,
  });
  return mapProfile(response);
};

export const getUserById = async (id: string, token?: string | null): Promise<CustomerProfile> => {
  const response = await apiRequest<UserApiPayload>(`/users/get-user/${id}`, {
    method: "GET",
    token,
  });
  return mapProfile(response);
};

export const updateUserById = async (
  id: string,
  updates: UpdateUserPayload,
  token?: string | null,
): Promise<CustomerProfile> => {
  const body: Record<string, string> = {};
  if (updates.firstName) body.first_name = updates.firstName;
  if (updates.lastName) body.last_name = updates.lastName;
  if (updates.phone) body.phone = updates.phone;

  const response = await apiRequest<UserApiPayload>(`/users/update-user/${id}`, {
    method: "PATCH",
    body,
    token,
  });
  return mapProfile(response);
};
