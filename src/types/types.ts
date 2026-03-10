export type FormattedSubscription = {
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