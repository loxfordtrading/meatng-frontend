import React, { createContext, useContext, useReducer, useEffect, ReactNode, useCallback } from 'react';
import {
  PlanTier,
  Frequency,
  Plan,
  PlanItem,
  normalizePlanId,
  getPlanById,
} from '@/data/plans';
import { tokenStorage } from '@/lib/auth/tokenStorage';

// ── Types ────────────────────────────────────────────────────

export interface BoxItem {
  productId: string;
  name: string;
  category: string;
  weightG: number;
  price: number;
  quantity: number;
  /** true = mandatory item, cannot be removed */
  locked?: boolean;
}

interface AddOn {
  productId: string;
  quantity: number;
  price: number;
}

interface User {
  id?: string;
  name: string;
  email: string;
  phone?: string;
}

type FlowStep = 'plan' | 'frequency' | 'build' | 'cart' | 'checkout';

interface SubscriptionState {
  user: User | null;
  plan: PlanTier | null;
  frequency: Frequency | null;
  boxItems: BoxItem[];
  addOns: AddOn[];
  planPrice: number;
  planWeightG: number;
  currentStep: FlowStep;
  /** Offal selections for Value/Essential plans (offal option names) */
  selectedOffals: string[];
  /** Build-your-box selections for Signature/Premium plans */
  buildSelections: { name: string; category: string; weightG: number; price: number; quantity: number }[];
}

type SubscriptionAction =
  | { type: 'SET_PLAN'; payload: PlanTier }
  | { type: 'SET_FREQUENCY'; payload: Frequency }
  | { type: 'INITIALIZE_BOX'; payload: { items: BoxItem[]; price: number; weightG: number } }
  | { type: 'ADD_BOX_ITEM'; payload: BoxItem }
  | { type: 'REMOVE_BOX_ITEM'; payload: { productId: string } }
  | { type: 'SWAP_BOX_ITEM'; payload: { oldProductId: string; newItem: BoxItem } }
  | { type: 'SET_BOX_ITEM_QUANTITY'; payload: { productId: string; quantity: number } }
  | { type: 'ADD_ADDON'; payload: { productId: string; price: number } }
  | { type: 'REMOVE_ADDON'; payload: { productId: string } }
  | { type: 'SET_STEP'; payload: FlowStep }
  | { type: 'LOGIN'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'RESET' }
  | { type: 'LOAD_STATE'; payload: Partial<SubscriptionState> }
  | { type: 'SET_OFFALS'; payload: string[] }
  | { type: 'SET_BUILD_SELECTIONS'; payload: SubscriptionState['buildSelections'] };

// ── Initial state ────────────────────────────────────────────

const initialState: SubscriptionState = {
  user: null,
  plan: null,
  frequency: null,
  boxItems: [],
  addOns: [],
  planPrice: 0,
  planWeightG: 0,
  currentStep: 'plan',
  selectedOffals: [],
  buildSelections: [],
};

// ── Helpers ──────────────────────────────────────────────────

const planItemToBoxItem = (item: PlanItem, index: number, locked = false): BoxItem => ({
  productId: `preset-${item.name.toLowerCase().replace(/\s+/g, '-')}-${index}`,
  name: item.name,
  category: item.category,
  weightG: item.weightG,
  price: item.price,
  quantity: 1,
  locked,
});

const normalizeLoadedState = (payload: Partial<SubscriptionState>): Partial<SubscriptionState> => {
  const normalizedPlan = normalizePlanId(payload.plan ?? null);
  const plan = normalizedPlan ? getPlanById(normalizedPlan) : undefined;

  let frequency = payload.frequency ?? null;
  if (plan && frequency && !plan.allowedFrequencies.includes(frequency)) {
    frequency = plan.allowedFrequencies[0] ?? null;
  }

  return {
    ...payload,
    plan: normalizedPlan,
    frequency,
    planPrice: plan?.price ?? 0,
    planWeightG: plan ? plan.weightKg * 1000 : 0,
  };
};

// ── Reducer ──────────────────────────────────────────────────

