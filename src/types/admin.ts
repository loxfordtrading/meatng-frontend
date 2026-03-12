export type OrderStatus =
  | "Processing"
  | "In Transit"
  | "Delivered"
  | "Cancelled";

export type OrderType = {
  id: string;

  user_id: string;
  plan_id: string;

  items: {
    product_id: string;
    name: string;
    unit_price: number;
    quantity: number;
    item_type: "base" | "addon";
    is_prefilled: boolean;
  }[];

  total_amount: number;

  status: OrderStatus;

  subscriptionDetails: unknown | null;
  subscriptionCycleDetails: unknown | null;

  createdAt: string;
  updatedAt: string;

  user: {
    email: string;
    display_name: string;
    first_name: string;
    last_name: string;
  } | null;

  plan: {
    name: string;
    max_items: number;
    total_weight: number | null;
    prefilled_items_total_weight: number;
    remaining_weight: number | null;
  } | null;
};

export type OrdersMetaType = {
  total: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
};

export type ProductType = {
  id: string;

  name: string;
  nameSlug: string;
  description: string;

  image: string;

  status: string;
  isActive: boolean;
  sku: string;

  isBestSelling: boolean;
  displayType: string;

  price: number;

  weight: number;
  weight_unit: string;
  formatted_weight: string;

  categoryId: string;
  category: string;
  categorySlug: string;

  stock: number;
};

export type paginationType = {
    total: number,
    totalPages:number,
    currentPage:number,
    pageSize: number
}