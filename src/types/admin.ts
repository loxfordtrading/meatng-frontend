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

export type StatsSummary = {
  total_revenue: number;
  active_subscriptions: number;
  pending_orders: number;
  total_customers: number;
  avg_order_value: number;
  churn_rate: number;
};

export type RevenueMomentum = {
  month: string;
  month_key: string;
  revenue: number;
};

export type PlanDistribution = {
  plan_id: string;
  plan_name: string;
  count: number;
  percentage: number;
};

export type TopProduct = {
  product_id: string;
  product_name: string;
  quantity: number;
  order_count: number;
};

export type MostPurchasedPlan = {
  plan_id: string;
  plan_name: string;
  count: number;
  percentage: number;
};

export type StatisticsType = {
  summary: StatsSummary;

  charts: {
    revenue_momentum: RevenueMomentum[];
    plan_distribution: PlanDistribution[];
    top_products: TopProduct[];
  };

  insights: {
    most_purchased_plan: MostPurchasedPlan;
    most_purchased_plans: MostPurchasedPlan[];
  };
};

export interface CustomerType {
  id: string;
  email: string;
  role: string;
  is_active: boolean;
  is_email_verified: boolean,
  is_deleted: boolean;
  display_name: string;
  first_name: string;
  phone: string;
  last_name: string;
  createdAt: Date;
  updatedAt: Date;
}

type CategoryRule = {
  category_id: string;
  category_name?: string;
  label: string;
  weight_required?: number;
  weight_unit: "g" | "kg";
  min_items?: number;
  max_items?: number;
};

type ProductRule = {
  product_id: string;
  product_name: string;
  label: string;
  max_weight: number;
  weight_unit: string;
};

type PrefilledItem = {
  product_id: string;
  name: string;
  quantity: number;
  image?: string;
  weight: number;
  weight_unit: string;
};

export type PlanType = {
  id: string;
  name: string;
  description: string;
  price: number;
  max_items: number;
  weight: number;
  weight_unit: string;
  is_active: boolean;
  plan_type: string;
  pricing_model: string;

  category_rules: CategoryRule[];
  product_rules: ProductRule[];
  prefilled_items: PrefilledItem[];

  image: string;
  image_public_id: string;

  total_weight: number;
  prefilled_items_total_weight: number;
  remaining_weight: number;

  createdAt: string;
  updatedAt: string;

  link: string;
};

export type CreatePlanType = {
  name: string;
  description: string;
  price: number;
  max_items: number;
  weight: number;
  weight_unit: "g" | "kg";
  temp_image_id?: string;
  is_active: boolean;
  plan_type: "standard" | "custom";
  pricing_model: "fixed" | "⁠⁠sum_of_items";
  category_rules: CategoryRule[];
  product_rules: ProductRule[];
  prefilled_items: PrefilledItem[];
};
