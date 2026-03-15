import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  CircleDot,
  DollarSign,
  Package,
  ShoppingBag,
  UserPlus,
} from "lucide-react";
import { tokenStorage } from "@/lib/auth/tokenStorage";
import { listOrders, listAdminUsers, type Order as ApiOrder } from "@/lib/api/admin";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  formatAdminPrice,
  mockAdminOrders,
  mockKPIs,
  mockPlanDistribution,
  mockProductPopularity,
  mockRevenueData,
} from "@/data/adminData";
import { OrderStatus, OrderType, StatisticsType } from "@/types/admin";
import { toast } from "react-toastify";
import { axiosClient } from "@/GlobalApi";
import { cn } from "@/lib/utils";
import displayCurrency from "@/utils/displayCurrency";
import { LoadingData } from "@/components/LoadingData";
import { format } from "date-fns";

const PLAN_COLORS = [
  "#6366F1",
  "#22C55E",
  "#F59E0B",
  "#EF4444",
  "#14B8A6",
];

const statusColors: Record<string, string> = {
  Processing: "bg-amber-500/15 text-amber-700 border-amber-500/20",
  "In Transit": "bg-blue-500/15 text-blue-700 border-blue-500/20",
  Delivered: "bg-emerald-500/15 text-emerald-700 border-emerald-500/20",
  Cancelled: "bg-red-500/15 text-red-700 border-red-500/20",
};

const revenueChartConfig = {
  revenue: { label: "Revenue", color: "hsl(var(--primary))" },
  orders: { label: "Orders", color: "hsl(var(--accent))" },
} satisfies ChartConfig;

const productChartConfig = {
  orders: { label: "Orders", color: "hsl(var(--primary))" },
} satisfies ChartConfig;

const compactCurrencyTick = (value: number) => {
  if (value >= 1000000) return `${Math.round(value / 1000000)}m`;
  if (value >= 1000) return `${Math.round(value / 1000)}k`;
  return value.toString();
};

const normalizeStatus = (s?: string): string => {
  if (!s) return "Processing";
  const lower = s.toLowerCase();
  if (lower.includes("transit")) return "In Transit";
  if (lower.includes("deliver")) return "Delivered";
  if (lower.includes("cancel")) return "Cancelled";
  return "Processing";
};

const mapStatus = (status: string): OrderStatus => {
  switch (status) {
    case "pending":
      return "Processing";
    case "paid":
      return "Delivered";
    case "failed":
      return "Cancelled";
    default:
      return "Processing";
  }
};

const formatDate = (iso?: string): string => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  } catch { return iso; }
};

