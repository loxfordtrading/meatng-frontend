import { apiRequest } from "@/lib/api/client";
import { mapJsonApiItem, mapJsonApiList } from "./jsonApi";

export interface Product {
  id: string;
  name?: string;
  sku?: string;
  description?: string;
  price?: number;
  stock?: number;
  isActive?: boolean;
  categoryIds?: string[];
  images?: string[];
  createdAt?: string;
  updatedAt?: string;
  raw?: Record<string, unknown>;
}

export interface ProductInput {
  name?: string;
  sku?: string;
  description?: string;
  price?: number;
  stock?: number;
  isActive?: boolean;
  categoryIds?: string[];
  images?: string[];
}

const asString = (value: unknown): string | undefined =>
  typeof value === "string" && value.length > 0 ? value : undefined;
const asNumber = (value: unknown): number | undefined =>
  typeof value === "number" && !Number.isNaN(value) ? value : undefined;
const asBoolean = (value: unknown): boolean | undefined =>
  typeof value === "boolean" ? value : undefined;
const asStringArray = (value: unknown): string[] | undefined =>
  Array.isArray(value) ? value.filter((item) => typeof item === "string") : undefined;

const mapProduct = (payload: unknown): Product => {
  const { id, attributes } = mapJsonApiItem(payload);
  return {
    id,
    name: asString(attributes.name),
    sku: asString(attributes.sku),
    description: asString(attributes.description),
    price: asNumber(attributes.price),
    stock: asNumber(attributes.stock),
    isActive: asBoolean(attributes.is_active ?? attributes.isActive),
    categoryIds: asStringArray(attributes.category_ids || attributes.categoryIds),
    images: asStringArray(attributes.images),
    createdAt: asString(attributes.createdAt),
    updatedAt: asString(attributes.updatedAt),
    raw: attributes,
  };
};

const buildBody = (input: ProductInput): Record<string, unknown> => {
  const body: Record<string, unknown> = {};
  if (input.name) body.name = input.name;
  if (input.sku) body.sku = input.sku;
  if (input.description) body.description = input.description;
  if (typeof input.price === "number") body.price = input.price;
  if (typeof input.stock === "number") body.stock = input.stock;
  if (typeof input.isActive === "boolean") body.is_active = input.isActive;
  if (input.categoryIds) body.category_ids = input.categoryIds;
  if (input.images) body.images = input.images;
  return body;
};

export const listProducts = async (
  token?: string | null,
  params?: Record<string, string | number | boolean>,
): Promise<Product[]> => {
  const query = params ? `?${new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)]))}` : "";
  const response = await apiRequest<unknown>(`/products${query}`, {
    method: "GET",
    token,
  });
  return mapJsonApiList(response).map(mapProduct);
};

export const getProductById = async (id: string, token?: string | null): Promise<Product> => {
  const response = await apiRequest<unknown>(`/products/${id}`, {
    method: "GET",
    token,
  });
  return mapProduct(response);
};

export const createProduct = async (input: ProductInput, token?: string | null): Promise<Product> => {
  const response = await apiRequest<unknown>("/products", {
    method: "POST",
    body: buildBody(input),
    token,
  });
  return mapProduct(response);
};

export const updateProduct = async (
  id: string,
  input: ProductInput,
  token?: string | null,
): Promise<Product> => {
  const response = await apiRequest<unknown>(`/products/${id}`, {
    method: "PUT",
    body: buildBody(input),
    token,
  });
  return mapProduct(response);
};

export const deleteProduct = async (id: string, token?: string | null): Promise<void> => {
  await apiRequest<unknown>(`/products/${id}`, {
    method: "DELETE",
    token,
  });
};

export const addCategoryToProduct = async (
  id: string,
  categoryId: string,
  token?: string | null,
): Promise<Product> => {
  const response = await apiRequest<unknown>(`/products/${id}/categories/${categoryId}`, {
    method: "POST",
    token,
  });
  return mapProduct(response);
};

export const removeCategoryFromProduct = async (
  id: string,
  categoryId: string,
  token?: string | null,
): Promise<Product> => {
  const response = await apiRequest<unknown>(`/products/${id}/categories/${categoryId}`, {
    method: "DELETE",
    token,
  });
  return mapProduct(response);
};

export const updateProductStock = async (
  id: string,
  stock: number,
  token?: string | null,
): Promise<Product> => {
  const response = await apiRequest<unknown>(`/products/${id}/stock`, {
    method: "PUT",
    body: { stock },
    token,
  });
  return mapProduct(response);
};
