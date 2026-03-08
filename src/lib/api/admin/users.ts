import { apiRequest } from "@/lib/api/client";
import { mapJsonApiItem, mapJsonApiList } from "./jsonApi";

export interface AdminUser {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
  isActive?: boolean;
  createdAt?: string;
  raw?: Record<string, unknown>;
}

const asString = (v: unknown): string | undefined =>
  typeof v === "string" && v.length > 0 ? v : undefined;
const asBoolean = (v: unknown): boolean | undefined =>
  typeof v === "boolean" ? v : undefined;

const mapAdminUser = (payload: unknown): AdminUser => {
  const { id, attributes } = mapJsonApiItem(payload);
  const firstName = asString(attributes.firstName || attributes.first_name) ?? "";
  const lastName = asString(attributes.lastName || attributes.last_name) ?? "";
  const combinedName = `${firstName} ${lastName}`.trim();
  return {
    id,
    name: asString(attributes.name) || combinedName || undefined,
    email: asString(attributes.email),
    phone: asString(attributes.phone || attributes.phoneNumber),
    role: asString(attributes.role),
    isActive: asBoolean(attributes.is_active ?? attributes.isActive),
    createdAt: asString(attributes.createdAt || attributes.created_at),
    raw: attributes,
  };
};

export const listAdminUsers = async (token?: string | null): Promise<AdminUser[]> => {
  const response = await apiRequest<unknown>("/users", { method: "GET", token });
  return mapJsonApiList(response).map(mapAdminUser);
};

export const deleteAdminUser = async (id: string, token?: string | null): Promise<void> => {
  await apiRequest<unknown>(`/users/delete-user/${id}`, { method: "DELETE", token });
};
