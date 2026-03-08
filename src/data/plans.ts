// Plan types and subscription data for MeatNG

export type LegacyPlanTier = "essentials";
export type PlanTier = "value-pack" | "essential" | "signature" | "premium";
export type PlanTierInput = PlanTier | LegacyPlanTier;
export type Frequency = "weekly" | "bi-weekly" | "monthly";

export interface CategoryBudget {
  category: string;
  budgetG: number;
}

export interface PlanItem {
  name: string;
  category: string;
  weightG: number;
  price: number;
}

/** An offal option the customer can toggle on/off in Value Pack / Essential */
export interface OffalOption {
  name: string;
  weightG: number;
  price: number;
  /** Per-item cap. E.g. Shaki maxQty=1 in Value Pack, 2 in Essential */
  maxQty?: number;
}

/** An item in the build-your-box catalog for Signature / Premium */
export interface BuildCatalogItem {
  name: string;
  category: "beef" | "chicken" | "offals";
  weightG: number;
  price: number;
}

export interface Plan {
  id: PlanTier;
  name: string;
  tagline: string;
  description: string;
  price: number;
  weightKg: number;
  categoryBudgets: CategoryBudget[];
  /** Items that come pre-packed and cannot be removed */
  mandatoryItems: PlanItem[];
  /**
   * @deprecated kept for backward compat – use mandatoryItems instead.
   * initializeBox() now reads mandatoryItems.
   */
  defaultItems: PlanItem[];
  allowedFrequencies: Frequency[];
  benefits: string[];
  isPopular?: boolean;

  /** Value Pack / Essential – customer picks X offals from a list */
  offalSelection?: {
    maxChoices: number;
    options: OffalOption[];
  };

  /** Signature / Premium – customer fills remaining weight from catalog */
  buildYourBox?: {
    remainingWeightG: number;
    catalog: BuildCatalogItem[];
  };
}

export interface FrequencyOption {
  id: Frequency;
  label: string;
  description: string;
  billingNote: string;
}

// ── Plan definitions ──────────────────────────────────────────

