// import { toGrams } from "@/utils/conversion";
// import { create } from "zustand";
// import { persist } from "zustand/middleware";
// import { useSubscriptionStore } from "./subscriptionStore";

// type CartItem = {
//   id: string;
//   name: string;
//   price: number;
//   image: string;
//   weight: number;
//   weight_unit: string;
//   category: string;
//   qty: number;
//   item_type: "base";
//   gram_weight: number;
// };

// type CartState = {
//   items: CartItem[];
//   maxItems: number;

//   setMaxItems: (value: number) => void;

//   add: (product: any, qty?: number, item_type?: "base" | "addon") => void;
//   setQty: (product: any, qty: number) => void;
//   remove: (id: string) => void;
//   clearCart: () => void;

//   totalItems: () => number;
//   totalGramWeight: () => number;
// };

// export const useCartStore = create<CartState>()(
//   persist(
//     (set, get) => ({
//       items: [],
//       maxItems: 0,

//       setMaxItems: (value) => set({ maxItems: value }),
      
//       add: (product, qty = 1, item_type = "base") => {
//         const subInfo = useSubscriptionStore.getState().subInfo;
//         const max_gram = toGrams(subInfo?.subscription?.attributes?.weight,subInfo?.subscription?.attributes?.weight_unit as "kg" | "g")

//         const productWeightG = toGrams(product.weight,product.weight_unit)

//         if((get().totalGramWeight() === max_gram) || ((get().totalGramWeight() + productWeightG) > max_gram)){
//           return;
//         }

//         if((get().totalItems() == subInfo?.subscription?.attributes?.max_items)){
//           return;
//         }

//         const items = get().items;


//         const existing = items.find(
//           (i) => i.id === product.id && i.item_type === item_type
//         );

//         if (existing) {
//           set({
//             items: items.map((i) =>
//               i.id === product.id && i.item_type === item_type
//                 ? { ...i, qty: i.qty + qty }
//                 : i
//             ),
//           });
//         } else {
//           set({
//             items: [
//               ...items,
//               {
//                 ...product,
//                 qty,
//                 item_type,
//                 gram_weight: productWeightG 
//               },
//             ],
//           });
//         }
//       },

//       setQty: (product, qty) => {
//         const { subInfo } = useSubscriptionStore.getState();

//         const max_gram = toGrams(
//           subInfo?.subscription?.attributes?.weight,
//           subInfo?.subscription?.attributes?.weight_unit as "kg" | "g"
//         );

//         const productWeightG = toGrams(product.weight, product.weight_unit);

//         if (qty <= 0) {
//           set({
//             items: get().items.filter((i) => i.id !== product.id),
//           });
//           return;
//         }

//         const items = get().items;

//         const currentItem = items.find((i) => i.id === product.id);

//         const currentItemWeight = currentItem
//           ? currentItem.gram_weight * currentItem.qty
//           : 0;

//         const newItemWeight = productWeightG * qty;

//         const newTotalWeight =
//           get().totalGramWeight() - currentItemWeight + newItemWeight;

//         if (newTotalWeight > max_gram) {
//           return;
//         }

//         set({
//           items: items.map((i) =>
//             i.id === product.id ? { ...i, qty } : i
//           ),
//         });
//       },
//       remove: (id) =>
//         set({
//           items: get().items.filter((i) => i.id !== id),
//         }),

//       clearCart: () => set({ items: [] }),

//       totalItems: () =>
//         get().items.reduce((acc, item) => acc + item.qty, 0),

//       totalGramWeight: () =>
//         get().items.reduce(
//           (acc, item) => acc + item.gram_weight * item.qty,
//           0
//         ),
//     }),
//     {
//       name: "cart",
//     }
//   )
// );

import { toGrams } from "@/utils/conversion";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useSubscriptionStore } from "./subscriptionStore";

type CartItem = {
  id: string;
  name: string;
  price: number;
  image: string;
  weight: number;
  weight_unit: string;
  category: string;
  qty: number;
  item_type: "base";
  gram_weight: number;
};

