/**
 * Resolves frontend product/plan names to backend MongoDB ObjectIds.
 *
 * The frontend uses human-readable names (e.g. "Boneless Beef") and generated
 * productIds (e.g. "preset-boneless-beef-0") while the backend expects real
 * MongoDB ObjectIds for POST /carts/items.
 *
 * Resolution strategy:
 *  1. Fetch GET /products and GET /plans/active at runtime → build name/slug→id maps
 *  2. Fall back to a static mapping from the seed script output
 */

import { apiRequest } from "@/lib/api/client";

// ── Static fallback from seed script (backend-id-mapping.json) ───────────
// Only the 10 products currently returned by GET /products + 4 plans.
const STATIC_PRODUCT_MAP: Record<string, string> = {
  // Backend canonical names & slugs
  "agemawo": "69a94f39190d41dcb5723375",
  "agemawo (beef + skin)": "69a94f39190d41dcb5723375",
  "minced-meat": "69a94f3a190d41dcb572337a",
  "minced meat": "69a94f3a190d41dcb572337a",
  "plain-beef": "69a94f3b190d41dcb572337f",
  "plain beef": "69a94f3b190d41dcb572337f",
  "torso-beef": "69a94f3c190d41dcb5723384",
  "torso beef": "69a94f3c190d41dcb5723384",
  "shin": "69a94f3d190d41dcb5723389",
  "lungs": "69a94f3e190d41dcb572338e",
  "fuku (lungs)": "69a94f3e190d41dcb572338e",
  "minced-chicken": "69a94f3e190d41dcb5723394",
  "minced chicken": "69a94f3e190d41dcb5723394",
  "chicken-cut4": "69a94f3f190d41dcb5723399",
  "chicken cut 4": "69a94f3f190d41dcb5723399",
  "cut 4": "69a94f3f190d41dcb5723399",
  "chicken-laps": "69a94f40190d41dcb572339e",
  "laps (thigh & drumstick)": "69a94f40190d41dcb572339e",
  "sausages-generic": "69a94f41190d41dcb57233a3",
  "sausages": "69a94f41190d41dcb57233a3",

  // Frontend plan item aliases → closest backend product IDs
  "boneless beef": "69a94f3b190d41dcb572337f",          // → Plain Beef
  "bone-in beef": "69a94f3c190d41dcb5723384",           // → Torso Beef
  "bone in beef": "69a94f3c190d41dcb5723384",           // → Torso Beef
  "whole chicken": "69a94f3f190d41dcb5723399",           // → Chicken Cut 4
  // Offal selection aliases
  "liver": "69a94f3e190d41dcb572338e",                   // → Fuku (Lungs)
  "cow skin (ponmo)": "69a94f39190d41dcb5723375",        // → Agemawo (Beef + Skin)
  "ponmo": "69a94f39190d41dcb5723375",
  "shaki": "69a94f3d190d41dcb5723389",                   // → Shin
  "roundabout": "69a94f3e190d41dcb572338e",              // → Fuku (Lungs)
  "roundabout (small intestine)": "69a94f3e190d41dcb572338e",
  "abodi": "69a94f3e190d41dcb572338e",                   // → Fuku (Lungs)
  "abodi (large intestine)": "69a94f3e190d41dcb572338e",
  "cow leg": "69a94f3d190d41dcb5723389",                 // → Shin
  "kidney": "69a94f3e190d41dcb572338e",                  // → Fuku (Lungs)
};

const STATIC_PLAN_MAP: Record<string, string> = {
  "value-pack": "69a94fa5190d41dcb5723426",
  "essential": "69a94fa8190d41dcb5723438",
  "signature": "69a94fab190d41dcb5723449",
  "premium": "69a94faf190d41dcb572345e",
};

// ── Runtime cache ────────────────────────────────────────────────────────

interface IdMaps {
  products: Map<string, string>; // lowercase name/slug → ObjectId
  plans: Map<string, string>;    // lowercase name/slug → ObjectId
}

let cached: IdMaps | null = null;
let fetchPromise: Promise<IdMaps> | null = null;

const asObj = (v: unknown): Record<string, unknown> =>
  v && typeof v === "object" ? (v as Record<string, unknown>) : {};

const asStr = (v: unknown): string =>
  typeof v === "string" ? v.trim() : "";

function parseProducts(response: unknown): Map<string, string> {
  const map = new Map<string, string>();
  const data = asObj(response).data;
  const items = Array.isArray(data) ? data : [];
  for (const item of items) {
    const obj = asObj(item);
    const id = asStr(obj.id);
    if (!id) continue;
    const attrs = asObj(obj.attributes);
    const name = asStr(attrs.name);
    const slug = asStr(attrs.slug);
    if (name) map.set(name.toLowerCase(), id);
    if (slug) map.set(slug.toLowerCase(), id);
  }
  return map;
}

