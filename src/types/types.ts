export type FormattedSubscriptionType = {
  id: string;
  user_id: string;
  plan_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  plan_name: string;
  box_weight: string;
  frequency: number;
  monthly_value: number;
  next_billing_at: Date;
  status: string;
};

export type FormattedOrderType = {
  id: string;

  user_id: string;
  plan_id: string;
  gift_box_id: string;

  items: {
    product_id: string;
    name: string;
    unit_price: number;
    image_url: string;
    quantity: number;
    item_type: "base" | "addon";
    is_prefilled: boolean;
    weight?: number;
    weight_unit?: "kg" | "g";
  }[];

  delivery_address_snapshot?: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    address_type: "shipping" | "billing";
    label: string;
    street_address: string;
    apartment_suite: string;
    city: string;
    state: string;
    zip_code: string;
    country: string;
    latitude: number;
    longitude: number;
  };

  delivery_note: string;
  is_gift: boolean;
  warehouse_id: string;
  delivery_distance_km: number;
  delivery_fee: number;
  order_type: "plan" | "gift";
  planDetails: null | Record<string, any>;

  total_amount: number;

  status: string;

  subscriptionDetails: unknown | null;
  subscriptionCycleDetails: unknown | null;

  delivery_date: Date;
  delivery_window_label: string;

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

  giftBoxDetails: {
    name: string;
    price: number;
    is_active: boolean;
    image: string;
  } | null,
  
  giftFormDetails: {
    sender_name: string;
    sender_email: string;
    recipient_email: string;
    recipient_name: string;
    recipient_phone: string;
    occasion: string;
    message: string;

    delivery_date: Date;
    delivery_window_label: string;

    status: "pending" | "purchased" | "delivered";

    order_id: string;
  } | null
};

export type AddressType = {
  type: "addresss";
  id: string;
  attributes: {
    user_id: string;
    address_type: "shipping" | "billing";
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    label: string;
    street_address: string;
    apartment_suite: string;
    city: string;
    state: string;
    zip_code: string;
    country: string;
    is_default: boolean;
    createdAt: string;
    updatedAt: string;
  };
  links: {
    self: string;
  };
};

export interface OrderItem {
  product_id: string;
  name: string;
  unit_price: number;
  quantity: number;
  item_type: "base" | "addon";
  is_prefilled: boolean;
}

export interface UserDetails {
  email: string;
  display_name: string;
  first_name: string;
  last_name: string;
}

export interface PlanDetails {
  name: string;
  max_items: number;
  total_weight: number | null;
  prefilled_items_total_weight: number;
  remaining_weight: number | null;
}

export interface OrderAttributes {
  user_id: string;
  plan_id: string;
  items: OrderItem[];
  total_amount: number;
  status: "pending" | "paid" | "failed";
  createdAt: string;
  updatedAt: string;
}

export interface OrderRelationships {
  userDetails: {
    data: {
      id: string;
      attributes: UserDetails;
    };
  };
  planDetails: {
    data: {
      id: string;
      attributes: PlanDetails;
    };
  };
}

export interface OrderType {
  id: string;
  attributes: OrderAttributes;
  relationships: OrderRelationships;
}

export type GiftboxProduct = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

export type GiftboxType = {
  id: string;
  name: string;
  description: string;
  price: number;
  is_active: boolean;
  weight: number;
  weight_unit: "g" | "kg";
  image: string;
  createdAt: string;
  updatedAt: string;

  products: {
    id: string;
    name: string;
    price: number;
    weight: number;
    weight_unit: "g" | "kg";
    formatted_weight: string;
    description: string;
    is_active: boolean;
    quantity: number;
    new_weight: number;
    new_weight_unit: "g" | "kg";
  }[];
};

export type OrderMetaType = {
  total: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export type SummaryType = {
  churn_rate: number;
  active_subscriptions: number;
  avg_monthly_subscription: number;
}

export type MetaType = {
  total: number;
  summary: SummaryType;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}
