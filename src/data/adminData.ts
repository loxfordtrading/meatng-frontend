// ─── Mock Admin Data ────────────────────────────────────────
// Aligned with customer-facing plan tiers: Value Pack (₦20k/3kg),
// Essential Box (₦35k/5kg), Signature Box (₦75k/10kg), Premium Box (₦110k/15kg)

export interface AdminOrderLineItem {
    name: string;
    weightG: number;
    quantity: number;
    type: "mandatory" | "offal-pick" | "build-pick" | "add-on";
}

export interface AdminOrder {
    id: string;
    customerName: string;
    customerEmail: string;
    date: string;
    items: number;
    total: number;
    status: "Processing" | "In Transit" | "Delivered" | "Cancelled";
    plan: string;
    planWeightKg: number;
    address: string;
    paymentMethod: string;
    lineItems?: AdminOrderLineItem[];
}

export interface AdminCustomer {
    id: string;
    name: string;
    email: string;
    phone: string;
    plan: string | null;
    status: "Active" | "Paused" | "Cancelled" | "No Subscription";
    joinDate: string;
    totalOrders: number;
    totalSpent: number;
    lastOrder: string | null;
}

export interface AdminSubscription {
    id: string;
    customerName: string;
    customerEmail: string;
    plan: string;
    weightKg: number;
    frequency: string;
    status: "Active" | "Paused" | "Cancelled";
    nextBilling: string;
    monthlyValue: number;
    startDate: string;
}

export interface DeliveryZone {
    id: string;
    state: string;
    lga: string;
    fee: number;
    enabled: boolean;
    driverName: string | null;
    upcomingDeliveries: number;
}

export interface RevenueData {
    month: string;
    revenue: number;
    orders: number;
}

export interface PlanDistribution {
    plan: string;
    count: number;
    color: string;
}