function parsePlans(response: unknown): Map<string, string> {
  const map = new Map<string, string>();
  const data = asObj(response).data;
  const items = Array.isArray(data) ? data : [];
  for (const item of items) {
    const obj = asObj(item);
    const id = asStr(obj.id);
    if (!id) continue;
    const attrs = asObj(obj.attributes);
    const name = asStr(attrs.name);
    const slug = asStr(attrs.slug) || asStr(attrs.code);
    if (name) map.set(name.toLowerCase(), id);
    if (slug) map.set(slug.toLowerCase(), id);
  }
  return map;
}

async function fetchMaps(token?: string | null): Promise<IdMaps> {
  const [productsRes, plansRes] = await Promise.allSettled([
    apiRequest<unknown>("/products", { method: "GET", token }),
    apiRequest<unknown>("/plans/active", { method: "GET", token }),
  ]);

  const products = productsRes.status === "fulfilled"
    ? parseProducts(productsRes.value)
    : new Map<string, string>();

  const plans = plansRes.status === "fulfilled"
    ? parsePlans(plansRes.value)
    : new Map<string, string>();

  return { products, plans };
}

/** Load (and cache) product/plan ID maps from the backend. */
export async function loadIdMaps(token?: string | null): Promise<IdMaps> {
  if (cached) return cached;
  if (!fetchPromise) {
    fetchPromise = fetchMaps(token).then((maps) => {
      cached = maps;
      fetchPromise = null;
      return maps;
    }).catch((err) => {
      fetchPromise = null;
      // Return empty maps; static fallback will be used
      console.warn("[backendIds] Failed to fetch ID maps:", err);
      return { products: new Map(), plans: new Map() };
    });
  }
  return fetchPromise;
}

/** Invalidate the cache (call after seed or backend changes). */
export function clearIdCache(): void {
  cached = null;
  fetchPromise = null;
}

// ── Name normalisation helpers ───────────────────────────────────────────

/**
 * Normalise a frontend product name to a lookup key.
 * Handles names like "Boneless Beef", slugs like "preset-boneless-beef-0",
 * and display names like "Agemawo (Beef + Skin)".
 */
function normalizeProductKey(input: string): string {
  return input
    .toLowerCase()
    .replace(/^preset-/, "")       // strip preset- prefix
    .replace(/-\d+$/, "")          // strip trailing index (-0, -1, …)
    .replace(/-/g, " ")            // hyphens → spaces
    .trim();
}

// ── Public resolvers ─────────────────────────────────────────────────────

/**
 * Resolve a frontend product identifier (name, slug, or preset-id) to a
 * backend MongoDB ObjectId. Returns undefined if no match.
 */
export function resolveProductId(
  input: string,
  maps: IdMaps,
): string | undefined {
  if (!input) return undefined;

  // Already looks like a MongoDB ObjectId (24 hex chars)
  if (/^[a-f0-9]{24}$/i.test(input)) return input;

  const key = normalizeProductKey(input);

  // 1. Try runtime map (exact name or slug)
  const fromRuntime = maps.products.get(key)
    || maps.products.get(input.toLowerCase());
  if (fromRuntime) return fromRuntime;

  // 2. Try static fallback
  const fromStatic = STATIC_PRODUCT_MAP[key]
    || STATIC_PRODUCT_MAP[input.toLowerCase()];
  if (fromStatic) return fromStatic;

  // 3. Fuzzy: check if any runtime key contains our key or vice versa
  for (const [mapKey, id] of maps.products) {
    if (mapKey.includes(key) || key.includes(mapKey)) return id;
  }
  for (const [mapKey, id] of Object.entries(STATIC_PRODUCT_MAP)) {
    if (mapKey.includes(key) || key.includes(mapKey)) return id;
  }

  return undefined;
}

/**
 * Resolve a frontend plan id (e.g. "essential", "value-pack") to a
 * backend MongoDB ObjectId.
 */
export function resolvePlanId(
  input: string,
  maps: IdMaps,
): string | undefined {
  if (!input) return undefined;
  if (/^[a-f0-9]{24}$/i.test(input)) return input;

  const key = input.toLowerCase().replace(/\s+/g, "-");

  // Runtime map
  const fromRuntime = maps.plans.get(key)
    || maps.plans.get(input.toLowerCase());
  if (fromRuntime) return fromRuntime;

  // Static fallback
  return STATIC_PLAN_MAP[key] || STATIC_PLAN_MAP[input.toLowerCase()];
}
