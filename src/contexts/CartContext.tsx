import React, { createContext, useContext, useReducer, useEffect, ReactNode } from "react";
import { Product, GiftBox, getProductById, products } from "@/data/products";

export type DeliveryFrequency = "one-time" | "weekly" | "bi-weekly" | "monthly";

export interface CartItem {
  id: string;
  type: "product" | "gift-box" | "subscription-addon";
  productId?: string;
  boxId?: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  items?: { productId: string; quantity: number }[]; // For boxes
  giftDetails?: {
    recipientName?: string;
    recipientPhone?: string;
    senderName?: string;
    message?: string;
    occasion?: string;
    preferredDeliveryDate?: string;
    preferredDeliveryWindow?: string;
  };
}

interface CartState {
  items: CartItem[];
  deliveryFrequency: DeliveryFrequency;
}

type CartAction =
  | { type: "ADD_ITEM"; payload: CartItem }
  | { type: "REMOVE_ITEM"; payload: string }
  | { type: "UPDATE_QUANTITY"; payload: { id: string; quantity: number } }
  | { type: "SET_DELIVERY_FREQUENCY"; payload: DeliveryFrequency }
  | { type: "CLEAR_CART" }
  | { type: "LOAD_CART"; payload: CartState };

const initialState: CartState = {
  items: [],
  deliveryFrequency: "one-time",
};

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case "ADD_ITEM": {
      const existingItem = state.items.find((item) => item.id === action.payload.id);
      if (existingItem) {
        return {
          ...state,
          items: state.items.map((item) =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + action.payload.quantity }
              : item
          ),
        };
      }
      return { ...state, items: [...state.items, action.payload] };
    }
    case "REMOVE_ITEM":
      return { ...state, items: state.items.filter((item) => item.id !== action.payload) };
    case "UPDATE_QUANTITY":
      if (action.payload.quantity <= 0) {
        return { ...state, items: state.items.filter((item) => item.id !== action.payload.id) };
      }
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.payload.id ? { ...item, quantity: action.payload.quantity } : item
        ),
      };
    case "SET_DELIVERY_FREQUENCY":
      return { ...state, deliveryFrequency: action.payload };
    case "CLEAR_CART":
      return initialState;
    case "LOAD_CART":
      return action.payload;
    default:
      return state;
  }
};

interface CartContextValue {
  items: CartItem[];
  deliveryFrequency: DeliveryFrequency;
  itemCount: number;
  subtotal: number;
  addProduct: (product: Product, quantity?: number) => void;
  addGiftBox: (box: GiftBox, giftDetails?: CartItem["giftDetails"]) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  setDeliveryFrequency: (frequency: DeliveryFrequency) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

const CART_STORAGE_KEY = "meatng-cart";

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        dispatch({ type: "LOAD_CART", payload: parsed });
      } catch (e) {
        console.error("Failed to load cart from localStorage:", e);
      }
    }
  }, []);

  // Save cart to localStorage on changes
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const addProduct = (product: Product, quantity = 1) => {
    dispatch({
      type: "ADD_ITEM",
      payload: {
        id: `product-${product.id}`,
        type: "product",
        productId: product.id,
        name: product.name,
        price: product.addOnPrice,
        quantity,
        image: product.image,
      },
    });
  };

  const addGiftBox = (box: GiftBox, giftDetails?: CartItem["giftDetails"]) => {
    dispatch({
      type: "ADD_ITEM",
      payload: {
        id: giftDetails?.recipientName
          ? `gift-${box.id}-${giftDetails.recipientName.toLowerCase().replace(/\s+/g, "-")}`
          : `gift-${box.id}`,
        type: "gift-box",
        boxId: box.id,
        name: box.name,
        price: box.price,
        quantity: 1,
        image: box.image,
        items: box.contents,
        giftDetails,
      },
    });
  };

  const removeItem = (id: string) => {
    dispatch({ type: "REMOVE_ITEM", payload: id });
  };

  const updateQuantity = (id: string, quantity: number) => {
    dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity } });
  };

  const setDeliveryFrequency = (frequency: DeliveryFrequency) => {
    dispatch({ type: "SET_DELIVERY_FREQUENCY", payload: frequency });
  };

  const clearCart = () => {
    dispatch({ type: "CLEAR_CART" });
  };

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        deliveryFrequency: state.deliveryFrequency,
        itemCount,
        subtotal,
        addProduct,
        addGiftBox,
        removeItem,
        updateQuantity,
        setDeliveryFrequency,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextValue => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