const AdminDashboard = () => {

  const token = tokenStorage.getAdminToken();
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [statistics, setStatistics] = useState<StatisticsType | null>(null);

  const revenueChartData = statistics?.charts?.revenue_momentum?.map((item) => ({
    month: item.month,
    revenue: item.revenue,
    orders: 0, // placeholder until backend sends it
  })) ?? [];

  const planDistribution = statistics?.charts?.plan_distribution?.map((plan, index) => ({
    id: plan.plan_id,
    plan: plan.plan_name,
    count: plan.count,
    percentage: plan.percentage,
    color: PLAN_COLORS[index % PLAN_COLORS.length],
  })) ?? [];

  const topProducts = statistics?.charts?.top_products?.map((product) => ({
    name: product.product_name,
    shortName: product.product_name.length > 16
      ? product.product_name.slice(0, 16) + "..."
      : product.product_name,
    orders: product.order_count,
    quantity: product.quantity
  })) ?? [];

  const totalPlanCount = statistics?.charts?.plan_distribution?.reduce(
    (sum, plan) => sum + plan.count,
    0
  );

  useEffect(() => {
    getDashboardStats()
  }, [])

  const getDashboardStats = async () => {
    try {
      const [statsRes, ordersRes] = await Promise.all([
        axiosClient.get("/stats/dashboard"),
        axiosClient.get("/orders?limit=5")
      ]);

      const orders = ordersRes.data.data || [];

      const flattenedOrders = orders.map((order: any) => ({
          id: order.id,
          ...order.attributes,
          status: mapStatus(order.attributes.status),
          user: order.relationships?.userDetails?.data?.attributes || null,
          plan: order.relationships?.planDetails?.data?.attributes || null,
      }));

      setStatistics(statsRes.data?.data?.attributes);
      setOrders(flattenedOrders);
    } catch (error: any) {
      toast.error(error.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
        <LoadingData/>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in admin-page-bg rounded-3xl p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">Business overview and key metrics.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className={cn("admin-card admin-animate-up")}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="admin-stat-icon" data-tone={"text-emerald-700"}>
                <DollarSign />
              </div>
            </div>
            <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">TOTAL REVENUE</p>
            <p className={cn("mt-1 text-2xl font-bold tracking-tight text-emerald-700")}>{displayCurrency(statistics?.summary?.total_revenue, "NGN")}</p>
          </CardContent>
        </Card>
        <Card className={cn("admin-card admin-animate-up")}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="admin-stat-icon" data-tone={"text-blue-700"}>
                <Package />
              </div>
            </div>
            <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">ACTIVE SUBSCRIPTIONS</p>
            <p className={cn("mt-1 text-2xl font-bold tracking-tight text-blue-700")}>{statistics?.summary?.active_subscriptions}</p>
          </CardContent>
        </Card>
        <Card className={cn("admin-card admin-animate-up")}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="admin-stat-icon" data-tone={"text-amber-700"}>
                <ShoppingBag />
              </div>
            </div>
            <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">PENDING ORDERS</p>
            <p className={cn("mt-1 text-2xl font-bold tracking-tight text-amber-700")}>{statistics?.summary?.pending_orders}</p>
          </CardContent>
        </Card>
        <Card className={cn("admin-card admin-animate-up")}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="admin-stat-icon" data-tone={"text-teal-700"}>
                <UserPlus />
              </div>
            </div>
            <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">TOTAL CUSTOMERS</p>
            <p className={cn("mt-1 text-2xl font-bold tracking-tight text-teal-700")}>{statistics?.summary?.total_customers}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="admin-card admin-animate-up lg:col-span-2" style={{ animationDelay: "170ms" }}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-base">Revenue Momentum</CardTitle>
              <span className="text-xs text-muted-foreground">Last {revenueChartData?.length} months</span>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <ChartContainer config={revenueChartConfig} className="h-[260px] w-full">
              <AreaChart data={revenueChartData} margin={{ left: 10, right: 10, top: 14, bottom: 4 }}>
                <defs>
                  <linearGradient id="revenueFillDashboard" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-revenue)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="var(--color-revenue)" stopOpacity={0.04} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 5" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={10} />
                <YAxis
                  yAxisId="revenue"
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={compactCurrencyTick}
                />
                <YAxis
                  yAxisId="orders"
                  orientation="right"
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}`}
                />
                <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                <Area
                  yAxisId="revenue"
                  type="monotone"
                  dataKey="revenue"
                  fill="url(#revenueFillDashboard)"
                  stroke="var(--color-revenue)"
                  strokeWidth={2.2}
                  activeDot={{ r: 5 }}
                />
                <Line
                  yAxisId="orders"
                  type="monotone"
                  dataKey="orders"
                  stroke="var(--color-orders)"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "var(--color-orders)" }}
                  activeDot={{ r: 5 }}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="admin-card admin-animate-up" style={{ animationDelay: "240ms" }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Plan Distribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            <div className="relative">
              <ChartContainer
                config={planDistribution.reduce<ChartConfig>((acc, plan) => {
                  acc[plan.plan] = { label: plan.plan, color: plan.color };
                  return acc;
                }, {})}
                className="h-[220px] w-full"
              >
                <PieChart>
                  <Pie
                    data={planDistribution}
                    dataKey="count"
                    nameKey="plan"
                    innerRadius={54}
                    outerRadius={82}
                    paddingAngle={3}
                    stroke="hsl(var(--background))"
                    strokeWidth={3}
                  >
                    {planDistribution.map((plan) => (
                      <Cell key={plan?.id} fill={plan.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent labelKey="plan" nameKey="plan" />} />
                </PieChart>
              </ChartContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-foreground">{totalPlanCount}</span>
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  plan{totalPlanCount > 1 && "s"}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              {planDistribution.map((plan) => (
                <div key={plan?.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: plan?.color }} />
                    <span className="font-medium">{plan?.plan}</span>
                  </div>
                  <span className="text-muted-foreground">
                    {plan.count} ({plan.percentage}%)
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="admin-card admin-animate-up" style={{ animationDelay: "300ms" }}>
          <CardHeader>
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-base">Recent Orders</CardTitle>
              <Link
                to="/admin/orders"
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
              >
                View all <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div>
              {orders.map((order) => (
                <div
                  key={order?.id}
                  className="flex items-center justify-between px-6 py-3.5 border-t border-border/50 first:border-t-0 hover:bg-muted/35 transition-colors"
                >
                  <div>
                    <p className="text-sm font-semibold">{order?.user?.email}</p>
                    <p className="text-xs text-muted-foreground">{order?.id} | {order?.createdAt ? format(order?.createdAt, "MMM dd, yyyy") : "None"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{displayCurrency(order?.total_amount, "NGN")}</p>
                    <span
                      className={`mt-1 inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${statusColors[order?.status]}`}
                    >
                      {order?.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="admin-card admin-animate-up" style={{ animationDelay: "360ms" }}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Top Products</CardTitle>
              <span className="text-xs text-muted-foreground">By order volume</span>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <ChartContainer config={productChartConfig} className="h-[260px] w-full">
              <BarChart data={topProducts} layout="vertical" margin={{ left: 0, right: 8, top: 2, bottom: 2 }}>
                <CartesianGrid horizontal={false} strokeDasharray="3 5" />
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="shortName" width={110} tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent indicator="dot" labelKey="name" />} />
                <Bar dataKey="orders" fill="var(--color-orders)" radius={[0, 8, 8, 0]} maxBarSize={18} />
              </BarChart>
            </ChartContainer>
            <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
              <CircleDot className="h-3.5 w-3.5 text-primary" />
              Product bars update as order volume changes.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
