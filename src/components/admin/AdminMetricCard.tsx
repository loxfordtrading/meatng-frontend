import { TrendingDown, TrendingUp, type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type MetricTone = "emerald" | "blue" | "amber" | "teal" | "slate";

const toneText: Record<MetricTone, string> = {
  emerald: "text-emerald-700",
  blue: "text-blue-700",
  amber: "text-amber-700",
  teal: "text-teal-700",
  slate: "text-slate-700",
};

interface AdminMetricCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  tone?: MetricTone;
  change?: number | null;
  subtitle?: string;
  delayMs?: number;
  className?: string;
}

export function AdminMetricCard({
  label,
  value,
  icon: Icon,
  tone = "emerald",
  change = null,
  subtitle,
  delayMs = 0,
  className,
}: AdminMetricCardProps) {
  return (
    <Card className={cn("admin-card admin-animate-up", className)} style={{ animationDelay: `${delayMs}ms` }}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="admin-stat-icon" data-tone={tone}>
            <Icon />
          </div>
          {change !== null && (
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold",
                change >= 0
                  ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-700"
                  : "border-red-500/20 bg-red-500/10 text-red-600",
              )}
            >
              {change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {Math.abs(change)}%
            </span>
          )}
        </div>
        <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
        <p className={cn("mt-1 text-2xl font-bold tracking-tight", toneText[tone])}>{value}</p>
        {subtitle && <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>}
      </CardContent>
    </Card>
  );
}
