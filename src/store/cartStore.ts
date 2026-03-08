import { create } from "zustand";
import { persist } from "zustand/middleware";

type CartItem = {
  id: string;
  name: string;
  price: number;
  image: string;
  weight: number;
  weight_unit: string;
  category: string;
  qty: number;
};

type CartState = {
  items: CartItem[];
  maxItems: number;

  setMaxItems: (value: number) => void;

  add: (product: any, qty?: number) => void;
  setQty: (product: any, qty: number) => void;
  remove: (id: string) => void;
  clearCart: () => void;

  totalItems: () => number;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      maxItems: 0,

      setMaxItems: (value) => set({ maxItems: value }),

      add: (product, qty = 1) => {
        const items = get().items;

        const existing = items.find((i) => i.id === product.id);

        if (existing) {
          set({
            items: items.map((i) =>
              i.id === product.id ? { ...i, qty: i.qty + qty } : i
            ),
          });
        } else {
          set({
            items: [
              ...items,
              {
                ...product,
                qty,
              },
            ],
          });
        }
      },

      setQty: (product, qty) => {
        if (qty <= 0) {
          set({
            items: get().items.filter((i) => i.id !== product.id),
          });
          return;
        }

        set({
          items: get().items.map((i) =>
            i.id === product.id ? { ...i, qty } : i
          ),
        });
      },

      remove: (id) =>
        set({
          items: get().items.filter((i) => i.id !== id),
        }),

      clearCart: () => set({ items: [] }),

      totalItems: () =>
        get().items.reduce((acc, item) => acc + item.qty, 0),
    }),
    {
      name: "cart",
    }
  )
);