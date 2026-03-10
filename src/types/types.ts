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
    product_id: string;
    quantity: number;
    item_type: string;
  }[];
  plan: {
    id: string;
    name: string;
    description: string;
    price: number;
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