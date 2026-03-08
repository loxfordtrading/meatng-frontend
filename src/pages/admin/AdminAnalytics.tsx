import { useMemo, useState } from "react";
import { Activity, DollarSign, Gauge, TrendingDown } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
import { AdminMetricCard } from "@/components/admin/AdminMetricCard";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  formatAdminPrice,
  mockKPIs,
  mockPlanDistribution,
  mockProductPopularity,
  mockRevenueData,
} from "@/data/adminData";

type DateRange = "7d" | "30d" | "90d" | "all";

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

const retentionData = [
  { cohort: "Sep 2025", m1: 95, m2: 88, m3: 82, m4: 78, m5: 74, m6: 71 },
  { cohort: "Oct 2025", m1: 93, m2: 86, m3: 80, m4: 76, m5: 72 },
  { cohort: "Nov 2025", m1: 96, m2: 90, m3: 84, m4: 80 },
  { cohort: "Dec 2025", m1: 94, m2: 87, m3: 82 },
  { cohort: "Jan 2026", m1: 97, m2: 91 },
  { cohort: "Feb 2026", m1: 95 },
];

const getRetentionColor = (value: number) => {
  if (value >= 90) return "bg-emerald-500/85 text-white";
  if (value >= 80) return "bg-emerald-500/50 text-emerald-900";
  if (value >= 70) return "bg-emerald-500/25 text-emerald-900";
  return "bg-emerald-500/12 text-emerald-800";
};

