#!/usr/bin/env node
/**
 * MeatNG Backend Seed Script
 * ===========================
 * Seeds the backend with all product categories, products, and plans
 * needed for the MeatNG marketplace frontend.
 *
 * USAGE:
 *   node scripts/seed-backend.cjs
 *
 * ENVIRONMENT:
 *   API_BASE_URL  — Backend URL (default: https://meatng-api.onrender.com)
 *   ADMIN_EMAIL   — Admin login email (default: admin@meatng.com)
 *   ADMIN_PASSWORD — Admin login password (default: admin123)
 *
 * WHAT THIS SCRIPT DOES:
 *   1. Logs in as admin to get auth token
 *   2. Uploads a placeholder image (needed for product creation)
 *   3. Creates 8 product categories (chicken, beef, ram, goat, sausage, bones, offals, premium-cuts)
 *   4. Creates 30 products across all categories
 *   5. Creates 4 subscription plans (Value Pack, Essential, Signature, Premium)
 *   6. Prints a JSON ID mapping file for frontend integration
 *
 * NOTE: This script is idempotent-ish — it skips items that already exist (by name).
 *       Run it again safely if it fails partway through.
 */

const BASE_URL = process.env.API_BASE_URL || "https://meatng-api.onrender.com";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@meatng.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

// ─── Helpers ──────────────────────────────────────────────────

async function api(path, { method = "GET", body, token } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);

  const res = await fetch(`${BASE_URL}${path}`, opts);
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = text; }

  if (!res.ok) {
    const msg = data?.message || data?.error || text;
    throw new Error(`${method} ${path} → ${res.status}: ${JSON.stringify(msg)}`);
  }
  return data;
}

