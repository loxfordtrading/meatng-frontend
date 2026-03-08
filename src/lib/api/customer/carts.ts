import { apiRequest } from "@/lib/api/client";

export interface CartItemInput {
  email: string;
  planId: string;
  productId: string;
  quantity: number;
}

export const getMyCart = async (token?: string | null): Promise<unknown> => {
  return apiRequest<unknown>("/carts/my-cart", {
    method: "GET",
    token,
  });
};

export const addCartItem = async (
  { email, planId, productId, quantity }: CartItemInput,
  token?: string | null,
): Promise<unknown> => {
  return apiRequest<unknown>("/carts/items", {
    method: "POST",
    token,
    body: {
      email,
      planId,
      productId,
      quantity,
    },
  });
};

export const clearCart = async (token?: string | null): Promise<void> => {
  await apiRequest<unknown>("/carts", {
    method: "DELETE",
    token,
  });
};
