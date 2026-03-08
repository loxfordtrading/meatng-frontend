import { apiRequest } from "@/lib/api/client";

export interface BackendPlan {
  id: string;
  name?: string;
  slug?: string;
  isActive?: boolean;
}

const asObj = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" ? (value as Record<string, unknown>) : {};

const asString = (value: unknown): string | undefined =>
  typeof value === "string" && value.trim().length > 0 ? value : undefined;

const asBoolean = (value: unknown): boolean | undefined =>
  typeof value === "boolean" ? value : undefined;

const mapDataItem = (item: unknown): BackendPlan | null => {
  const obj = asObj(item);
  const id = asString(obj.id);
  if (!id) return null;

  const attributes = asObj(obj.attributes);
  return {
    id,
    name: asString(attributes.name) ?? asString(attributes.title),
    slug: asString(attributes.slug) ?? asString(attributes.code),
    isActive: asBoolean(attributes.isActive ?? attributes.is_active),
  };
};

export const listPlans = async (activeOnly = false, token?: string | null): Promise<BackendPlan[]> => {
  const path = activeOnly ? "/plans/active" : "/plans";
  const response = await apiRequest<unknown>(path, {
    method: "GET",
    token,
  });

  const data = asObj(response).data;
  if (!Array.isArray(data)) return [];
  return data.map(mapDataItem).filter((item): item is BackendPlan => !!item);
};