async function uploadPlaceholderImage(token) {
  // Create a tiny 1x1 red PNG as placeholder
  const pngBase64 =
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==";
  const pngBuffer = Buffer.from(pngBase64, "base64");

  const boundary = "----SeedScript" + Date.now();
  const bodyParts = [
    `--${boundary}\r\n`,
    `Content-Disposition: form-data; name="image"; filename="placeholder.png"\r\n`,
    `Content-Type: image/png\r\n\r\n`,
  ];
  const bodyEnd = `\r\n--${boundary}--\r\n`;

  const bodyBuffer = Buffer.concat([
    Buffer.from(bodyParts.join("")),
    pngBuffer,
    Buffer.from(bodyEnd),
  ]);

  const res = await fetch(`${BASE_URL}/upload`, {
    method: "POST",
    headers: {
      "Content-Type": `multipart/form-data; boundary=${boundary}`,
      Authorization: `Bearer ${token}`,
    },
    body: bodyBuffer,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(`Upload failed: ${JSON.stringify(data)}`);

  // Extract temp_id from response (JSON:API nested format)
  const tempId =
    data?.data?.attributes?.data?.temp_id ||
    data?.tempId || data?.temp_id || data?.id || data?.data?.tempId || data?.data?.id ||
    data?.data?.attributes?.tempId || data?.data?.attributes?.id;

  if (!tempId) {
    console.log("  Upload response:", JSON.stringify(data, null, 2));
    throw new Error("Could not extract temp_id from upload response");
  }

  return tempId;
}

// Parse JSON:API response to get array of {id, ...attributes}
function parseJsonApi(response) {
  const items = response?.data || [];
  if (!Array.isArray(items)) {
    if (items.id) return [{ id: items.id, ...(items.attributes || {}) }];
    return [];
  }
  return items.map((item) => ({
    id: item.id,
    ...(item.attributes || {}),
  }));
}

function parseJsonApiSingle(response) {
  const item = response?.data;
  if (!item) return null;
  if (Array.isArray(item)) return item[0] ? { id: item[0].id, ...(item[0].attributes || {}) } : null;
  return { id: item.id, ...(item.attributes || {}) };
}

// ─── Data definitions ─────────────────────────────────────────

const CATEGORIES = [
  { slug: "chicken", name: "Chicken", description: "Fresh chicken products" },
  { slug: "beef", name: "Beef", description: "Premium beef cuts" },
  { slug: "ram", name: "Ram", description: "Fresh ram/mutton products" },
  { slug: "goat", name: "Goat", description: "Fresh goat meat products" },
  { slug: "sausage", name: "Sausage", description: "Beef and chicken sausages" },
  { slug: "bones", name: "Bones", description: "Soft bones for stock and soups" },
  { slug: "offals", name: "Offals", description: "Organ meats and offal products" },
  { slug: "premium-cuts", name: "Premium Cuts", description: "Premium and specialty cuts" },
];

// Products: frontendId is our local ID used in src/data/products.ts
const PRODUCTS = [
  // ── Chicken ──
  { frontendId: "whole-chicken", name: "Whole Chicken", category: "chicken", weightG: 1500, price: 4500, packSize: "1.5-2kg", description: "Fresh whole chicken, cleaned and ready for roasting, grilling, or stews." },
  { frontendId: "chicken-thighs", name: "Chicken Thighs", category: "chicken", weightG: 1000, price: 3800, packSize: "1kg", description: "Juicy chicken thighs, perfect for grilling, frying, or adding to rice dishes." },
  { frontendId: "chicken-wings", name: "Chicken Wings", category: "chicken", weightG: 1000, price: 3200, packSize: "1kg", description: "Crispy chicken wings, ideal for frying, grilling, or making spicy pepper soup." },
  { frontendId: "chicken-breast", name: "Chicken Breast", category: "chicken", weightG: 500, price: 3000, packSize: "500g", description: "Lean chicken breast, boneless and skinless." },
  { frontendId: "drumstick", name: "Drumstick", category: "chicken", weightG: 500, price: 3000, packSize: "500g", description: "Meaty chicken drumsticks, perfect for frying, grilling, or baking." },

  // ── Beef ──
  { frontendId: "beef-deboned", name: "Beef Deboned", category: "beef", weightG: 1000, price: 5500, packSize: "1kg", description: "Lean beef with bones removed, cubed and ready for cooking." },
  { frontendId: "beef-bone-in", name: "Beef Bone-In", category: "beef", weightG: 1000, price: 4800, packSize: "1kg", description: "Beef with bone, adds rich flavor to soups and stews." },
  { frontendId: "cow-leg", name: "Cow Leg (Bokoto)", category: "beef", weightG: 1000, price: 5000, packSize: "1kg", description: "Cow leg cut into pieces, cleaned and ready for pepper soup." },
  { frontendId: "cow-tail", name: "Cow Tail (Oxtail)", category: "beef", weightG: 1000, price: 6500, packSize: "1kg", description: "Premium oxtail, perfect for slow-cooking." },

  // ── Offals ──
  { frontendId: "gizzard", name: "Gizzard", category: "offals", weightG: 500, price: 2500, packSize: "500g", description: "Fresh chicken gizzards, cleaned and ready." },
  { frontendId: "liver", name: "Beef Liver", category: "offals", weightG: 500, price: 2500, packSize: "500g", description: "Fresh beef liver, cleaned and sliced." },
  { frontendId: "shaki", name: "Shaki (Tripe)", category: "offals", weightG: 1000, price: 3500, packSize: "1kg", description: "Cow tripe thoroughly cleaned and softened." },
  { frontendId: "ponmo", name: "Ponmo (Cow Skin)", category: "offals", weightG: 500, price: 2000, packSize: "500g", description: "Processed cow skin, soft and ready for cooking." },
  { frontendId: "abodi", name: "Abodi", category: "offals", weightG: 500, price: 3400, packSize: "500g", description: "Cow abomasum (fourth stomach), a traditional delicacy." },
  { frontendId: "cow-tongue", name: "Cow Tongue", category: "offals", weightG: 500, price: 3500, packSize: "500g", description: "Beef tongue, cleaned and ready." },
  { frontendId: "roundabout", name: "Roundabout (Intestine)", category: "offals", weightG: 500, price: 3000, packSize: "500g", description: "Cleaned cow intestine, a delicacy in pepper soup." },
  { frontendId: "kidney", name: "Beef Kidney", category: "offals", weightG: 500, price: 2800, packSize: "500g", description: "Fresh beef kidney, cleaned and ready." },

  // ── Ram ──
  { frontendId: "ram-bone-in", name: "Ram Bone-In", category: "ram", weightG: 1000, price: 6000, packSize: "1kg", description: "Ram meat with bone, rich and flavorful." },
  { frontendId: "ram-assorted", name: "Ram Assorted", category: "ram", weightG: 1000, price: 5500, packSize: "1kg", description: "Mixed ram cuts including leg, shoulder, and ribs." },
  { frontendId: "ram-deboned", name: "Ram Deboned", category: "ram", weightG: 1000, price: 7000, packSize: "1kg", description: "Premium boneless ram meat, cubed and ready." },

  // ── Goat ──
  { frontendId: "goat-bone-in", name: "Goat Bone-In", category: "goat", weightG: 1000, price: 5800, packSize: "1kg", description: "Fresh goat meat with bone, tender and aromatic." },
  { frontendId: "goat-assorted", name: "Goat Assorted", category: "goat", weightG: 1000, price: 5200, packSize: "1kg", description: "Mixed goat cuts for variety." },
  { frontendId: "goat-deboned", name: "Goat Deboned", category: "goat", weightG: 1000, price: 6800, packSize: "1kg", description: "Premium boneless goat meat, tender and ready." },

  // ── Sausage ──
  { frontendId: "beef-sausage", name: "Beef Sausage", category: "sausage", weightG: 400, price: 3200, packSize: "400g", description: "Seasoned beef sausages." },
  { frontendId: "chicken-sausage", name: "Chicken Sausage", category: "sausage", weightG: 400, price: 3000, packSize: "400g", description: "Lighter chicken sausages." },

  // ── Bones ──
  { frontendId: "soft-bones", name: "Soft Bones", category: "bones", weightG: 1000, price: 2500, packSize: "1kg", description: "Soft edible bones, perfect for stock and soups." },

  // ── Premium Cuts ──
  { frontendId: "steak", name: "Prime Steak", category: "premium-cuts", weightG: 500, price: 8500, packSize: "500g", description: "Premium beef steak, aged and cut to perfection." },
  { frontendId: "ribs", name: "Beef Ribs", category: "premium-cuts", weightG: 1000, price: 7500, packSize: "1kg", description: "Meaty beef ribs, perfect for slow-cooking and BBQ." },
  { frontendId: "heart", name: "Beef Heart", category: "premium-cuts", weightG: 500, price: 3500, packSize: "500g", description: "Lean and flavorful beef heart, sliced and ready." },

  // ── Build-your-box extras (not in main catalog but used in plans) ──
  { frontendId: "agemawo", name: "Agemawo (Beef + Skin)", category: "beef", weightG: 1000, price: 7000, packSize: "1kg", description: "Beef and skin combo, popular in Nigerian cuisine." },
  { frontendId: "minced-meat", name: "Minced Meat", category: "beef", weightG: 1000, price: 7500, packSize: "1kg", description: "Freshly minced beef, versatile for many dishes." },
  { frontendId: "plain-beef", name: "Plain Beef", category: "beef", weightG: 1000, price: 6500, packSize: "1kg", description: "Basic beef cuts for everyday cooking." },
  { frontendId: "torso-beef", name: "Torso Beef", category: "beef", weightG: 1000, price: 7500, packSize: "1kg", description: "Beef torso cuts, great for stews." },
  { frontendId: "shin", name: "Shin", category: "beef", weightG: 1000, price: 6500, packSize: "1kg", description: "Beef shin, ideal for slow-cooking." },
  { frontendId: "lungs", name: "Fuku (Lungs)", category: "offals", weightG: 500, price: 2400, packSize: "500g", description: "Beef lungs, cleaned and ready." },
  { frontendId: "minced-chicken", name: "Minced Chicken", category: "chicken", weightG: 1000, price: 6500, packSize: "1kg", description: "Freshly minced chicken." },
  { frontendId: "chicken-cut4", name: "Chicken Cut 4", category: "chicken", weightG: 1000, price: 4500, packSize: "1kg", description: "Chicken cut into 4 pieces." },
  { frontendId: "chicken-laps", name: "Laps (Thigh & Drumstick)", category: "chicken", weightG: 500, price: 2500, packSize: "500g", description: "Chicken thigh and drumstick combo." },
  { frontendId: "sausages-generic", name: "Sausages", category: "sausage", weightG: 1000, price: 7500, packSize: "1kg", description: "Mixed sausages pack." },
];

// Plans map to frontend plan IDs: value-pack, essential, signature, premium
const PLANS = [
  {
    frontendId: "value-pack",
    name: "Value Pack",
    description: "3kg mixed cuts — beef & offals. Choose 3 offals to complete your box.",
    price: 20000,
    weightKg: 3,
    maxItems: 6,
    planType: "custom",
    pricingModel: "fixed",
    // category_rules will be filled with real category IDs
    categoryRules: [
      { categorySlug: "beef", label: "Beef Selections", minItems: 2, maxItems: 3 },
      { categorySlug: "offals", label: "Offal Picks", minItems: 0, maxItems: 3 },
    ],
  },
  {
    frontendId: "essential",
    name: "Essential Box",
    description: "5kg mixed cuts — beef, chicken & offals. Choose 4 offals to personalise.",
    price: 35000,
    weightKg: 5,
    maxItems: 8,
    planType: "custom",
    pricingModel: "fixed",
    categoryRules: [
      { categorySlug: "beef", label: "Beef Selections", minItems: 2, maxItems: 3 },
      { categorySlug: "chicken", label: "Chicken Selections", minItems: 1, maxItems: 2 },
      { categorySlug: "offals", label: "Offal Picks", minItems: 0, maxItems: 4 },
    ],
  },
  {
    frontendId: "signature",
    name: "Signature Box",
    description: "10kg customisable — 5kg mandatory cuts, then build the rest your way.",
    price: 70000,
    weightKg: 10,
    maxItems: 15,
    planType: "custom",
    pricingModel: "fixed",
    categoryRules: [
      { categorySlug: "beef", label: "Beef", minItems: 2, maxItems: 8 },
      { categorySlug: "chicken", label: "Chicken", minItems: 1, maxItems: 6 },
      { categorySlug: "offals", label: "Offals", minItems: 0, maxItems: 6 },
    ],
  },
  {
    frontendId: "premium",
    name: "Premium Box",
    description: "15kg premium cuts — 5kg mandatory, then build 10kg however you like.",
    price: 110000,
    weightKg: 15,
    maxItems: 20,
    planType: "custom",
    pricingModel: "fixed",
    categoryRules: [
      { categorySlug: "beef", label: "Beef", minItems: 2, maxItems: 10 },
      { categorySlug: "chicken", label: "Chicken", minItems: 1, maxItems: 8 },
      { categorySlug: "offals", label: "Offals", minItems: 0, maxItems: 8 },
      { categorySlug: "premium-cuts", label: "Premium Cuts", minItems: 0, maxItems: 4 },
    ],
  },
];

// ─── Main ─────────────────────────────────────────────────────

async function main() {
  console.log("=".repeat(60));
  console.log("MeatNG Backend Seed Script");
  console.log("=".repeat(60));
  console.log(`API: ${BASE_URL}`);
  console.log();

  // 1. Login
  console.log("1. Logging in as admin...");
  let token;
  try {
    const authResult = await api("/auth/login", {
      method: "POST",
      body: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
    });
    token =
      authResult?.data?.attributes?.data?.token?.accessToken ||
      authResult?.token ||
      authResult?.data?.token ||
      authResult?.data?.attributes?.token ||
      authResult?.access_token;
    if (!token) {
      console.log("  Auth response:", JSON.stringify(authResult, null, 2));
      throw new Error("No token in auth response");
    }
    console.log("  ✓ Logged in successfully");
  } catch (err) {
    console.error("  ✗ Login failed:", err.message);
    console.error("  Make sure ADMIN_EMAIL and ADMIN_PASSWORD are correct.");
    process.exit(1);
  }

  // 2. Upload placeholder image
  console.log("\n2. Uploading placeholder image...");
  let tempImageId;
  try {
    tempImageId = await uploadPlaceholderImage(token);
    console.log(`  ✓ Placeholder image uploaded: ${tempImageId}`);
  } catch (err) {
    console.error("  ✗ Image upload failed:", err.message);
    console.error("  Products require an image. Please check the /upload endpoint.");
    process.exit(1);
  }

  // 3. Create categories
  console.log("\n3. Creating product categories...");
  const existingCats = parseJsonApi(await api("/product-categories", { token }));
  const categoryMap = {}; // slug → backendId

  // Map existing
  for (const cat of existingCats) {
    const slug = cat.slug || cat.name?.toLowerCase().replace(/\s+/g, "-");
    if (slug) categoryMap[slug] = cat.id;
  }

  for (const cat of CATEGORIES) {
    if (categoryMap[cat.slug]) {
      console.log(`  – ${cat.name} (${cat.slug}) → already exists: ${categoryMap[cat.slug]}`);
      continue;
    }
    try {
      const result = await api("/product-categories", {
        method: "POST",
        token,
        body: { name: cat.name, slug: cat.slug, description: cat.description, status: "active" },
      });
      const created = parseJsonApiSingle(result);
      categoryMap[cat.slug] = created?.id || result?.id;
      console.log(`  ✓ ${cat.name} → ${categoryMap[cat.slug]}`);
    } catch (err) {
      console.error(`  ✗ ${cat.name}: ${err.message}`);
    }
  }

  console.log("\n  Category ID Map:");
  for (const [slug, id] of Object.entries(categoryMap)) {
    console.log(`    ${slug} → ${id}`);
  }

  // 4. Create products
  console.log("\n4. Creating products...");
  const existingProds = parseJsonApi(await api("/products", { token }));
  const productMap = {}; // frontendId → backendId

  // Map existing by name
  const existingByName = {};
  for (const p of existingProds) {
    existingByName[p.name?.toLowerCase()] = p.id;
  }

  for (const prod of PRODUCTS) {
    const existingId = existingByName[prod.name.toLowerCase()];
    if (existingId) {
      productMap[prod.frontendId] = existingId;
      console.log(`  – ${prod.name} → already exists: ${existingId}`);
      continue;
    }

    const catId = categoryMap[prod.category];
    const unit = prod.weightG >= 1000 ? "kg" : "g";
    const mainValue = prod.weightG >= 1000 ? prod.weightG / 1000 : prod.weightG;

    try {
      // Upload a fresh image for each product (temp_id is single-use)
      const prodImageId = await uploadPlaceholderImage(token);
      const result = await api("/products", {
        method: "POST",
        token,
        body: {
          name: prod.name,
          slug: prod.frontendId,
          price: prod.price,
          description: prod.description,
          displayType: "total_weight",
          mainValue,
          unit,
          stockQuantity: 100,
          status: "active",
          categories: catId ? [catId] : [],
          temp_id: prodImageId,
          tags: [prod.packSize],
        },
      });
      const created = parseJsonApiSingle(result);
      productMap[prod.frontendId] = created?.id || result?.id;
      console.log(`  ✓ ${prod.name} (${prod.frontendId}) → ${productMap[prod.frontendId]}`);
    } catch (err) {
      console.error(`  ✗ ${prod.name}: ${err.message}`);
    }
  }

  // 5. Create plans
  console.log("\n5. Creating plans...");
  const existingPlans = parseJsonApi(await api("/plans", { token }));
  const planMap = {}; // frontendId → backendId

  const existingPlansByName = {};
  for (const p of existingPlans) {
    existingPlansByName[p.name?.toLowerCase()] = p.id;
  }

  for (const plan of PLANS) {
    const existingId = existingPlansByName[plan.name.toLowerCase()];
    if (existingId) {
      planMap[plan.frontendId] = existingId;
      console.log(`  – ${plan.name} → already exists: ${existingId}`);
      continue;
    }

    // Build category_rules with real IDs
    const categoryRules = plan.categoryRules
      .map((rule) => {
        const catId = categoryMap[rule.categorySlug];
        if (!catId) {
          console.warn(`    ⚠ Category ${rule.categorySlug} not found, skipping rule`);
          return null;
        }
        return {
          category_id: catId,
          label: rule.label,
          min_items: rule.minItems,
          max_items: rule.maxItems,
        };
      })
      .filter(Boolean);

    try {
      const planImageId = await uploadPlaceholderImage(token);
      const result = await api("/plans", {
        method: "POST",
        token,
        body: {
          name: plan.name,
          description: plan.description,
          price: plan.price,
          max_items: plan.maxItems,
          weight: plan.weightKg,
          weight_unit: "kg",
          is_active: true,
          plan_type: plan.planType,
          pricing_model: plan.pricingModel,
          category_rules: categoryRules.length > 0 ? categoryRules : undefined,
          temp_image_id: planImageId,
        },
      });
      const created = parseJsonApiSingle(result);
      planMap[plan.frontendId] = created?.id || result?.id;
      console.log(`  ✓ ${plan.name} (${plan.frontendId}) → ${planMap[plan.frontendId]}`);
    } catch (err) {
      console.error(`  ✗ ${plan.name}: ${err.message}`);
    }
  }

  // 6. Print summary
  console.log("\n" + "=".repeat(60));
  console.log("SEED COMPLETE — ID MAPPING");
  console.log("=".repeat(60));

  const mapping = {
    categories: categoryMap,
    products: productMap,
    plans: planMap,
  };

  console.log(JSON.stringify(mapping, null, 2));

  // Also write to file
  const fs = require("fs");
  const outPath = __dirname + "/backend-id-mapping.json";
  fs.writeFileSync(outPath, JSON.stringify(mapping, null, 2));
  console.log(`\nMapping saved to: ${outPath}`);

  // Print stats
  const catCount = Object.keys(categoryMap).length;
  const prodCount = Object.keys(productMap).length;
  const planCount = Object.keys(planMap).length;
  console.log(`\nCreated: ${catCount} categories, ${prodCount} products, ${planCount} plans`);

  if (prodCount < PRODUCTS.length) {
    console.log(`\n⚠ ${PRODUCTS.length - prodCount} products failed to create.`);
    console.log("  The most common cause is the temp_id (image upload) being single-use.");
    console.log("  If so, the backend dev should either:");
    console.log("    a) Allow reusing temp_ids, or");
    console.log("    b) Make the temp_id field optional for seeding");
  }
}

main().catch((err) => {
  console.error("\nFatal error:", err);
  process.exit(1);
});
