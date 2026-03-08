import { apiRequest } from "@/lib/api/client";
import { mapJsonApiItem, mapJsonApiList } from "./jsonApi";

export interface OrderLineItem {
  name: string;
  category?: string;
  weightG: number;
  quantity: number;
  price?: number;
  type: "mandatory" | "offal-pick" | "build-pick" | "add-on";
}

export interface Order {
  id: string;
  status?: string;
  total?: number;
  currency?: string;
  customerId?: string;
  planName?: string;
  planWeightKg?: number;
  lineItems?: OrderLineItem[];
  createdAt?: string;
  updatedAt?: string;
  raw?: Record<string, unknown>;
}

export interface OrderInput {
  status?: string;
  total?: number;
  currency?: string;
  customerId?: string;
}

const asString = (value: unknown): string | undefined =>
  typeof value === "string" && value.length > 0 ? value : undefined;
const asNumber = (value: unknown): number | undefined =>
  typeof value === "number" && !Number.isNaN(value) ? value : undefined;

const mapOrder = (payload: unknown): Order => {
  const { id, attributes } = mapJsonApiItem(payload);
  return {
    id,
    status: asString(attributes.status),
    total: asNumber(attributes.total),
    currency: asString(attributes.currency),
    customerId: asString(attributes.customer_id || attributes.customerId || attributes.user_id),
    planName: asString(attributes.plan_name ?? attributes.planName ?? attributes.plan),
    planWeightKg: asNumber(attributes.plan_weight_kg ?? attributes.planWeightKg),
    lineItems: Array.isArray(attributes.line_items ?? attributes.lineItems)
      ? ((attributes.line_items ?? attributes.lineItems) as OrderLineItem[])
      : undefined,
    createdAt: asString(attributes.createdAt),
    updatedAt: asString(attributes.updatedAt),
    raw: attributes,
  };
};

const buildBody = (input: OrderInput): Record<string, unknown> => {
  const body: Record<string, unknown> = {};
  if (input.status) body.status = input.status;
  if (typeof input.total === "number") body.total = input.total;
  if (input.currency) body.currency = input.currency;
  if (input.customerId) body.customer_id = input.customerId;
  return body;
};

export const listOrders = async (
  token?: string | null,
  params?: Record<string, string | number | boolean>,
): Promise<Order[]> => {
  const query = params ? `?${new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)]))}` : "";
  const response = await apiRequest<unknown>(`/orders${query}`, {
    method: "GET",
    token,
  });
  return mapJsonApiList(response).map(mapOrder);
};

export const getOrderById = async (id: string, token?: string | null): Promise<Order> => {
  const response = await apiRequest<unknown>(`/orders/${id}`, {
    method: "GET",
    token,
  });
  return mapOrder(response);
};

export const createOrder = async (input: OrderInput, token?: string | null): Promise<Order> => {
  const response = await apiRequest<unknown>("/orders", {
    method: "POST",
    body: buildBody(input),
    token,
  });
  return mapOrder(response);
};

export const updateOrderStatus = async (
  id: string,
  status: string,
  token?: string | null,
): Promise<Order> => {
  const response = await apiRequest<unknown>(`/orders/${id}`, {
    method: "PATCH",
    body: { status },
    token,
  });
  return mapOrder(response);
};
