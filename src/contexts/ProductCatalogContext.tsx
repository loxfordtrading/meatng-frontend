import { createContext, useContext, useMemo, ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  products as mockProducts,
  categories as mockCategories,
} from "@/data/products";
import type { Product, ProductCategory } from "@/data/products";
import type { PlanTier } from "@/data/plans";
import { listProducts, listProductCategories } from "@/lib/api/admin";
import type { Product as ApiProduct, ProductCategory as ApiCategory } from "@/lib/api/admin";

// ── Category slug → ProductCategory union ──────────────────────
const SLUG_MAP: Record<string, ProductCategory> = {
  chicken: "chicken",
  beef: "beef",
  ram: "ram",
  goat: "goat",
  sausage: "sausage",
  bones: "bones",
  offals: "offals",
  offal: "offals",
  "premium-cuts": "premium-cuts",
  "premium cuts": "premium-cuts",
  premium_cuts: "premium-cuts",
};

const normalizeCategory = (input?: string): ProductCategory => {
  if (!input) return "chicken";
  const lower = input.toLowerCase().replace(/_/g, "-").trim();
  return (SLUG_MAP[lower] ?? lower) as ProductCategory;
};

// ── Plan slug → PlanTier union ─────────────────────────────────
const PLAN_MAP: Record<string, PlanTier> = {
  "value-pack": "value-pack",
  value_pack: "value-pack",
  "value pack": "value-pack",
  value: "value-pack",
  starter: "value-pack",
  essential: "essential",
  essentials: "essential",
  signature: "signature",
  premium: "premium",
};

const extractEligiblePlans = (raw: Record<string, unknown>): PlanTier[] => {
  const rawPlans = raw.eligiblePlans ?? raw.eligible_plans ?? raw.plans ?? raw.plan_tiers;
  if (Array.isArray(rawPlans) && rawPlans.length > 0) {
    const mapped = rawPlans
      .map((v) => PLAN_MAP[String(v).toLowerCase().trim()])
      .filter(Boolean);
    if (mapped.length > 0) return mapped as PlanTier[];
  }
  // Default: available across all plans
  return ["value-pack", "essential", "signature", "premium"];
};

// ── Parse weight string → grams ─────────────────────────────────
const parseWeightG = (input: unknown): number => {
  if (typeof input === "number" && input > 0) return input;
  const str = String(input ?? "").toLowerCase().trim();
  // e.g. "1.5kg", "1.5-2kg", "500g", "400g"
  const kgMatch = str.match(/([\d.]+)\s*kg/);
  if (kgMatch) return Math.round(parseFloat(kgMatch[1]) * 1000);
  const gMatch = str.match(/([\d.]+)\s*g/);
  if (gMatch) return Math.round(parseFloat(gMatch[1]));
  return 500; // default fallback
};

// ── API Product → local Product ────────────────────────────────
const mapApiToProduct = (p: ApiProduct, cats: ApiCategory[]): Product => {
  const raw = p.raw ?? {};
  const catId = p.categoryIds?.[0];
  const apiCat = cats.find((c) => c.id === catId);
  const category = normalizeCategory(apiCat?.slug ?? apiCat?.name ?? String(raw.category ?? ""));

  const bestForRaw = raw.bestFor ?? raw.best_for ?? raw.bestfor;
  const bestFor: string[] = Array.isArray(bestForRaw)
    ? (bestForRaw as unknown[]).filter((v) => typeof v === "string") as string[]
    : [];

  const packSize = String(raw.packSize ?? raw.pack_size ?? raw.weight ?? p.sku ?? "");

  return {
    id: p.id,
    name: p.name ?? String(raw.name ?? "Unknown Product"),
    category,
    packSize,
    weightG: parseWeightG(raw.weightG ?? raw.weight_g ?? raw.weight ?? packSize),
    description: p.description ?? String(raw.description ?? ""),
    bestFor,
    storageGuidance: String(
      raw.storageGuidance ?? raw.storage_guidance ?? "Keep refrigerated at 0–4°C.",
    ),
    handlingNotes: raw.handlingNotes ? String(raw.handlingNotes) : undefined,
    image: p.images?.[0] ?? String(raw.imageUrl ?? raw.image ?? "/placeholder.svg"),
    eligiblePlans: extractEligiblePlans(raw),
    addOnPrice: p.price ?? 0,
    isPremiumDrop: Boolean(raw.isPremiumDrop ?? raw.is_premium_drop ?? false),
  };
};