// ─── Orders ─────────────────────────────────────────────────
export const mockAdminOrders: AdminOrder[] = [
    {
        id: "MN-502841", customerName: "Adebola Okonkwo", customerEmail: "adebola@email.com", date: "Feb 14, 2026", items: 12, total: 75000, status: "Processing", plan: "Signature Box", planWeightKg: 10, address: "12 Admiralty Way, Lekki Phase 1, Lagos", paymentMethod: "Card",
        lineItems: [
            { name: "Boneless Beef", weightG: 1500, quantity: 1, type: "mandatory" },
            { name: "Bone in Beef", weightG: 1000, quantity: 1, type: "mandatory" },
            { name: "Agemawo (Beef + Skin)", weightG: 1000, quantity: 1, type: "mandatory" },
            { name: "Whole Chicken", weightG: 1500, quantity: 1, type: "mandatory" },
            { name: "Plain Beef", weightG: 1000, quantity: 1, type: "build-pick" },
            { name: "Shaki", weightG: 100, quantity: 3, type: "build-pick" },
            { name: "Liver", weightG: 100, quantity: 2, type: "build-pick" },
            { name: "Drumstick", weightG: 100, quantity: 5, type: "build-pick" },
            { name: "Laps (Thigh & Drumstick)", weightG: 500, quantity: 2, type: "build-pick" },
            { name: "Gizzard", weightG: 100, quantity: 5, type: "build-pick" },
        ],
    },
    {
        id: "MN-502839", customerName: "Chidinma Agu", customerEmail: "chidinma@email.com", date: "Feb 14, 2026", items: 5, total: 20000, status: "Processing", plan: "Value Pack", planWeightKg: 3, address: "5 Adeola Odeku, VI, Lagos", paymentMethod: "Transfer",
        lineItems: [
            { name: "Bone-in Beef", weightG: 2000, quantity: 1, type: "mandatory" },
            { name: "Boneless Beef", weightG: 500, quantity: 1, type: "mandatory" },
            { name: "Liver", weightG: 100, quantity: 1, type: "offal-pick" },
            { name: "Shaki", weightG: 100, quantity: 1, type: "offal-pick" },
            { name: "Lungs", weightG: 100, quantity: 1, type: "offal-pick" },
        ],
    },
    {
        id: "MN-502835", customerName: "Emeka Obi", customerEmail: "emeka@email.com", date: "Feb 13, 2026", items: 14, total: 110000, status: "In Transit", plan: "Premium Box", planWeightKg: 15, address: "22 Akin Adesola St, VI, Lagos", paymentMethod: "Card",
        lineItems: [
            { name: "Boneless Beef", weightG: 1500, quantity: 1, type: "mandatory" },
            { name: "Bone in Beef", weightG: 1000, quantity: 1, type: "mandatory" },
            { name: "Agemawo (Beef + Skin)", weightG: 1000, quantity: 1, type: "mandatory" },
            { name: "Whole Chicken", weightG: 1500, quantity: 1, type: "mandatory" },
            { name: "Torso Beef", weightG: 1000, quantity: 2, type: "build-pick" },
            { name: "Minced Meat", weightG: 1000, quantity: 1, type: "build-pick" },
            { name: "Shin", weightG: 1000, quantity: 1, type: "build-pick" },
            { name: "Tail (Oxtail)", weightG: 1000, quantity: 1, type: "build-pick" },
            { name: "Shaki", weightG: 100, quantity: 5, type: "build-pick" },
            { name: "Ponmo (White & Brown)", weightG: 200, quantity: 5, type: "build-pick" },
            { name: "Minced Chicken", weightG: 1000, quantity: 1, type: "build-pick" },
            { name: "Sausages", weightG: 1000, quantity: 1, type: "build-pick" },
        ],
    },
    {
        id: "MN-502830", customerName: "Funke Adeyemi", customerEmail: "funke@email.com", date: "Feb 13, 2026", items: 7, total: 35000, status: "In Transit", plan: "Essential Box", planWeightKg: 5, address: "8 Marine Rd, Apapa, Lagos", paymentMethod: "Transfer",
        lineItems: [
            { name: "Boneless Beef", weightG: 2000, quantity: 1, type: "mandatory" },
            { name: "Bone in Beef", weightG: 1000, quantity: 1, type: "mandatory" },
            { name: "Whole Chicken", weightG: 1500, quantity: 1, type: "mandatory" },
            { name: "Cow Skin (Ponmo)", weightG: 200, quantity: 1, type: "offal-pick" },
            { name: "Shaki", weightG: 100, quantity: 1, type: "offal-pick" },
            { name: "Roundabout", weightG: 100, quantity: 1, type: "offal-pick" },
            { name: "Abodi", weightG: 100, quantity: 1, type: "offal-pick" },
        ],
    },
    { id: "MN-502825", customerName: "Gbenga Soyinka", customerEmail: "gbenga@email.com", date: "Feb 12, 2026", items: 5, total: 20000, status: "Delivered", plan: "Value Pack", planWeightKg: 3, address: "3 Stadium Rd, Surulere, Lagos", paymentMethod: "Card" },
    { id: "MN-502820", customerName: "Halima Bello", customerEmail: "halima@email.com", date: "Feb 12, 2026", items: 14, total: 110000, status: "Delivered", plan: "Premium Box", planWeightKg: 15, address: "15 Ozumba Mbadiwe, VI, Lagos", paymentMethod: "Card" },
    { id: "MN-502815", customerName: "Ibrahim Musa", customerEmail: "ibrahim@email.com", date: "Feb 11, 2026", items: 12, total: 75000, status: "Delivered", plan: "Signature Box", planWeightKg: 10, address: "7 Allen Ave, Ikeja, Lagos", paymentMethod: "Transfer" },
    { id: "MN-502810", customerName: "Janet Okoye", customerEmail: "janet@email.com", date: "Feb 11, 2026", items: 7, total: 35000, status: "Delivered", plan: "Essential Box", planWeightKg: 5, address: "10 Bode Thomas, Surulere, Lagos", paymentMethod: "Card" },
    { id: "MN-502805", customerName: "Kelechi Nwankwo", customerEmail: "kelechi@email.com", date: "Feb 10, 2026", items: 14, total: 110000, status: "Cancelled", plan: "Premium Box", planWeightKg: 15, address: "4 Bourdillon Rd, Ikoyi, Lagos", paymentMethod: "Card" },
    { id: "MN-502800", customerName: "Lola Bakare", customerEmail: "lola@email.com", date: "Feb 10, 2026", items: 12, total: 75000, status: "Delivered", plan: "Signature Box", planWeightKg: 10, address: "18 Opebi Rd, Ikeja, Lagos", paymentMethod: "Transfer" },
];

