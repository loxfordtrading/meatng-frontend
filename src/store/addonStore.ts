import { toGrams } from "@/utils/conversion";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type AddonItem = {
  id: string;
  name: string;
  price: number;
  image: string;
  weight: number;
  weight_unit: string;
  category: string;
  qty: number;
  item_type: "addon";
};

type AddonState = {
  addonItems: AddonItem[];
  maxAddonItems: number;

  setMaxAddonItems: (value: number) => void;

  addAddon: (product: any, qty?: number, item_type?: "base" | "addon") => void;
  setAddonQty: (product: any, qty: number) => void;
  removeAddon: (id: string) => void;
  clearAddon: () => void;

  totalAddonItems: () => number;
  totalAddonPrice: () => number;
};

export const useAddonStore = create<AddonState>()(
  persist(
    (set, get) => ({
      addonItems: [],
      maxAddonItems: 0,

      setMaxAddonItems: (value) => set({ maxAddonItems: value }),

      addAddon: (product, qty = 1, item_type = "base") => {
        const items = get().addonItems;

        const existing = items.find(
          (i) => i.id === product.id && i.item_type === item_type
        );

        if (existing) {
          set({
            addonItems: items.map((i) =>
              i.id === product.id && i.item_type === item_type
                ? { ...i, qty: i.qty + qty }
                : i
            ),
          });
        } else {
          set({
            addonItems: [
              ...items,
              {
                ...product,
                qty,
                item_type
              },
            ],
          });
        }
      },

      setAddonQty: (product, qty) => {
        if (qty <= 0) {
          set({
            addonItems: get().addonItems.filter((i) => i.id !== product.id),
          });
          return;
        }

        set({
          addonItems: get().addonItems.map((i) =>
            i.id === product.id ? { ...i, qty } : i
          ),
        });
      },

      removeAddon: (id) =>
        set({
          addonItems: get().addonItems.filter((i) => i.id !== id),
        }),

      clearAddon: () => set({ addonItems: [] }),

      totalAddonItems: () =>
        get().addonItems.reduce((acc, item) => acc + item.qty, 0),

      totalAddonPrice: () =>
        get().addonItems.reduce(
          (acc, item) => acc + item.price * item.qty,
          0
        ),
    }),
    {
      name: "cart-addon",
    }
  )
);