import { apiRequest } from "@/lib/api/client";
import { mapJsonApiItem, mapJsonApiList } from "./jsonApi";

export interface ProductCategory {
  id: string;
  name?: string;
  slug?: string;
  description?: string;
  parentId?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  raw?: Record<string, unknown>;
}

export interface ProductCategoryInput {
  name?: string;
  slug?: string;
  description?: string;
  parentId?: string;
  isActive?: boolean;
}

const asString = (value: unknown): string | undefined =>
  typeof value === "string" && value.length > 0 ? value : undefined;
const asBoolean = (value: unknown): boolean | undefined =>
  typeof value === "boolean" ? value : undefined;

const mapCategory = (payload: unknown): ProductCategory => {
  const { id, attributes } = mapJsonApiItem(payload);
  return {
    id,
    name: asString(attributes.name),
    slug: asString(attributes.slug),
    description: asString(attributes.description),
    parentId: asString(attributes.parent_id || attributes.parentId),
    isActive: asBoolean(attributes.is_active ?? attributes.isActive),
    createdAt: asString(attributes.createdAt),
    updatedAt: asString(attributes.updatedAt),
    raw: attributes,
  };
};

const buildBody = (input: ProductCategoryInput): Record<string, unknown> => {
  const body: Record<string, unknown> = {};
  if (input.name) body.name = input.name;
  if (input.slug) body.slug = input.slug;
  if (input.description) body.description = input.description;
  if (input.parentId) body.parent_id = input.parentId;
  if (typeof input.isActive === "boolean") body.is_active = input.isActive;
  return body;
};

export const listProductCategories = async (
  token?: string | null,
  params?: Record<string, string | number | boolean>,
): Promise<ProductCategory[]> => {
  const query = params ? `?${new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)]))}` : "";
  const response = await apiRequest<unknown>(`/product-categories${query}`, {
    method: "GET",
    token,
  });
  return mapJsonApiList(response).map(mapCategory);
};

export const getRootProductCategories = async (token?: string | null): Promise<ProductCategory[]> => {
  const response = await apiRequest<unknown>("/product-categories/root", {
    method: "GET",
    token,
  });
  return mapJsonApiList(response).map(mapCategory);
};

export const getProductCategoryById = async (
  id: string,
  token?: string | null,
): Promise<ProductCategory> => {
  const response = await apiRequest<unknown>(`/product-categories/${id}`, {
    method: "GET",
    token,
  });
  return mapCategory(response);
};

export const createProductCategory = async (
  input: ProductCategoryInput,
  token?: string | null,
): Promise<ProductCategory> => {
  const response = await apiRequest<unknown>("/product-categories", {
    method: "POST",
    body: buildBody(input),
    token,
  });
  return mapCategory(response);
};

export const updateProductCategory = async (
  id: string,
  input: ProductCategoryInput,
  token?: string | null,
): Promise<ProductCategory> => {
  const response = await apiRequest<unknown>(`/product-categories/${id}`, {
    method: "PUT",
    body: buildBody(input),
    token,
  });
  return mapCategory(response);
};

export const deleteProductCategory = async (id: string, token?: string | null): Promise<void> => {
  await apiRequest<unknown>(`/product-categories/${id}`, {
    method: "DELETE",
    token,
  });
};
