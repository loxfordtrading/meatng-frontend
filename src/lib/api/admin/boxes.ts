import { apiRequest } from "@/lib/api/client";
import { mapJsonApiItem, mapJsonApiList } from "./jsonApi";

export interface BoxItem {
  name: string;
  category: string;
  weightG: number;
  price: number;
  quantity: number;
  type: "mandatory" | "offal-pick" | "build-pick" | "add-on";
}

export interface Box {
  id: string;
  name?: string;
  description?: string;
  isActive?: boolean;
  price?: number;
  weightKg?: number;
  planTier?: string;
  items?: BoxItem[];
  createdAt?: string;
  updatedAt?: string;
  raw?: Record<string, unknown>;
}

export interface BoxInput {
  name?: string;
  description?: string;
  isActive?: boolean;
  price?: number;
  weightKg?: number;
  planTier?: string;
  items?: BoxItem[];
}

const asString = (value: unknown): string | undefined =>
  typeof value === "string" && value.length > 0 ? value : undefined;
const asNumber = (value: unknown): number | undefined =>
  typeof value === "number" && !Number.isNaN(value) ? value : undefined;
const asBoolean = (value: unknown): boolean | undefined =>
  typeof value === "boolean" ? value : undefined;

const mapBox = (payload: unknown): Box => {
  const { id, attributes } = mapJsonApiItem(payload);
  return {
    id,
    name: asString(attributes.name),
    description: asString(attributes.description),
    isActive: asBoolean(attributes.is_active ?? attributes.isActive),
    price: asNumber(attributes.price),
    weightKg: asNumber(attributes.weight_kg ?? attributes.weightKg),
    planTier: asString(attributes.plan_tier ?? attributes.planTier),
    items: Array.isArray(attributes.items) ? (attributes.items as BoxItem[]) : undefined,
    createdAt: asString(attributes.createdAt),
    updatedAt: asString(attributes.updatedAt),
    raw: attributes,
  };
};

const buildBody = (input: BoxInput): Record<string, unknown> => {
  const body: Record<string, unknown> = {};
  if (input.name) body.name = input.name;
  if (input.description) body.description = input.description;
  if (typeof input.isActive === "boolean") body.is_active = input.isActive;
  if (typeof input.price === "number") body.price = input.price;
  if (typeof input.weightKg === "number") body.weight_kg = input.weightKg;
  if (input.planTier) body.plan_tier = input.planTier;
  if (Array.isArray(input.items)) body.items = input.items;
  return body;
};

export const listBoxes = async (token?: string | null): Promise<Box[]> => {
  const response = await apiRequest<unknown>("/boxes", {
    method: "GET",
    token,
  });
  return mapJsonApiList(response).map(mapBox);
};

export const listActiveBoxes = async (token?: string | null): Promise<Box[]> => {
  const response = await apiRequest<unknown>("/boxes/active", {
    method: "GET",
    token,
  });
  return mapJsonApiList(response).map(mapBox);
};

export const getBoxById = async (id: string, token?: string | null): Promise<Box> => {
  const response = await apiRequest<unknown>(`/boxes/${id}`, {
    method: "GET",
    token,
  });
  return mapBox(response);
};

export const createBox = async (input: BoxInput, token?: string | null): Promise<Box> => {
  const response = await apiRequest<unknown>("/boxes", {
    method: "POST",
    body: buildBody(input),
    token,
  });
  return mapBox(response);
};

export const updateBox = async (id: string, input: BoxInput, token?: string | null): Promise<Box> => {
  const response = await apiRequest<unknown>(`/boxes/${id}`, {
    method: "PUT",
    body: buildBody(input),
    token,
  });
  return mapBox(response);
};

export const deleteBox = async (id: string, token?: string | null): Promise<void> => {
  await apiRequest<unknown>(`/boxes/${id}`, {
    method: "DELETE",
    token,
  });
};