// ─── Customers ──────────────────────────────────────────────
export const mockAdminCustomers: AdminCustomer[] = [
    { id: "C001", name: "Adebola Okonkwo", email: "adebola@email.com", phone: "+234 801 234 5678", plan: "Signature Box", status: "Active", joinDate: "Dec 5, 2025", totalOrders: 6, totalSpent: 450000, lastOrder: "Feb 14, 2026" },
    { id: "C002", name: "Chidinma Agu", email: "chidinma@email.com", phone: "+234 802 345 6789", plan: "Value Pack", status: "Active", joinDate: "Jan 10, 2026", totalOrders: 3, totalSpent: 60000, lastOrder: "Feb 14, 2026" },
    { id: "C003", name: "Emeka Obi", email: "emeka@email.com", phone: "+234 803 456 7890", plan: "Premium Box", status: "Active", joinDate: "Nov 20, 2025", totalOrders: 8, totalSpent: 880000, lastOrder: "Feb 13, 2026" },
    { id: "C004", name: "Funke Adeyemi", email: "funke@email.com", phone: "+234 804 567 8901", plan: "Essential Box", status: "Active", joinDate: "Dec 15, 2025", totalOrders: 5, totalSpent: 175000, lastOrder: "Feb 13, 2026" },
    { id: "C005", name: "Gbenga Soyinka", email: "gbenga@email.com", phone: "+234 805 678 9012", plan: "Value Pack", status: "Paused", joinDate: "Oct 8, 2025", totalOrders: 10, totalSpent: 200000, lastOrder: "Feb 12, 2026" },
    { id: "C006", name: "Halima Bello", email: "halima@email.com", phone: "+234 806 789 0123", plan: "Premium Box", status: "Active", joinDate: "Sep 1, 2025", totalOrders: 14, totalSpent: 1540000, lastOrder: "Feb 12, 2026" },
    { id: "C007", name: "Ibrahim Musa", email: "ibrahim@email.com", phone: "+234 807 890 1234", plan: "Signature Box", status: "Active", joinDate: "Jan 5, 2026", totalOrders: 4, totalSpent: 300000, lastOrder: "Feb 11, 2026" },
    { id: "C008", name: "Janet Okoye", email: "janet@email.com", phone: "+234 808 901 2345", plan: "Essential Box", status: "Cancelled", joinDate: "Aug 15, 2025", totalOrders: 12, totalSpent: 420000, lastOrder: "Feb 11, 2026" },
    { id: "C009", name: "Kelechi Nwankwo", email: "kelechi@email.com", phone: "+234 809 012 3456", plan: "Premium Box", status: "Cancelled", joinDate: "Jul 20, 2025", totalOrders: 15, totalSpent: 1650000, lastOrder: "Feb 10, 2026" },
    { id: "C010", name: "Lola Bakare", email: "lola@email.com", phone: "+234 810 123 4567", plan: "Signature Box", status: "Active", joinDate: "Nov 1, 2025", totalOrders: 7, totalSpent: 525000, lastOrder: "Feb 10, 2026" },
    { id: "C011", name: "Musa Abubakar", email: "musa@email.com", phone: "+234 811 234 5678", plan: null, status: "No Subscription", joinDate: "Feb 1, 2026", totalOrders: 0, totalSpent: 0, lastOrder: null },
    { id: "C012", name: "Ngozi Eze", email: "ngozi@email.com", phone: "+234 812 345 6789", plan: "Value Pack", status: "Active", joinDate: "Jan 20, 2026", totalOrders: 2, totalSpent: 40000, lastOrder: "Feb 8, 2026" },
];

// ─── Subscriptions ──────────────────────────────────────────
export const mockAdminSubscriptions: AdminSubscription[] = [
    { id: "S001", customerName: "Adebola Okonkwo", customerEmail: "adebola@email.com", plan: "Signature Box", weightKg: 10, frequency: "Weekly", status: "Active", nextBilling: "Feb 17, 2026", monthlyValue: 75000, startDate: "Dec 5, 2025" },
    { id: "S002", customerName: "Chidinma Agu", customerEmail: "chidinma@email.com", plan: "Value Pack", weightKg: 3, frequency: "Bi-weekly", status: "Active", nextBilling: "Feb 21, 2026", monthlyValue: 20000, startDate: "Jan 10, 2026" },
    { id: "S003", customerName: "Emeka Obi", customerEmail: "emeka@email.com", plan: "Premium Box", weightKg: 15, frequency: "Weekly", status: "Active", nextBilling: "Feb 17, 2026", monthlyValue: 110000, startDate: "Nov 20, 2025" },
    { id: "S004", customerName: "Funke Adeyemi", customerEmail: "funke@email.com", plan: "Essential Box", weightKg: 5, frequency: "Weekly", status: "Active", nextBilling: "Feb 17, 2026", monthlyValue: 35000, startDate: "Dec 15, 2025" },
    { id: "S005", customerName: "Gbenga Soyinka", customerEmail: "gbenga@email.com", plan: "Value Pack", weightKg: 3, frequency: "Monthly", status: "Paused", nextBilling: "—", monthlyValue: 20000, startDate: "Oct 8, 2025" },
    { id: "S006", customerName: "Halima Bello", customerEmail: "halima@email.com", plan: "Premium Box", weightKg: 15, frequency: "Weekly", status: "Active", nextBilling: "Feb 17, 2026", monthlyValue: 110000, startDate: "Sep 1, 2025" },
    { id: "S007", customerName: "Ibrahim Musa", customerEmail: "ibrahim@email.com", plan: "Signature Box", weightKg: 10, frequency: "Bi-weekly", status: "Active", nextBilling: "Feb 24, 2026", monthlyValue: 75000, startDate: "Jan 5, 2026" },
    { id: "S008", customerName: "Lola Bakare", customerEmail: "lola@email.com", plan: "Signature Box", weightKg: 10, frequency: "Weekly", status: "Active", nextBilling: "Feb 17, 2026", monthlyValue: 75000, startDate: "Nov 1, 2025" },
];