const AdminAnalytics = () => {
  const [dateRange, setDateRange] = useState<DateRange>("all");
  const ranges: DateRange[] = ["7d", "30d", "90d", "all"];

  const revenueData = useMemo(() => {
    if (dateRange === "7d") return mockRevenueData.slice(-1);
    if (dateRange === "30d") return mockRevenueData.slice(-2);
    if (dateRange === "90d") return mockRevenueData.slice(-3);
    return mockRevenueData;
  }, [dateRange]);

  const periodRevenue = revenueData.reduce((sum, month) => sum + month.revenue, 0);
  const periodOrders = revenueData.reduce((sum, month) => sum + month.orders, 0);
  const avgOrderValue = periodOrders ? Math.round(periodRevenue / periodOrders) : 0;
  const totalPlanCount = mockPlanDistribution.reduce((sum, plan) => sum + plan.count, 0);
  const topProducts = mockProductPopularity.slice(0, 8).map((product) => ({
    ...product,
    shortName: product.name.length > 14 ? `${product.name.slice(0, 14)}...` : product.name,
  }));

  return (
    <div className="space-y-6 animate-fade-in admin-page-bg rounded-3xl p-4 sm:p-5">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground text-sm mt-1">Revenue, product, and subscription analytics.</p>
        </div>
        <div className="flex gap-1 rounded-xl border border-border/60 bg-background/80 p-1 shadow-sm">
          {ranges.map((range) => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all uppercase ${
                dateRange === range
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              }`}
            >
              {range === "all" ? "All Time" : range}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <AdminMetricCard
          label="Revenue (period)"
          value={formatAdminPrice(periodRevenue)}
          icon={DollarSign}
          tone="emerald"
          change={mockKPIs.revenueGrowth}
          delayMs={0}
        />
        <AdminMetricCard
          label="Avg Order Value"
          value={formatAdminPrice(avgOrderValue)}
          icon={Gauge}
          tone="blue"
          delayMs={70}
        />
        <AdminMetricCard
          label="Orders (period)"
          value={periodOrders.toString()}
          icon={Activity}
          tone="teal"
          delayMs={140}
        />
        <AdminMetricCard
          label="Churn Rate"
          value={`${mockKPIs.churnRate}%`}
          icon={TrendingDown}
          tone="amber"
          change={-mockKPIs.churnRate}
          delayMs={210}
        />
      </div>

      <Card className="admin-card admin-animate-up" style={{ animationDelay: "170ms" }}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="text-base">Revenue and Order Trend</CardTitle>
            <Badge variant="secondary" className="font-semibold">
              {revenueData.length} data point{revenueData.length > 1 ? "s" : ""}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-2">
          <ChartContainer config={revenueChartConfig} className="h-[300px] w-full">
            <AreaChart data={revenueData} margin={{ left: 10, right: 10, top: 14, bottom: 4 }}>
              <defs>
                <linearGradient id="revenueFillAnalytics" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-revenue)" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="var(--color-revenue)" stopOpacity={0.05} />
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
              <YAxis yAxisId="orders" orientation="right" tickLine={false} axisLine={false} />
              <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
              <Area
                yAxisId="revenue"
                dataKey="revenue"
                type="monotone"
                stroke="var(--color-revenue)"
                strokeWidth={2.2}
                fill="url(#revenueFillAnalytics)"
                activeDot={{ r: 5 }}
              />
              <Bar
                yAxisId="orders"
                dataKey="orders"
                fill="var(--color-orders)"
                radius={[6, 6, 0, 0]}
                maxBarSize={28}
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="admin-card admin-animate-up" style={{ animationDelay: "240ms" }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Plan Distribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            <div className="relative">
              <ChartContainer
                config={mockPlanDistribution.reduce<ChartConfig>((acc, plan) => {
                  acc[plan.plan] = { label: plan.plan, color: plan.color };
                  return acc;
                }, {})}
                className="h-[240px] w-full"
              >
                <PieChart>
                  <Pie
                    data={mockPlanDistribution}
                    dataKey="count"
                    nameKey="plan"
                    innerRadius={58}
                    outerRadius={90}
                    paddingAngle={3}
                    strokeWidth={3}
                    stroke="hsl(var(--background))"
                  >
                    {mockPlanDistribution.map((plan) => (
                      <Cell key={plan.plan} fill={plan.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent labelKey="plan" nameKey="plan" />} />
                </PieChart>
              </ChartContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-foreground">{totalPlanCount}</span>
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Total plans
                </span>
              </div>
            </div>
            <div className="space-y-2">
              {mockPlanDistribution.map((plan) => (
                <div key={plan.plan} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: plan.color }} />
                    <span className="font-medium">{plan.plan}</span>
                  </div>
                  <span className="text-muted-foreground">
                    {plan.count} ({Math.round((plan.count / totalPlanCount) * 100)}%)
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="admin-card admin-animate-up" style={{ animationDelay: "300ms" }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Top Products (by orders)</CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <ChartContainer config={productChartConfig} className="h-[290px] w-full">
              <BarChart data={topProducts} layout="vertical" margin={{ left: 0, right: 8, top: 2, bottom: 2 }}>
                <CartesianGrid horizontal={false} strokeDasharray="3 5" />
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="shortName" width={115} tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent indicator="dot" labelKey="name" />} />
                <Bar dataKey="orders" fill="var(--color-orders)" radius={[0, 8, 8, 0]} maxBarSize={18} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="admin-card admin-animate-up" style={{ animationDelay: "360ms" }}>
        <CardHeader>
          <CardTitle className="text-base">Customer Retention (Cohort %)</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Cohort</th>
                  {["M1", "M2", "M3", "M4", "M5", "M6"].map((monthKey) => (
                    <th key={monthKey} className="px-4 py-3 text-center font-semibold text-muted-foreground">
                      {monthKey}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {retentionData.map((row) => (
                  <tr key={row.cohort} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-medium">{row.cohort}</td>
                    {[row.m1, row.m2, row.m3, row.m4, row.m5, row.m6].map((value, index) => (
                      <td key={index} className="px-4 py-2 text-center">
                        {value !== undefined ? (
                          <span className={`inline-block rounded-md px-2 py-1 text-xs font-semibold ${getRetentionColor(value)}`}>
                            {value}%
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAnalytics;