export const plans: Plan[] = [
  // ─── VALUE PACK ──────────────────────────────────────────────
  {
    id: "value-pack",
    name: "Value Pack",
    tagline: "Start smart",
    description:
      "3kg mixed cuts — beef & offals. Choose 3 offals to complete your box.",
    price: 20000,
    weightKg: 3,
    categoryBudgets: [
      { category: "beef", budgetG: 2500 },
      { category: "offals", budgetG: 500 },
    ],
    mandatoryItems: [
      { name: "Bone-in Beef", category: "beef", weightG: 2000, price: 13000 },
      { name: "Boneless Beef", category: "beef", weightG: 500, price: 3750 },
    ],
    defaultItems: [
      { name: "Bone-in Beef", category: "beef", weightG: 2000, price: 13000 },
      { name: "Boneless Beef", category: "beef", weightG: 500, price: 3750 },
    ],
    offalSelection: {
      maxChoices: 3,
      options: [
        { name: "Liver", weightG: 100, price: 600 },
        { name: "Cow Skin (Ponmo)", weightG: 200, price: 1000 },
        { name: "Shaki", weightG: 100, price: 750, maxQty: 1 },
        { name: "Roundabout", weightG: 100, price: 650, maxQty: 1 },
        { name: "Lungs", weightG: 100, price: 600 },
      ],
    },
    allowedFrequencies: ["weekly", "bi-weekly", "monthly"],
    benefits: [
      "2.5kg Beef + choose your offals",
      "Pick 3 out of 5 offal options",
      "Dashboard control (edit/skip/pause)",
      "Flexible delivery scheduling",
    ],
  },

  // ─── ESSENTIAL BOX ───────────────────────────────────────────
  {
    id: "essential",
    name: "Essential Box",
    tagline: "Everyday variety",
    description:
      "5kg mixed cuts — beef, chicken & offals. Choose 4 offals to personalise.",
    price: 35000,
    weightKg: 5,
    categoryBudgets: [
      { category: "beef", budgetG: 3000 },
      { category: "chicken", budgetG: 1500 },
      { category: "offals", budgetG: 500 },
    ],
    mandatoryItems: [
      {
        name: "Boneless Beef",
        category: "beef",
        weightG: 2000,
        price: 15000,
      },
      {
        name: "Bone in Beef",
        category: "beef",
        weightG: 1000,
        price: 6500,
      },
      {
        name: "Whole Chicken",
        category: "chicken",
        weightG: 1500,
        price: 7500,
      },
    ],
    defaultItems: [
      {
        name: "Boneless Beef",
        category: "beef",
        weightG: 2000,
        price: 15000,
      },
      {
        name: "Bone in Beef",
        category: "beef",
        weightG: 1000,
        price: 6500,
      },
      {
        name: "Whole Chicken",
        category: "chicken",
        weightG: 1500,
        price: 7500,
      },
    ],
    offalSelection: {
      maxChoices: 4,
      options: [
        { name: "Liver", weightG: 100, price: 600 },
        { name: "Cow Skin (Ponmo)", weightG: 200, price: 1000 },
        { name: "Shaki", weightG: 100, price: 750, maxQty: 2 },
        { name: "Roundabout", weightG: 100, price: 650 },
        { name: "Lungs", weightG: 100, price: 600 },
        { name: "Abodi", weightG: 100, price: 600 },
      ],
    },
    allowedFrequencies: ["weekly", "bi-weekly", "monthly"],
    benefits: [
      "3kg Beef + 1.5kg Chicken + choose your offals",
      "Pick 4 out of 6 offal options",
      "Dashboard control (edit/skip/pause)",
      "Flexible delivery scheduling",
    ],
  },

  // ─── SIGNATURE BOX ──────────────────────────────────────────
  {
    id: "signature",
    name: "Signature Box",
    tagline: "Build your own",
    description:
      "10kg customisable — 5kg mandatory cuts, then build the rest your way.",
    price: 70000,
    weightKg: 10,
    isPopular: true,
    categoryBudgets: [
      { category: "beef", budgetG: 5000 },
      { category: "chicken", budgetG: 3000 },
      { category: "offals", budgetG: 2000 },
    ],
    mandatoryItems: [
      {
        name: "Boneless Beef",
        category: "beef",
        weightG: 1500,
        price: 11250,
      },
      {
        name: "Bone in Beef",
        category: "beef",
        weightG: 1000,
        price: 6500,
      },
      {
        name: "Agemawo (Beef + Skin)",
        category: "beef",
        weightG: 1000,
        price: 7000,
      },
      {
        name: "Whole Chicken",
        category: "chicken",
        weightG: 1500,
        price: 7500,
      },
    ],
    defaultItems: [
      {
        name: "Boneless Beef",
        category: "beef",
        weightG: 1500,
        price: 11250,
      },
      {
        name: "Bone in Beef",
        category: "beef",
        weightG: 1000,
        price: 6500,
      },
      {
        name: "Agemawo (Beef + Skin)",
        category: "beef",
        weightG: 1000,
        price: 7000,
      },
      {
        name: "Whole Chicken",
        category: "chicken",
        weightG: 1500,
        price: 7500,
      },
    ],
    buildYourBox: {
      remainingWeightG: 5000,
      catalog: [
        // Beef
        { name: "Agemawo (Beef + Skin)", category: "beef", weightG: 1000, price: 7000 },
        { name: "Bone in Beef", category: "beef", weightG: 1000, price: 6500 },
        { name: "Boneless Beef", category: "beef", weightG: 1000, price: 7500 },
        { name: "Minced Meat", category: "beef", weightG: 1000, price: 7500 },
        { name: "Plain Beef", category: "beef", weightG: 1000, price: 6500 },
        { name: "Torso Beef", category: "beef", weightG: 1000, price: 7500 },
        { name: "Shin", category: "beef", weightG: 1000, price: 6500 },
        // Offals
        { name: "Shaki", category: "offals", weightG: 100, price: 750 },
        { name: "Cow Leg", category: "offals", weightG: 100, price: 650 },
        { name: "Liver", category: "offals", weightG: 100, price: 600 },
        { name: "Kidney", category: "offals", weightG: 100, price: 600 },
        { name: "Roundabout (Small Intestine)", category: "offals", weightG: 100, price: 620 },
        { name: "Abodi (Large Intestine)", category: "offals", weightG: 100, price: 600 },
        { name: "Fuku (Lungs)", category: "offals", weightG: 100, price: 600 },
        { name: "Tail (Oxtail)", category: "offals", weightG: 1000, price: 7300 },
        { name: "Tongue", category: "offals", weightG: 100, price: 650 },
        { name: "Ponmo (White & Brown)", category: "offals", weightG: 200, price: 1000 },
        // Chicken
        { name: "Breast", category: "chicken", weightG: 100, price: 550 },
        { name: "Thigh", category: "chicken", weightG: 100, price: 450 },
        { name: "Drumstick", category: "chicken", weightG: 100, price: 600 },
        { name: "Wings", category: "chicken", weightG: 100, price: 550 },
        { name: "Minced Chicken", category: "chicken", weightG: 1000, price: 6500 },
        { name: "Gizzard", category: "chicken", weightG: 100, price: 550 },
        { name: "Cut 4", category: "chicken", weightG: 1000, price: 4500 },
        { name: "Laps (Thigh & Drumstick)", category: "chicken", weightG: 500, price: 2500 },
        { name: "Whole Chicken", category: "chicken", weightG: 1500, price: 7500 },
        { name: "Sausages", category: "chicken", weightG: 1000, price: 7500 },
      ],
    },
    allowedFrequencies: ["weekly", "bi-weekly", "monthly"],
    benefits: [
      "5kg mandatory premium cuts included",
      "Build the remaining 5kg your way",
      "Full catalog — beef, chicken & offals",
      "Dashboard control (edit/skip/pause)",
    ],
  },

  // ─── PREMIUM BOX ────────────────────────────────────────────
  {
    id: "premium",
    name: "Premium Box",
    tagline: "The full experience",
    description:
      "15kg premium cuts — 5kg mandatory, then build 10kg however you like.",
    price: 110000,
    weightKg: 15,
    categoryBudgets: [
      { category: "beef", budgetG: 5000 },
      { category: "chicken", budgetG: 5000 },
      { category: "offals", budgetG: 5000 },
    ],
    mandatoryItems: [
      {
        name: "Boneless Beef",
        category: "beef",
        weightG: 1500,
        price: 11250,
      },
      {
        name: "Bone in Beef",
        category: "beef",
        weightG: 1000,
        price: 6500,
      },
      {
        name: "Agemawo (Beef + Skin)",
        category: "beef",
        weightG: 1000,
        price: 7000,
      },
      {
        name: "Whole Chicken",
        category: "chicken",
        weightG: 1500,
        price: 7500,
      },
    ],
    defaultItems: [
      {
        name: "Boneless Beef",
        category: "beef",
        weightG: 1500,
        price: 11250,
      },
      {
        name: "Bone in Beef",
        category: "beef",
        weightG: 1000,
        price: 6500,
      },
      {
        name: "Agemawo (Beef + Skin)",
        category: "beef",
        weightG: 1000,
        price: 7000,
      },
      {
        name: "Whole Chicken",
        category: "chicken",
        weightG: 1500,
        price: 7500,
      },
    ],
    buildYourBox: {
      remainingWeightG: 10000,
      catalog: [
        // Beef
        { name: "Agemawo (Beef + Skin)", category: "beef", weightG: 1000, price: 7000 },
        { name: "Boneless Beef", category: "beef", weightG: 1000, price: 7500 },
        { name: "Minced Meat", category: "beef", weightG: 1000, price: 7500 },
        { name: "Plain Beef", category: "beef", weightG: 1000, price: 6500 },
        { name: "Torso Beef", category: "beef", weightG: 1000, price: 7500 },
        { name: "Shin", category: "beef", weightG: 1000, price: 6500 },
        // Offals
        { name: "Shaki", category: "offals", weightG: 100, price: 750 },
        { name: "Cow Leg", category: "offals", weightG: 100, price: 650 },
        { name: "Liver", category: "offals", weightG: 100, price: 600 },
        { name: "Kidney", category: "offals", weightG: 100, price: 600 },
        { name: "Roundabout (Small Intestine)", category: "offals", weightG: 100, price: 620 },
        { name: "Abodi (Large Intestine)", category: "offals", weightG: 100, price: 600 },
        { name: "Fuku (Lungs)", category: "offals", weightG: 100, price: 600 },
        { name: "Tail (Oxtail)", category: "offals", weightG: 1000, price: 7300 },
        { name: "Tongue", category: "offals", weightG: 100, price: 650 },
        { name: "Ponmo (White & Brown)", category: "offals", weightG: 200, price: 1000 },
        // Chicken
        { name: "Breast", category: "chicken", weightG: 100, price: 550 },
        { name: "Thigh", category: "chicken", weightG: 100, price: 450 },
        { name: "Drumstick", category: "chicken", weightG: 100, price: 600 },
        { name: "Wings", category: "chicken", weightG: 100, price: 550 },
        { name: "Minced Chicken", category: "chicken", weightG: 1000, price: 6500 },
        { name: "Gizzard", category: "chicken", weightG: 100, price: 550 },
        { name: "Cut 4", category: "chicken", weightG: 1000, price: 4500 },
        { name: "Laps (Thigh & Drumstick)", category: "chicken", weightG: 500, price: 2500 },
        { name: "Whole Chicken", category: "chicken", weightG: 1500, price: 7500 },
        { name: "Sausages", category: "chicken", weightG: 1000, price: 7500 },
      ],
    },
    allowedFrequencies: ["weekly", "bi-weekly", "monthly"],
    benefits: [
      "5kg mandatory premium cuts included",
      "Build the remaining 10kg your way",
      "Full catalog access including premium cuts",
      "Priority fulfillment & early access",
      "Dashboard control (edit/skip/pause)",
    ],
  },
];