// ─── Delivery Zones ─────────────────────────────────────────
export const mockDeliveryZones: DeliveryZone[] = [
    { id: "DZ001", state: "Lagos", lga: "Lekki", fee: 2500, enabled: true, driverName: "Tunde Ajayi", upcomingDeliveries: 12 },
    { id: "DZ002", state: "Lagos", lga: "Victoria Island", fee: 2000, enabled: true, driverName: "Tunde Ajayi", upcomingDeliveries: 8 },
    { id: "DZ003", state: "Lagos", lga: "Ikoyi", fee: 2000, enabled: true, driverName: "Biodun Fasanya", upcomingDeliveries: 5 },
    { id: "DZ004", state: "Lagos", lga: "Ikeja", fee: 3000, enabled: true, driverName: "Biodun Fasanya", upcomingDeliveries: 9 },
    { id: "DZ005", state: "Lagos", lga: "Surulere", fee: 2500, enabled: true, driverName: "Femi Olowu", upcomingDeliveries: 6 },
    { id: "DZ006", state: "Lagos", lga: "Apapa", fee: 3500, enabled: true, driverName: "Femi Olowu", upcomingDeliveries: 3 },
    { id: "DZ007", state: "Lagos", lga: "Yaba", fee: 2500, enabled: true, driverName: null, upcomingDeliveries: 4 },
    { id: "DZ008", state: "Lagos", lga: "Ajah", fee: 4000, enabled: false, driverName: null, upcomingDeliveries: 0 },
    { id: "DZ009", state: "Abuja", lga: "Wuse", fee: 5000, enabled: false, driverName: null, upcomingDeliveries: 0 },
    { id: "DZ010", state: "Abuja", lga: "Maitama", fee: 5000, enabled: false, driverName: null, upcomingDeliveries: 0 },
];

// ─── Revenue Data ───────────────────────────────────────────
export const mockRevenueData: RevenueData[] = [
    { month: "Sep", revenue: 1850000, orders: 32 },
    { month: "Oct", revenue: 2340000, orders: 41 },
    { month: "Nov", revenue: 2890000, orders: 50 },
    { month: "Dec", revenue: 3520000, orders: 62 },
    { month: "Jan", revenue: 3180000, orders: 55 },
    { month: "Feb", revenue: 2740000, orders: 47 },
];

// ─── Plan Distribution ─────────────────────────────────────
export const mockPlanDistribution: PlanDistribution[] = [
    { plan: "Value Pack", count: 45, color: "#10b981" },
    { plan: "Essential Box", count: 30, color: "#6366f1" },
    { plan: "Signature Box", count: 38, color: "#3b82f6" },
    { plan: "Premium Box", count: 22, color: "#f59e0b" },
];

// ─── Product Popularity ─────────────────────────────────────
export const mockProductPopularity = [
    { name: "Whole Chicken", orders: 89 },
    { name: "Boneless Beef", orders: 82 },
    { name: "Bone in Beef", orders: 76 },
    { name: "Shaki", orders: 72 },
    { name: "Ponmo", orders: 65 },
    { name: "Agemawo (Beef + Skin)", orders: 58 },
    { name: "Liver", orders: 55 },
    { name: "Roundabout", orders: 51 },
    { name: "Drumstick", orders: 44 },
    { name: "Minced Meat", orders: 38 },
];

// ─── KPIs ───────────────────────────────────────────────────
export const mockKPIs = {
    totalRevenue: 16520000,
    revenueGrowth: 12.4,
    activeSubscriptions: 135,
    subscriptionGrowth: 8.2,
    pendingOrders: 4,
    newCustomers30d: 18,
    customerGrowth: 15.1,
    avgOrderValue: 60000,
    totalCustomers: 142,
    churnRate: 3.8,
};

// ─── Helpers ────────────────────────────────────────────────
export function formatAdminPrice(amount: number): string {
    return `₦${amount.toLocaleString()}`;
}
