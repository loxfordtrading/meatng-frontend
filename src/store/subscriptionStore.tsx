import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CategoryRule = {
  category_id: string;
  label: string;
  min_items: number;
  max_items: number;
}

export type PlanAttributes = {
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
  prefilled_items: any[];
  image: string;
  image_public_id: string;
  createdAt: string;
  updatedAt: string;
}

export type Plan = {
  type: "plans";
  id: string;
  attributes: PlanAttributes;
  links: {
    self: string;
  };
}

type SubscriptionInfo = {
  subscription: Plan;
  selectedFrequency: string;
};

type SubscriptionStore = {
  subInfo: SubscriptionInfo | null;
  setSubInfo: (info: SubscriptionInfo) => void;
  clearSubInfo: () => void;
};

const defaultSubInfo: SubscriptionInfo = {
  subscription: null,
  selectedFrequency: "",
};

export const useSubscriptionStore = create<SubscriptionStore>()(
  persist(
    (set) => ({
      subInfo: defaultSubInfo,
      setSubInfo: (info) => set({ subInfo: info }),
      clearSubInfo: () => set({ subInfo: defaultSubInfo }),
    }),
    {
      name: "subscription",
    }
  )
);