// ── Frequencies ───────────────────────────────────────────────

export const frequencies: FrequencyOption[] = [
  {
    id: "weekly",
    label: "Weekly",
    description: "Perfect for regular restocks",
    billingNote: "Billed every week",
  },
  {
    id: "bi-weekly",
    label: "Bi-weekly",
    description: "Delivery every two weeks",
    billingNote: "Billed every 2 weeks",
  },
  {
    id: "monthly",
    label: "Monthly",
    description: "Best value for bulk shoppers",
    billingNote: "Billed once a month",
  },
];

// ── Helpers ───────────────────────────────────────────────────

const PLAN_ID_MAP: Record<string, PlanTier> = {
  essentials: "value-pack",
  "value-pack": "value-pack",
  essential: "essential",
  signature: "signature",
  premium: "premium",
};

export const normalizePlanId = (id: string | null | undefined): PlanTier | null => {
  if (!id) return null;
  return PLAN_ID_MAP[id] ?? null;
};

export const getPlanById = (id: string): Plan | undefined => {
  const normalizedId = normalizePlanId(id);
  return normalizedId ? plans.find((p) => p.id === normalizedId) : undefined;
};

export const getDisplayFrequency = (frequency: Frequency): string => {
  return frequency === "bi-weekly" ? "Bi-weekly" : `${frequency.slice(0, 1).toUpperCase()}${frequency.slice(1)}`;
};

export const formatPrice = (price: number): string => {
  return "\u20A6" + price.toLocaleString();
};

export const formatWeight = (grams: number): string => {
  if (grams >= 1000) {
    const kg = grams / 1000;
    return kg % 1 === 0 ? `${kg}kg` : `${kg.toFixed(1)}kg`;
  }
  return `${grams}g`;
};
