export type FormattedSubscriptionType = {
  id: string;
  userId: string;
  planId: string;
  status: string;
  frequency: number;
  startDate: string;
  nextDeliveryDate: string;
  nextBillingAt: string;
  autoDebitEnabled: boolean;
  lockedForBilling: boolean;
  nextCutoffAt: string;
  items: {
    product_id: {
      _id: string;
      name: string;
      slug: string;
      mainValue: number;
      unit: string;
      formattedWeight: string;
      id: string;
    };
    quantity: number;
    item_type: string;
  }[];
  plan: {
    id: string;
    name: string;
    description: string;
    price: number;
    weight: number;
    weight_unit: string;
    is_active: boolean;
  };
};

export type FormattedOrderType = {
  id: string;
  userId: string;
  planId: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;

  items: {
    productId: string;
    name: string;
    unitPrice: number;
    quantity: number;
    itemType: string;
    isPrefilled: boolean;
  }[];

  plan: {
    id: string;
    name: string;
    maxItems: number;
  };
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
