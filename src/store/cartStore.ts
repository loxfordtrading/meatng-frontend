import { formatWeight, toGrams } from "@/utils/conversion";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useSubscriptionStore } from "./subscriptionStore";
import { toast } from "react-toastify";
import { categories } from "@/data/products";

type CartItem = {
  id: string;
  name: string;
  price: number;
  image: string;
  weight: number;
  weight_unit: string;
  category: string;
  categoryId: string;
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

  getProductWeight: (productId: string) => number;
  getCategoryWeight: (categoryId: string) => number;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      maxItems: 0,

      setMaxItems: (value) => set({ maxItems: value }),

      //helpers
      getCategoryWeight: (categoryId: string) => {
        return get().items
          .filter((i) => i.categoryId === categoryId)
          .reduce((acc, item) => acc + item.gram_weight * item.qty, 0);
      },

      getProductWeight: (productId: string) => {
        return get().items
          .filter((i) => i.id === productId)
          .reduce((acc, item) => acc + item.gram_weight * item.qty, 0);
      },
      
      add: (product, qty = 1, item_type = "base") => {
        const subInfo = useSubscriptionStore.getState().subInfo;
        // const categoryRules = subInfo?.subscription?.attributes?.category_rules || [];
        // const productRules = subInfo?.subscription?.attributes?.product_rules || [];

        const max_gram = toGrams(subInfo?.subscription?.attributes?.remaining_weight,subInfo?.subscription?.attributes?.weight_unit as "kg" | "g")

        const productWeightG = toGrams(product.weight,product.weight_unit)

        if((get().totalGramWeight() === max_gram) || ((get().totalGramWeight() + productWeightG) > max_gram)){
          toast.error("You have exceeded the maximum weight.")
          return;
        }

        //max item validation
        // if((get().totalItems() == subInfo?.subscription?.attributes?.max_items)){
        //   return;
        // }

        const items = get().items;

        // PRODUCT RULE VALIDATION
        if(subInfo?.subscription?.attributes?.product_rules?.length > 0){

          const productRule = subInfo?.subscription?.attributes?.product_rules?.find(
            (rule: any) => rule.product_id === product.id
          );
  
          if (productRule) {

            const maxWeight = toGrams(
              productRule.max_weight,
              productRule.weight_unit
            );
  
            const existingWeight = get().getProductWeight(product.id);
  
            if (existingWeight + productWeightG > maxWeight) {
              toast.error(`This product exceeds the max weight limit for ${product?.name}`)
              return;
            }

            // Find product rules not yet fully added
            // const missingProducts = subInfo?.subscription?.attributes?.product_rules?.filter((rule: any) => {
            //   const existingWeight = get().getProductWeight(rule.product_id);
            //   const maxWeight = toGrams(rule.max_weight, rule.weight_unit);
            //   return existingWeight < maxWeight;
            // });

            // Show names of products that are missing
            // missingProducts.forEach((rule) => {
            //   const existingWeight = get().getProductWeight(rule.product_id);
            //   const maxWeight = toGrams(rule.max_weight, rule.weight_unit);
            //   const remainingWeight = maxWeight - existingWeight;

            //   if (remainingWeight > 0) {
            //     toast.error(`You still need to select: ${formatWeight(remainingWeight)} of ${rule.product_name}`);
            //     return;
            //   }
            // })

          }
        }

        // CATEGORY RULE VALIDATION
        if(subInfo?.subscription?.attributes?.category_rules?.length > 0){

          // Assume categoriesId is from category rules that need to be filled first
          const categoriesId = subInfo?.subscription?.attributes?.category_rules?.map(c => c.category_id);

          //     const maxCategoryWeight = toGrams(categoryRule.weight_required, categoryRule.weight_unit);
          // // calculate current weight in this category
          // const existingCategoryWeight = get().getCategoryWeight(product.categoryId);

          // // if category is not yet filled, only allow products from this category
          // const categoryRemaining = maxCategoryWeight - existingCategoryWeight;

          // If category is not yet filled AND the product is NOT from this category, block it
          // if (categoryRemaining > 0 && !categoriesId.includes(product.categoryId)) {
          //   toast.error(`Please select products from the required category first`);
          //   return;
          // }
          if (!categoriesId.includes(product.categoryId)) {
            toast.error(`Please select products from the required category first`);
            return;
          }

          const categoryRule = subInfo?.subscription?.attributes?.category_rules?.find(
            (rule: any) => rule.category_id === product.categoryId
          );

          if (categoryRule) {
            const maxCategoryWeight = toGrams(
              categoryRule.weight_required,
              categoryRule.weight_unit
            );

            const existingCategoryWeight = get().getCategoryWeight(product.categoryId);

            if (existingCategoryWeight + productWeightG > maxCategoryWeight) {
              toast.error(`This product exceeds the max weight limit for ${product?.category}`)
              return;
            }
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
                gram_weight: productWeightG 
              },
            ],
          });
        }
      },

      setQty: (product, qty) => {

        const { subInfo } = useSubscriptionStore.getState();

        const max_gram = toGrams(
          subInfo?.subscription?.attributes?.remaining_weight,
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

        const isAdding = qty > (currentItem?.qty || 0);

        // PRODUCT RULE VALIDATION
        if(subInfo?.subscription?.attributes?.product_rules?.length > 0){

          const productRule = subInfo?.subscription?.attributes?.product_rules?.find(
            (rule: any) => rule.product_id === product.id
          );
  
          if (productRule) {

            const maxWeight = toGrams(
              productRule.max_weight,
              productRule.weight_unit
            );
  
            const existingWeight = get().getProductWeight(product.id);
  
            if (existingWeight + productWeightG > maxWeight) {
              toast.error(`You have reached the max limit for ${product?.name}`)
              return;
            }
          }
        }

        // CATEGORY RULE VALIDATION
        if(subInfo?.subscription?.attributes?.category_rules?.length > 0){

          const categoryRule = subInfo?.subscription?.attributes?.category_rules?.find(
            (rule: any) => rule.category_id === product.categoryId
          );

          if (categoryRule) {
            const maxCategoryWeight = toGrams(
              categoryRule.weight_required,
              categoryRule.weight_unit
            );

            const existingCategoryWeight = get().getCategoryWeight(product.categoryId);

            if(isAdding){
              if (existingCategoryWeight + productWeightG > maxCategoryWeight) {
                toast.error(`This product exceeds the max weight limit for ${product?.category}`)
                return;
              }
            }
          }
        }

        const currentItemWeight = currentItem
          ? currentItem.gram_weight * currentItem.qty
          : 0;

        const newItemWeight = productWeightG * qty;

        const newTotalWeight =
          get().totalGramWeight() - currentItemWeight + newItemWeight;

        if (isAdding && newTotalWeight > max_gram) {
          toast.error("Maximum weight exceeded");
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