function subscriptionReducer(state: SubscriptionState, action: SubscriptionAction): SubscriptionState {
  switch (action.type) {
    case 'SET_PLAN': {
      const plan = getPlanById(action.payload);
      return {
        ...state,
        plan: action.payload,
        frequency: null,
        boxItems: [],
        addOns: [],
        planPrice: plan?.price ?? 0,
        planWeightG: plan ? plan.weightKg * 1000 : 0,
        currentStep: 'plan',
        selectedOffals: [],
        buildSelections: [],
      };
    }

    case 'INITIALIZE_BOX':
      return {
        ...state,
        boxItems: action.payload.items,
        planPrice: action.payload.price,
        planWeightG: action.payload.weightG,
      };

    case 'SET_FREQUENCY': {
      if (state.plan) {
        const plan = getPlanById(state.plan);
        if (plan && !plan.allowedFrequencies.includes(action.payload)) {
          return state;
        }
      }
      return {
        ...state,
        frequency: action.payload,
        currentStep: 'build',
      };
    }

    case 'ADD_BOX_ITEM': {
      const existing = state.boxItems.find((item) => item.productId === action.payload.productId);
      if (existing) {
        return {
          ...state,
          boxItems: state.boxItems.map((item) =>
            item.productId === action.payload.productId
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        };
      }
      return {
        ...state,
        boxItems: [...state.boxItems, { ...action.payload, quantity: 1 }],
      };
    }

    case 'REMOVE_BOX_ITEM':
      return {
        ...state,
        boxItems: state.boxItems.filter((item) => item.productId !== action.payload.productId),
      };

    case 'SWAP_BOX_ITEM':
      return {
        ...state,
        boxItems: state.boxItems.map((item) =>
          item.productId === action.payload.oldProductId
            ? { ...action.payload.newItem, quantity: item.quantity }
            : item
        ),
      };

    case 'SET_BOX_ITEM_QUANTITY': {
      if (action.payload.quantity <= 0) {
        return {
          ...state,
          boxItems: state.boxItems.filter((item) => item.productId !== action.payload.productId),
        };
      }
      const existing = state.boxItems.find((item) => item.productId === action.payload.productId);
      if (existing) {
        return {
          ...state,
          boxItems: state.boxItems.map((item) =>
            item.productId === action.payload.productId
              ? { ...item, quantity: action.payload.quantity }
              : item
          ),
        };
      }
      return state;
    }

    case 'ADD_ADDON': {
      const existingAddon = state.addOns.find((a) => a.productId === action.payload.productId);
      if (existingAddon) {
        return {
          ...state,
          addOns: state.addOns.map((a) =>
            a.productId === action.payload.productId
              ? { ...a, quantity: a.quantity + 1 }
              : a
          ),
        };
      }
      return {
        ...state,
        addOns: [...state.addOns, { productId: action.payload.productId, quantity: 1, price: action.payload.price }],
      };
    }

    case 'REMOVE_ADDON': {
      const existingAddon = state.addOns.find((a) => a.productId === action.payload.productId);
      if (existingAddon && existingAddon.quantity > 1) {
        return {
          ...state,
          addOns: state.addOns.map((a) =>
            a.productId === action.payload.productId
              ? { ...a, quantity: a.quantity - 1 }
              : a
          ),
        };
      }
      return {
        ...state,
        addOns: state.addOns.filter((a) => a.productId !== action.payload.productId),
      };
    }

    case 'SET_STEP':
      return { ...state, currentStep: action.payload };

    case 'LOGIN':
      return { ...state, user: action.payload };

    case 'LOGOUT':
      return initialState;

    case 'RESET':
      return initialState;

    case 'LOAD_STATE':
      return { ...state, ...normalizeLoadedState(action.payload) };

    case 'SET_OFFALS':
      return { ...state, selectedOffals: action.payload };

    case 'SET_BUILD_SELECTIONS':
      return { ...state, buildSelections: action.payload };

    default:
      return state;
  }
}

// ── Context ──────────────────────────────────────────────────

interface SubscriptionContextType {
  state: SubscriptionState;

  // Actions
  setPlan: (plan: PlanTier) => void;
  setFrequency: (frequency: Frequency) => void;
  initializeBox: (plan: Plan) => void;
  addBoxItem: (item: BoxItem) => void;
  removeBoxItem: (productId: string) => void;
  swapBoxItem: (oldProductId: string, newItem: BoxItem) => void;
  setBoxItemQuantity: (productId: string, quantity: number) => void;
  addAddon: (productId: string, price: number) => void;
  removeAddon: (productId: string) => void;
  setStep: (step: FlowStep) => void;
  login: (user: User) => void;
  logout: () => void;
  reset: () => void;
  setSelectedOffals: (offals: string[]) => void;
  setBuildSelections: (selections: SubscriptionState['buildSelections']) => void;

  // Weight-based computed values
  totalWeightG: number;
  categoryWeightUsed: (category: string) => number;
  categoryBudgetRemaining: (category: string) => number;
  getCategoryBudget: (category: string) => number;
  isBoxFull: boolean;
  canProceedToCart: boolean;
  addOnsTotal: number;
  grandTotal: number;
  currentPlan: Plan | undefined;
  /** Total weight of build-your-box selections */
  buildWeightUsed: number;
}

const SubscriptionContext = createContext<SubscriptionContextType | null>(null);

const STORAGE_KEY = 'meatng-subscription';

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(subscriptionReducer, initialState);

  // Load from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem(STORAGE_KEY);
    if (savedState) {
      try {
        dispatch({ type: 'LOAD_STATE', payload: JSON.parse(savedState) as Partial<SubscriptionState> });
      } catch (e) {
        console.error('Failed to load subscription state:', e);
      }
    }
  }, []);

  // Save to localStorage on changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // Current plan object
  const currentPlan = state.plan ? getPlanById(state.plan) : undefined;

  // Weight-based computed values
  const totalWeightG = state.boxItems.reduce((sum, item) => sum + item.weightG * item.quantity, 0);

  const buildWeightUsed = state.buildSelections.reduce(
    (sum, s) => sum + s.weightG * s.quantity,
    0,
  );

  const categoryWeightUsed = useCallback(
    (category: string): number =>
      state.boxItems
        .filter((item) => item.category === category)
        .reduce((sum, item) => sum + item.weightG * item.quantity, 0),
    [state.boxItems],
  );

  const getCategoryBudget = useCallback(
    (category: string): number => {
      if (!currentPlan) return 0;
      return currentPlan.categoryBudgets.find((b) => b.category === category)?.budgetG ?? 0;
    },
    [currentPlan],
  );

  const categoryBudgetRemaining = useCallback(
    (category: string): number => getCategoryBudget(category) - categoryWeightUsed(category),
    [getCategoryBudget, categoryWeightUsed],
  );

  const isBoxFull = currentPlan
    ? currentPlan.categoryBudgets.every((b) => categoryWeightUsed(b.category) >= b.budgetG)
    : false;

  const canProceedToCart = !!(state.plan && state.frequency && state.boxItems.length > 0);
  const addOnsTotal = state.addOns.reduce((sum, a) => sum + a.price * a.quantity, 0);
  const grandTotal = state.planPrice + addOnsTotal;

  const initializeBox = useCallback(
    (plan: Plan) => {
      // Use mandatoryItems if available, fallback to defaultItems
      const source = plan.mandatoryItems.length > 0 ? plan.mandatoryItems : plan.defaultItems;
      const items = source.map((item, i) => planItemToBoxItem(item, i, true));
      dispatch({
        type: 'INITIALIZE_BOX',
        payload: { items, price: plan.price, weightG: plan.weightKg * 1000 },
      });
    },
    [],
  );

  const value: SubscriptionContextType = {
    state,

    setPlan: (plan) => dispatch({ type: 'SET_PLAN', payload: plan }),
    setFrequency: (frequency) => dispatch({ type: 'SET_FREQUENCY', payload: frequency }),
    initializeBox,
    addBoxItem: (item) => dispatch({ type: 'ADD_BOX_ITEM', payload: item }),
    removeBoxItem: (productId) => dispatch({ type: 'REMOVE_BOX_ITEM', payload: { productId } }),
    swapBoxItem: (oldProductId, newItem) =>
      dispatch({ type: 'SWAP_BOX_ITEM', payload: { oldProductId, newItem } }),
    setBoxItemQuantity: (productId, quantity) =>
      dispatch({ type: 'SET_BOX_ITEM_QUANTITY', payload: { productId, quantity } }),
    addAddon: (productId, price) => dispatch({ type: 'ADD_ADDON', payload: { productId, price } }),
    removeAddon: (productId) => dispatch({ type: 'REMOVE_ADDON', payload: { productId } }),
    setStep: (step) => dispatch({ type: 'SET_STEP', payload: step }),
    login: (user) => dispatch({ type: 'LOGIN', payload: user }),
    logout: () => {
      tokenStorage.clearCustomerToken();
      dispatch({ type: 'LOGOUT' });
    },
    reset: () => dispatch({ type: 'RESET' }),
    setSelectedOffals: (offals) => dispatch({ type: 'SET_OFFALS', payload: offals }),
    setBuildSelections: (selections) => dispatch({ type: 'SET_BUILD_SELECTIONS', payload: selections }),

    totalWeightG,
    categoryWeightUsed,
    categoryBudgetRemaining,
    getCategoryBudget,
    isBoxFull,
    canProceedToCart,
    addOnsTotal,
    grandTotal,
    currentPlan,
    buildWeightUsed,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}