type CartState = {
  items: CartItem[];
  maxItems: number;

  setMaxItems: (value: number) => void;

  add: (product: any, qty?: number, item_type?: "base" | "addon") => void;
  setQty: (product: any, qty: number) => void;
  remove: (id: string) => void;
  clearCart: () => void;

  totalItems: () => number;
  totalGramWeight: () => number;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      maxItems: 0,

      setMaxItems: (value) => set({ maxItems: value }),

      // helpers
      getCategoryWeight: (categoryId: string) => {
        return get().items
          .filter((i) => i.category === categoryId)
          .reduce((acc, item) => acc + item.gram_weight * item.qty, 0);
      },

      getProductWeight: (productId: string) => {
        return get().items
          .filter((i) => i.id === productId)
          .reduce((acc, item) => acc + item.gram_weight * item.qty, 0);
      },

      add: (product, qty = 1, item_type = "base") => {
        const subInfo = useSubscriptionStore.getState().subInfo;

        const max_gram = toGrams(
          subInfo?.subscription?.attributes?.weight,
          subInfo?.subscription?.attributes?.weight_unit as "kg" | "g"
        );

        const productWeightG = toGrams(product.weight, product.weight_unit);

        // subscription weight validation
        if (
          get().totalGramWeight() === max_gram ||
          get().totalGramWeight() + productWeightG > max_gram
        ) {
          return;
        }

        // max items validation
        if (
          get().totalItems() ===
          subInfo?.subscription?.attributes?.max_items
        ) {
          return;
        }

        const items = get().items;

        const getProductWeight = (productId: string) => {
          return items
            .filter((i) => i.id === productId)
            .reduce((acc, item) => acc + item.gram_weight * item.qty, 0);
        };

        const getCategoryWeight = (categoryId: string) => {
          return items
            .filter((i) => i.category === categoryId)
            .reduce((acc, item) => acc + item.gram_weight * item.qty, 0);
        };

        // PRODUCT RULE VALIDATION
        const productRule = subInfo?.subscription?.attributes?.product_rules?.find(
          (rule: any) => rule.product_id === product.id
        );

        if (productRule) {
          const maxWeight = toGrams(
            productRule.max_weight,
            productRule.weight_unit
          );

          const existingWeight = getProductWeight(product.id);

          if (existingWeight + productWeightG > maxWeight) {
            return;
          }
        }

        // CATEGORY RULE VALIDATION
        const categoryRule = subInfo?.subscription?.attributes?.category_rules?.find(
          (rule: any) => rule.category_id === product.categoryId
        );

        if (categoryRule) {
          const maxCategoryWeight = toGrams(
            categoryRule.weight_required,
            categoryRule.weight_unit
          );

          const existingCategoryWeight = getCategoryWeight(product.category);

          if (existingCategoryWeight + productWeightG > maxCategoryWeight) {
            return;
          }
        }

        const existing = items.find(
          (i) => i.id === product.id && i.item_type === item_type
        );

        if (existing) {
          set({
            items: items.map((i) =>
              i.id === product.id && i.item_type === item_type
                ? { ...i, qty: i.qty + qty }
                : i
            ),
          });
        } else {
          set({
            items: [
              ...items,
              {
                ...product,
                qty,
                item_type,
                gram_weight: productWeightG,
              },
            ],
          });
        }
      },

      setQty: (product, qty) => {
        const { subInfo } = useSubscriptionStore.getState();

        const max_gram = toGrams(
          subInfo?.subscription?.attributes?.weight,
          subInfo?.subscription?.attributes?.weight_unit as "kg" | "g"
        );

        const productWeightG = toGrams(product.weight, product.weight_unit);

        if (qty <= 0) {
          set({
            items: get().items.filter((i) => i.id !== product.id),
          });
          return;
        }

        const items = get().items;

        const currentItem = items.find((i) => i.id === product.id);

        const currentItemWeight = currentItem
          ? currentItem.gram_weight * currentItem.qty
          : 0;

        const newItemWeight = productWeightG * qty;

        const newTotalWeight =
          get().totalGramWeight() - currentItemWeight + newItemWeight;

        if (newTotalWeight > max_gram) {
          return;
        }

        set({
          items: items.map((i) =>
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

      totalGramWeight: () =>
        get().items.reduce(
          (acc, item) => acc + item.gram_weight * item.qty,
          0
        ),
    }),
    {
      name: "cart",
    }
  )
);