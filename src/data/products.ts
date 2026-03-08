import { PlanTier } from './plans';

// Product categories aligned with PRD
export type ProductCategory = 
  | 'chicken'
  | 'beef'
  | 'ram'
  | 'goat'
  | 'sausage'
  | 'bones'
  | 'offals'
  | 'premium-cuts';

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  packSize: string;
  weightG: number; // weight in grams (for box builder weight tracking)
  description: string;
  bestFor: string[]; // Nigerian cooking contexts
  storageGuidance: string;
  handlingNotes?: string;
  image: string;
  eligiblePlans: PlanTier[]; // Which plans can select this product
  addOnPrice: number; // Price when purchased as add-on
  isPremiumDrop?: boolean;
}

export interface GiftBox {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  estimatedWeight: string;
  contents: { productId: string; quantity: number }[];
  displayContents?: string[];
}

export const categories: { id: ProductCategory; name: string; image: string }[] = [
  { id: 'chicken', name: 'Chicken', image: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=400' },
  { id: 'beef', name: 'Beef', image: 'https://images.unsplash.com/photo-1602470520998-f4a52199a3d6?w=400' },
  { id: 'ram', name: 'Ram', image: 'https://images.unsplash.com/photo-1558030006-450675393462?w=400' },
  { id: 'goat', name: 'Goat', image: 'https://images.unsplash.com/photo-1602470520998-f4a52199a3d6?w=400' },
  { id: 'sausage', name: 'Sausage', image: 'https://images.unsplash.com/photo-1603048297172-c92544798d5a?w=400' },
  { id: 'bones', name: 'Bones', image: 'https://images.unsplash.com/photo-1588347818036-558601350947?w=400' },
  { id: 'offals', name: 'Offals', image: 'https://images.unsplash.com/photo-1602470520998-f4a52199a3d6?w=400' },
  { id: 'premium-cuts', name: 'Premium Cuts', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400' },
];

export const products: Product[] = [
  // === CHICKEN (Value Pack+) ===
  {
    id: 'whole-chicken',
    name: 'Whole Chicken',
    category: 'chicken',
    packSize: '1.5-2kg',
    weightG: 1500,
    description: 'Fresh whole chicken, cleaned and ready for roasting, grilling, or stews. Carefully processed with feathers and innards removed.',
    bestFor: ['Roasting', 'Pepper soup', 'Stew', 'Grilling'],
    storageGuidance: 'Keep refrigerated at 0-4°C. Best consumed within 2 days. Can be frozen for up to 6 months.',
    image: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=600',
    eligiblePlans: ['value-pack', 'essential', 'signature', 'premium'],
    addOnPrice: 4500,
  },
  {
    id: 'chicken-thighs',
    name: 'Chicken Thighs',
    category: 'chicken',
    packSize: '1kg',
    weightG: 1000,
    description: 'Juicy chicken thighs, perfect for grilling, frying, or adding to rice dishes. Skin-on for extra flavor.',
    bestFor: ['Jollof rice', 'Grilling', 'Frying', 'Stew'],
    storageGuidance: 'Keep refrigerated at 0-4°C. Best consumed within 2 days. Can be frozen for up to 6 months.',
    image: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=600',
    eligiblePlans: ['value-pack', 'essential', 'signature', 'premium'],
    addOnPrice: 3800,
  },
  {
    id: 'chicken-wings',
    name: 'Chicken Wings',
    category: 'chicken',
    packSize: '1kg',
    weightG: 1000,
    description: 'Crispy chicken wings, ideal for frying, grilling, or making spicy pepper soup.',
    bestFor: ['Frying', 'Grilling', 'Pepper soup', 'BBQ'],
    storageGuidance: 'Keep refrigerated at 0-4°C. Best consumed within 2 days. Can be frozen for up to 6 months.',
    image: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=600',
    eligiblePlans: ['value-pack', 'essential', 'signature', 'premium'],
    addOnPrice: 3200,
  },
  {
    id: 'chicken-breast',
    name: 'Chicken Breast',
    category: 'chicken',
    packSize: '500g',
    weightG: 500,
    description: 'Lean chicken breast, boneless and skinless. Versatile for healthy meals and quick cooking.',
    bestFor: ['Grilling', 'Stir-fry', 'Salads', 'Quick meals'],
    storageGuidance: 'Keep refrigerated at 0-4°C. Best consumed within 2 days. Can be frozen for up to 6 months.',
    image: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=600',
    eligiblePlans: ['essential', 'signature', 'premium'],
    addOnPrice: 3000,
  },
  {
    id: 'drumstick',
    name: 'Drumstick',
    category: 'chicken',
    packSize: '500g',
    weightG: 500,
    description: 'Meaty chicken drumsticks, perfect for frying, grilling, or baking.',
    bestFor: ['Frying', 'Grilling', 'Baking', 'Jollof rice'],
    storageGuidance: 'Keep refrigerated at 0-4°C. Best consumed within 2 days. Can be frozen for up to 6 months.',
    image: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=600',
    eligiblePlans: ['value-pack', 'essential', 'signature', 'premium'],
    addOnPrice: 3000,
  },
  {
    id: 'gizzard',
    name: 'Gizzard',
    category: 'offals',
    packSize: '500g',
    weightG: 500,
    description: 'Fresh chicken gizzards, cleaned and ready. A beloved Nigerian delicacy.',
    bestFor: ['Frying', 'Pepper soup', 'Stew', 'Gizdodo'],
    storageGuidance: 'Keep refrigerated at 0-4°C. Use within 24 hours. Can be frozen for up to 2 months.',
    image: 'https://images.unsplash.com/photo-1602470520998-f4a52199a3d6?w=600',
    eligiblePlans: ['value-pack', 'essential', 'signature', 'premium'],
    addOnPrice: 2500,
  },

  // === BEEF (Value Pack+) ===
  {
    id: 'beef-deboned',
    name: 'Beef Deboned',
    category: 'beef',
    packSize: '1kg',
    weightG: 1000,
    description: 'Lean beef with bones removed, cubed and ready for cooking. Perfect for quick stews and stir-fries.',
    bestFor: ['Stew', 'Stir-fry', 'Suya', 'Kebab'],
    storageGuidance: 'Keep refrigerated at 0-4°C. Best consumed within 3 days. Can be frozen for up to 4 months.',
    image: 'https://images.unsplash.com/photo-1602470520998-f4a52199a3d6?w=600',
    eligiblePlans: ['value-pack', 'essential', 'signature', 'premium'],
    addOnPrice: 5500,
  },
  {
    id: 'beef-bone-in',
    name: 'Beef Bone-In',
    category: 'beef',
    packSize: '1kg',
    weightG: 1000,
    description: 'Beef with bone, adds rich flavor to soups and stews. Traditional cut for authentic Nigerian dishes.',
    bestFor: ['Pepper soup', 'Egusi soup', 'Stew', 'Stock'],
    storageGuidance: 'Keep refrigerated at 0-4°C. Best consumed within 3 days. Can be frozen for up to 4 months.',
    image: 'https://images.unsplash.com/photo-1602470520998-f4a52199a3d6?w=600',
    eligiblePlans: ['value-pack', 'essential', 'signature', 'premium'],
    addOnPrice: 4800,
  },
  {
    id: 'cow-leg',
    name: 'Cow Leg (Bokoto)',
    category: 'beef',
    packSize: '1kg',
    weightG: 1000,
    description: 'Cow leg cut into pieces, cleaned and ready for pepper soup or assorted meat dishes.',
    bestFor: ['Pepper soup', 'Assorted meat', 'Nkwobi'],
    storageGuidance: 'Keep refrigerated at 0-4°C. Best consumed within 2 days. Can be frozen for up to 3 months.',
    image: 'https://images.unsplash.com/photo-1602470520998-f4a52199a3d6?w=600',
    eligiblePlans: ['value-pack', 'essential', 'signature', 'premium'],
    addOnPrice: 5000,
  },

  // === OFFALS (Value Pack+) ===
  {
    id: 'liver',
    name: 'Beef Liver',
    category: 'offals',
    packSize: '500g',
    weightG: 500,
    description: 'Fresh beef liver, cleaned and sliced. Rich in iron and perfect for frying or stews.',
    bestFor: ['Frying', 'Stew', 'Pepper soup'],
    storageGuidance: 'Keep refrigerated at 0-4°C. Use within 24 hours. Can be frozen for up to 2 months.',
    image: 'https://images.unsplash.com/photo-1602470520998-f4a52199a3d6?w=600',
    eligiblePlans: ['value-pack', 'essential', 'signature', 'premium'],
    addOnPrice: 2500,
  },
  {
    id: 'shaki',
    name: 'Shaki (Tripe)',
    category: 'offals',
    packSize: '1kg',
    weightG: 1000,
    description: 'Cow tripe thoroughly cleaned and softened. Essential for authentic pepper soup and assorted meat.',
    bestFor: ['Pepper soup', 'Assorted meat', 'Isi ewu'],
    storageGuidance: 'Keep refrigerated at 0-4°C. Best consumed within 2 days. Can be frozen for up to 3 months.',
    image: 'https://images.unsplash.com/photo-1602470520998-f4a52199a3d6?w=600',
    eligiblePlans: ['value-pack', 'essential', 'signature', 'premium'],
    addOnPrice: 3500,
  },
  {
    id: 'ponmo',
    name: 'Ponmo (Cow Skin)',
    category: 'offals',
    packSize: '500g',
    weightG: 500,
    description: 'Processed cow skin, soft and ready for cooking. A Nigerian favorite in soups and stews.',
    bestFor: ['Egusi soup', 'Efo riro', 'Pepper soup', 'Stew'],
    storageGuidance: 'Keep refrigerated at 0-4°C. Best consumed within 5 days. Can be frozen for up to 4 months.',
    image: 'https://images.unsplash.com/photo-1602470520998-f4a52199a3d6?w=600',
    eligiblePlans: ['value-pack', 'essential', 'signature', 'premium'],
    addOnPrice: 2000,
  },
  {
    id: 'abodi',
    name: 'Abodi',
    category: 'offals',
    packSize: '500g',
    weightG: 500,
    description: 'Cow abomasum (fourth stomach), a traditional delicacy prized for its unique texture.',
    bestFor: ['Pepper soup', 'Assorted meat', 'Stew'],
    storageGuidance: 'Keep refrigerated at 0-4°C. Use within 24 hours. Can be frozen for up to 2 months.',
    image: 'https://images.unsplash.com/photo-1602470520998-f4a52199a3d6?w=600',
    eligiblePlans: ['signature', 'premium'],
    addOnPrice: 3400,
  },
  {
    id: 'cow-tongue',
    name: 'Cow Tongue',
    category: 'offals',
    packSize: '500g',
    weightG: 500,
    description: 'Beef tongue, cleaned and ready. Tender and flavorful when slow-cooked.',
    bestFor: ['Pepper soup', 'Stew', 'Slow cooking'],
    storageGuidance: 'Keep refrigerated at 0-4°C. Use within 24 hours. Can be frozen for up to 2 months.',
    image: 'https://images.unsplash.com/photo-1602470520998-f4a52199a3d6?w=600',
    eligiblePlans: ['premium'],
    addOnPrice: 3500,
  },

  // === SIGNATURE TIER ===
  {
    id: 'cow-tail',
    name: 'Cow Tail (Oxtail)',
    category: 'beef',
    packSize: '1kg',
    weightG: 1000,
    description: 'Premium oxtail, perfect for slow-cooking. Rich, gelatinous texture that makes incredible stews.',
    bestFor: ['Pepper soup', 'Stew', 'Slow cooking'],
    storageGuidance: 'Keep refrigerated at 0-4°C. Best consumed within 3 days. Can be frozen for up to 4 months.',
    image: 'https://images.unsplash.com/photo-1602470520998-f4a52199a3d6?w=600',
    eligiblePlans: ['signature', 'premium'],
    addOnPrice: 6500,
  },
  {
    id: 'roundabout',
    name: 'Roundabout (Intestine)',
    category: 'offals',
    packSize: '500g',
    weightG: 500,
    description: 'Cleaned cow intestine, a delicacy in pepper soup and isi ewu.',
    bestFor: ['Pepper soup', 'Isi ewu', 'Assorted meat'],
    storageGuidance: 'Keep refrigerated at 0-4°C. Use within 24 hours. Can be frozen for up to 2 months.',
    image: 'https://images.unsplash.com/photo-1602470520998-f4a52199a3d6?w=600',
    eligiblePlans: ['signature', 'premium'],
    addOnPrice: 3000,
  },
  {
    id: 'kidney',
    name: 'Beef Kidney',
    category: 'offals',
    packSize: '500g',
    weightG: 500,
    description: 'Fresh beef kidney, cleaned and ready. Rich, distinctive flavor for adventurous cooks.',
    bestFor: ['Frying', 'Stew', 'Pepper soup'],
    storageGuidance: 'Keep refrigerated at 0-4°C. Use within 24 hours. Can be frozen for up to 2 months.',
    image: 'https://images.unsplash.com/photo-1602470520998-f4a52199a3d6?w=600',
    eligiblePlans: ['signature', 'premium'],
    addOnPrice: 2800,
  },
  {
    id: 'ram-bone-in',
    name: 'Ram Bone-In',
    category: 'ram',
    packSize: '1kg',
    weightG: 1000,
    description: 'Ram meat with bone, rich and flavorful. Traditional choice for celebrations and special occasions.',
    bestFor: ['Pepper soup', 'Stew', 'Suya', 'Celebration dishes'],
    storageGuidance: 'Keep refrigerated at 0-4°C. Best consumed within 3 days. Can be frozen for up to 4 months.',
    image: 'https://images.unsplash.com/photo-1558030006-450675393462?w=600',
    eligiblePlans: ['signature', 'premium'],
    addOnPrice: 6000,
  },
  {
    id: 'ram-assorted',
    name: 'Ram Assorted',
    category: 'ram',
    packSize: '1kg',
    weightG: 1000,
    description: 'Mixed ram cuts including leg, shoulder, and ribs. Great variety for large gatherings.',
    bestFor: ['Pepper soup', 'Egusi soup', 'Stew'],
    storageGuidance: 'Keep refrigerated at 0-4°C. Best consumed within 3 days. Can be frozen for up to 4 months.',
    image: 'https://images.unsplash.com/photo-1558030006-450675393462?w=600',
    eligiblePlans: ['signature', 'premium'],
    addOnPrice: 5500,
  },
  {
    id: 'goat-bone-in',
    name: 'Goat Bone-In',
    category: 'goat',
    packSize: '1kg',
    weightG: 1000,
    description: 'Fresh goat meat with bone, tender and aromatic. Perfect for traditional goat pepper soup.',
    bestFor: ['Pepper soup', 'Stew', 'Asun'],
    storageGuidance: 'Keep refrigerated at 0-4°C. Best consumed within 3 days. Can be frozen for up to 4 months.',
    image: 'https://images.unsplash.com/photo-1602470520998-f4a52199a3d6?w=600',
    eligiblePlans: ['signature', 'premium'],
    addOnPrice: 5800,
  },
  {
    id: 'goat-assorted',
    name: 'Goat Assorted',
    category: 'goat',
    packSize: '1kg',
    weightG: 1000,
    description: 'Mixed goat cuts for variety. Includes leg, shoulder, and choice pieces.',
    bestFor: ['Pepper soup', 'Stew', 'Isi ewu'],
    storageGuidance: 'Keep refrigerated at 0-4°C. Best consumed within 3 days. Can be frozen for up to 4 months.',
    image: 'https://images.unsplash.com/photo-1602470520998-f4a52199a3d6?w=600',
    eligiblePlans: ['signature', 'premium'],
    addOnPrice: 5200,
  },
  {
    id: 'beef-sausage',
    name: 'Beef Sausage',
    category: 'sausage',
    packSize: '400g',
    weightG: 400,
    description: 'Seasoned beef sausages, perfect for breakfast, grilling, or pasta dishes.',
    bestFor: ['Breakfast', 'Grilling', 'Pasta', 'Jollof'],
    storageGuidance: 'Keep refrigerated at 0-4°C. Best consumed within 5 days. Can be frozen for up to 2 months.',
    image: 'https://images.unsplash.com/photo-1603048297172-c92544798d5a?w=600',
    eligiblePlans: ['signature', 'premium'],
    addOnPrice: 3200,
  },
  {
    id: 'chicken-sausage',
    name: 'Chicken Sausage',
    category: 'sausage',
    packSize: '400g',
    weightG: 400,
    description: 'Lighter chicken sausages, great for health-conscious meals without sacrificing flavor.',
    bestFor: ['Breakfast', 'Grilling', 'Salads', 'Quick meals'],
    storageGuidance: 'Keep refrigerated at 0-4°C. Best consumed within 5 days. Can be frozen for up to 2 months.',
    image: 'https://images.unsplash.com/photo-1603048297172-c92544798d5a?w=600',
    eligiblePlans: ['signature', 'premium'],
    addOnPrice: 3000,
  },
  {
    id: 'soft-bones',
    name: 'Soft Bones',
    category: 'bones',
    packSize: '1kg',
    weightG: 1000,
    description: 'Soft edible bones, perfect for stock, soups, and adding depth to dishes.',
    bestFor: ['Stock', 'Pepper soup', 'Egusi soup'],
    storageGuidance: 'Keep refrigerated at 0-4°C. Best consumed within 3 days. Can be frozen for up to 4 months.',
    image: 'https://images.unsplash.com/photo-1588347818036-558601350947?w=600',
    eligiblePlans: ['signature', 'premium'],
    addOnPrice: 2500,
  },

  // === PREMIUM TIER ===
  {
    id: 'steak',
    name: 'Prime Steak',
    category: 'premium-cuts',
    packSize: '500g',
    weightG: 500,
    description: 'Premium beef steak, aged and cut to perfection. Restaurant-quality for home grilling.',
    bestFor: ['Grilling', 'Pan-searing', 'Special occasions'],
    storageGuidance: 'Keep refrigerated at 0-4°C. Best consumed within 3 days. Can be frozen for up to 3 months.',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600',
    eligiblePlans: ['premium'],
    addOnPrice: 8500,
    isPremiumDrop: true,
  },
  {
    id: 'ribs',
    name: 'Beef Ribs',
    category: 'premium-cuts',
    packSize: '1kg',
    weightG: 1000,
    description: 'Meaty beef ribs, perfect for slow-cooking, BBQ, or braising. Fall-off-the-bone tender.',
    bestFor: ['BBQ', 'Slow cooking', 'Braising', 'Grilling'],
    storageGuidance: 'Keep refrigerated at 0-4°C. Best consumed within 3 days. Can be frozen for up to 3 months.',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600',
    eligiblePlans: ['premium'],
    addOnPrice: 7500,
    isPremiumDrop: true,
  },
  {
    id: 'heart',
    name: 'Beef Heart',
    category: 'premium-cuts',
    packSize: '500g',
    weightG: 500,
    description: 'Lean and flavorful beef heart, sliced and ready. A nutrient-dense delicacy.',
    bestFor: ['Grilling', 'Stir-fry', 'Suya'],
    storageGuidance: 'Keep refrigerated at 0-4°C. Use within 24 hours. Can be frozen for up to 2 months.',
    image: 'https://images.unsplash.com/photo-1602470520998-f4a52199a3d6?w=600',
    eligiblePlans: ['premium'],
    addOnPrice: 3500,
    isPremiumDrop: true,
  },
  {
    id: 'ram-deboned',
    name: 'Ram Deboned',
    category: 'ram',
    packSize: '1kg',
    weightG: 1000,
    description: 'Premium boneless ram meat, cubed and ready. Maximum meat, zero waste.',
    bestFor: ['Suya', 'Kebab', 'Stir-fry', 'Special dishes'],
    storageGuidance: 'Keep refrigerated at 0-4°C. Best consumed within 3 days. Can be frozen for up to 4 months.',
    image: 'https://images.unsplash.com/photo-1558030006-450675393462?w=600',
    eligiblePlans: ['premium'],
    addOnPrice: 7000,
    isPremiumDrop: true,
  },
  {
    id: 'goat-deboned',
    name: 'Goat Deboned',
    category: 'goat',
    packSize: '1kg',
    weightG: 1000,
    description: 'Premium boneless goat meat, tender and ready for any preparation.',
    bestFor: ['Asun', 'Stir-fry', 'Curry', 'Special dishes'],
    storageGuidance: 'Keep refrigerated at 0-4°C. Best consumed within 3 days. Can be frozen for up to 4 months.',
    image: 'https://images.unsplash.com/photo-1602470520998-f4a52199a3d6?w=600',
    eligiblePlans: ['premium'],
    addOnPrice: 6800,
    isPremiumDrop: true,
  },
];

// Gift boxes for one-time purchase
export const giftBoxes: GiftBox[] = [
  {
    id: 'gift-classic',
    name: 'The Classic Box',
    description: '2.5kg mixed cuts (beef + offals), gift-ready and ideal for thoughtful sharing.',
    price: 15000,
    image: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=600',
    estimatedWeight: '2.5kg',
    contents: [
      { productId: 'beef-bone-in', quantity: 1 },
      { productId: 'chicken-thighs', quantity: 1 },
      { productId: 'gizzard', quantity: 1 },
      { productId: 'ponmo', quantity: 1 },
    ],
    displayContents: [
      'Bone in Beef - 500g',
      'Minced Meat - 250g',
      'Chicken Thigh - 500g',
      'Laps - 500g',
      'Gizzard - 250g',
      'Agemawo (Beef + Skin) - 250g',
      'Ponmo (Cow Skin) - 250g',
    ],
  },
  {
    id: 'gift-entertainer',
    name: 'Entertainer Box',
    description: '4kg mixed cuts (beef + chicken + offals) curated for hosting and festive meals.',
    price: 25000,
    image: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=600',
    estimatedWeight: '4kg',
    contents: [
      { productId: 'beef-deboned', quantity: 1 },
      { productId: 'cow-tail', quantity: 1 },
      { productId: 'chicken-thighs', quantity: 1 },
      { productId: 'chicken-wings', quantity: 1 },
      { productId: 'gizzard', quantity: 1 },
      { productId: 'shaki', quantity: 1 },
      { productId: 'liver', quantity: 1 },
    ],
    displayContents: [
      'Boneless Beef - 1kg',
      'Tail (Oxtail) - 500g',
      'Agemawo (Beef + Skin) - 400g',
      'Chicken Thigh - 500g',
      'Wings - 500g',
      'Gizzard - 500g',
      'Shaki - 200g',
      'Liver - 250g',
    ],
  },
  {
    id: 'gift-grand-celebration',
    name: 'The Grand Celebration Box',
    description: '6kg mixed cuts (customizable beef, chicken, offal) for larger celebrations.',
    price: 40000,
    image: 'https://images.unsplash.com/photo-1558030006-450675393462?w=600',
    estimatedWeight: '6kg',
    contents: [
      { productId: 'beef-deboned', quantity: 1 },
      { productId: 'beef-bone-in', quantity: 1 },
      { productId: 'shaki', quantity: 1 },
      { productId: 'roundabout', quantity: 1 },
      { productId: 'cow-tongue', quantity: 1 },
      { productId: 'chicken-thighs', quantity: 1 },
      { productId: 'drumstick', quantity: 1 },
      { productId: 'chicken-wings', quantity: 1 },
      { productId: 'gizzard', quantity: 1 },
      { productId: 'ponmo', quantity: 1 },
      { productId: 'liver', quantity: 1 },
      { productId: 'kidney', quantity: 1 },
    ],
    displayContents: [
      'Boneless Beef - 1kg',
      'Bone in Beef - 500g',
      'Agemawo (Beef + Skin) - 500g',
      'Shaki - 500g',
      'Roundabout (Small Intestine) - 500g',
      'Tongue - 500g',
      'Chicken Thigh - 500g',
      'Drumstick - 500g',
      'Wings - 500g',
      'Gizzard - 500g',
      'Ponmo (Cow Skin) - 500g',
      'Liver - 200g',
      'Kidney - 200g',
    ],
  },
];

// Helper functions
export const getProductById = (id: string): Product | undefined => {
  return products.find((p) => p.id === id);
};

export const getProductsByPlan = (planTier: PlanTier): Product[] => {
  return products.filter((p) => p.eligiblePlans.includes(planTier));
};

export const getProductsByCategory = (category: ProductCategory): Product[] => {
  return products.filter((p) => p.category === category);
};

export const getProductsByPlanAndCategory = (planTier: PlanTier, category: ProductCategory): Product[] => {
  return products.filter((p) => p.eligiblePlans.includes(planTier) && p.category === category);
};

export const getCategoriesForPlan = (planTier: PlanTier): ProductCategory[] => {
  const eligibleProducts = getProductsByPlan(planTier);
  const uniqueCategories = [...new Set(eligibleProducts.map((p) => p.category))];
  return uniqueCategories;
};

export const formatPrice = (price: number): string => {
  return "\u20A6" + price.toLocaleString();
};

