import { apiRequest } from "@/lib/api/client";

export type OrderStatus = "pending" | "paid" | "processing" | "shipped" | "in_transit" | "delivered" | "cancelled";

export interface CustomerOrder {
  id: string;
  status: OrderStatus;
  totalAmount: number;
  itemsCount: number;
  createdAt: string;
  reference?: string;
  planName?: string;
}

function parseOrderList(response: unknown): CustomerOrder[] {
  const res = response as Record<string, unknown> | null;
  if (!res) return [];

  // JSON:API array format
  const dataArr = Array.isArray(res.data) ? res.data : res.data ? [res.data] : [];
  return (dataArr as Record<string, unknown>[]).map((item) => {
    const attrs = (item.attributes || {}) as Record<string, unknown>;
    const items = Array.isArray(attrs.items) ? attrs.items : [];
    return {
      id: (item.id || attrs.id || "") as string,
      status: ((attrs.status || "pending") as string).toLowerCase() as OrderStatus,
      totalAmount: Number(attrs.total_amount ?? attrs.totalAmount ?? 0),
      itemsCount: items.length || Number(attrs.items_count ?? attrs.itemsCount ?? 0),
      createdAt: (attrs.createdAt || attrs.created_at || "") as string,
      reference: (attrs.reference || "") as string,
      planName: (attrs.plan_name || attrs.planName || "") as string,
    };
  });
}

export const listMyOrders = async (token?: string | null): Promise<CustomerOrder[]> => {
  const response = await apiRequest<unknown>("/orders/my-orders", {
    method: "GET",
    token,
  });
  return parseOrderList(response);
};

export interface CustomerOrderItemInput {
  product_id: string;
  name: string;
  quantity: number;
  unit_price: number;
  item_type?: "base" | "addon";
}

export interface CreateCustomerOrderInput {
  user_id: string;
  items: CustomerOrderItemInput[];
  total_amount: number;
  status?: "pending" | "paid" | "shipped" | "delivered" | "cancelled";
  plan_id?: string;
  subscription_id?: string;
}

export const createCustomerOrder = async (
  input: CreateCustomerOrderInput,
  token?: string | null,
): Promise<unknown> => {
  return apiRequest<unknown>("/orders", {
    method: "POST",
    token,
    body: input,
  });
};