const mapApiCategory = (c: ApiCategory) => ({
  id: normalizeCategory(c.slug ?? c.name),
  name: c.name ?? c.id,
  image: String((c.raw ?? {}).image ?? (c.raw ?? {}).imageUrl ?? ""),
});

// ── Context shape ───────────────────────────────────────────────
interface CatalogShape {
  products: Product[];
  categories: { id: string; name: string; image: string }[];
  isLoading: boolean;
  getProductById: (id: string) => Product | undefined;
  getProductsByCategory: (category: string) => Product[];
  getProductsByPlan: (plan: string) => Product[];
  getCategoriesForPlan: (plan: string) => string[];
}

const ProductCatalogContext = createContext<CatalogShape | null>(null);

export function ProductCatalogProvider({ children }: { children: ReactNode }) {
  const { data: apiCategories } = useQuery({
    queryKey: ["catalog-categories"],
    queryFn: async () => {
      try {
        return await listProductCategories();
      } catch {
        return null;
      }
    },
    staleTime: 300_000,
  });

  const { data: apiProducts, isLoading } = useQuery({
    queryKey: ["catalog-products"],
    queryFn: async () => {
      try {
        return await listProducts();
      } catch {
        return null;
      }
    },
    staleTime: 60_000,
  });

  const categories = useMemo(() => {
    const mockCats = mockCategories.map((c) => ({ id: c.id as string, name: c.name, image: c.image }));
    if (!apiCategories || apiCategories.length === 0) return mockCats;

    // Merge by id and prefer API values so admin edits reflect in storefront.
    const byId = new Map<string, { id: string; name: string; image: string }>();
    for (const cat of mockCats) byId.set(cat.id, cat);
    for (const cat of apiCategories.map(mapApiCategory)) {
      const existing = byId.get(cat.id);
      byId.set(cat.id, {
        id: cat.id,
        name: cat.name || existing?.name || cat.id,
        image: cat.image || existing?.image || "",
      });
    }
    return Array.from(byId.values());
  }, [apiCategories]);

  const products = useMemo((): Product[] => {
    // Keep mock catalog as fallback, but let API records override by id.
    if (!apiProducts) return mockProducts;

    const byId = new Map<string, Product>();
    for (const p of mockProducts) byId.set(p.id, p);

    for (const apiProduct of apiProducts) {
      if (!apiProduct.id) continue;
      if (apiProduct.isActive === false) {
        byId.delete(apiProduct.id);
        continue;
      }
      const mapped = mapApiToProduct(apiProduct, apiCategories ?? []);
      byId.set(mapped.id, mapped);
    }

    return Array.from(byId.values());
  }, [apiProducts, apiCategories]);

  const value = useMemo<CatalogShape>(
    () => ({
      products,
      categories,
      isLoading,
      getProductById: (id) => products.find((p) => p.id === id),
      getProductsByCategory: (cat) => products.filter((p) => p.category === cat),
      getProductsByPlan: (plan) =>
        products.filter((p) => p.eligiblePlans.includes(plan as PlanTier)),
      getCategoriesForPlan: (plan) => {
        const eligible = products.filter((p) =>
          p.eligiblePlans.includes(plan as PlanTier),
        );
        return [...new Set(eligible.map((p) => p.category))];
      },
    }),
    [products, categories, isLoading],
  );

  return (
    <ProductCatalogContext.Provider value={value}>
      {children}
    </ProductCatalogContext.Provider>
  );
}

export function useProductCatalog() {
  const ctx = useContext(ProductCatalogContext);
  if (!ctx) throw new Error("useProductCatalog must be used within ProductCatalogProvider");
  return ctx;
}
