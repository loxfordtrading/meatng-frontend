import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Search, Pause, Play, X as XIcon, TrendingDown, Repeat, DollarSign, Loader2 } from "lucide-react";
import { AdminMetricCard } from "@/components/admin/AdminMetricCard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { mockAdminSubscriptions, mockKPIs, formatAdminPrice, type AdminSubscription } from "@/data/adminData";
import { axiosClient } from "@/GlobalApi";
import { LoadingData } from "@/components/LoadingData";
import { SubscriptionMetaType, SubscriptionType } from "@/types/admin";
import { cn } from "@/lib/utils";
import displayCurrency from "@/utils/displayCurrency";
import { getFrequencyWeeks, getFrequencyWeeksString } from "@/utils/conversion";
import { format } from "date-fns";
import { toast } from "react-toastify";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
  PaginationLink,
} from "@/components/ui/pagination";
import { useSearchParams } from "react-router-dom";
import { formatEnums } from "@/utils/formatEnums";

type SubFilter = "all" | "active" | "paused" | "cancelled" | "expired" | "past_due";

const statusColors: Record<string, string> = {
    Active: "bg-emerald-500/15 text-emerald-700 border-emerald-500/20",
    Paused: "bg-amber-500/15 text-amber-700 border-amber-500/20",
    Cancelled: "bg-red-500/15 text-red-700 border-red-500/20",
};

const AdminSubscriptions = () => {

    const [searchParams, setSearchParams] = useSearchParams();
    const [search, setSearch] = useState("");
    const [subscriptions, setSubscriptions] = useState<SubscriptionType[]>([]);
    const [meta, setMeta] = useState<SubscriptionMetaType | null>(null);
    const [loading, setLoading] = useState(true)
    const [disablingId, setDisablingId] = useState<string | null>(null);

    const currentPage = Number(searchParams.get("page")) || 1;
    const activeStatus = searchParams.get("status") || "all";
    const [debouncedSearch, setDebouncedSearch] = useState(search);

    const tabs: SubFilter[] = ["all", "active", "paused", "cancelled", "expired", "past_due"];

    const handleStatus = async (id: string, status: string) => {
        try {
            setDisablingId(id);

            await axiosClient.patch(`/subscriptions/${id}/${status}`);
            toast.success(`Subscription marked as ${status}`)

            getSubscriptions()
        } catch (error) {
            toast.error(error.response?.data?.message);
        } finally {
            setDisablingId(null);
        }
    };

    const changePage = (page: number) => {
        setSearchParams({
            page: page.toString(),
            status: activeStatus,
        });
    };

    const changeStatus = (status: string) => {
        const params = new URLSearchParams(searchParams);

        params.set("page", "1");

        if (status === "all") {
            params.delete("status");
        } else {
            params.set("status", status);
        }

        setSearchParams(params);
    };

    useEffect(() => {
        const params = new URLSearchParams(searchParams);

        params.set("page", "1");

        if (debouncedSearch) {
            params.set("search", debouncedSearch);
        } else {
            params.delete("search");
        }

        setSearchParams(params);
    }, [debouncedSearch]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, 500);

        return () => clearTimeout(timer);
    }, [search]);

    useEffect(() => {
        getSubscriptions()
    }, [currentPage, activeStatus, debouncedSearch])

    const getSubscriptions = async () => {
        try {
            setLoading(true)

            let url = `/subscriptions?page=${currentPage}&limit=20`;

            if (activeStatus && activeStatus !== "all") {
                url += `&status=${activeStatus}`;
            }
            
            if (debouncedSearch) {
                url += `&search=${encodeURIComponent(debouncedSearch)}`;
            }

            const res = await axiosClient.get(url);

            const subs = res.data?.data || [];

            const flattenedSubs = subs.map((plan: any) => ({
                id: plan.id,
                ...plan.attributes,
            }));

            setSubscriptions(flattenedSubs);
            setMeta(res.data.meta);  

        } catch (err: any) {
            toast.error(err.response?.data?.message);
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="space-y-6 animate-fade-in admin-page-bg rounded-3xl p-4 sm:p-5">
            <div>
                <h1 className="text-2xl font-display font-bold text-foreground">Subscription Management</h1>
                <p className="text-muted-foreground text-sm mt-1">Monitor and manage customer subscriptions.</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className={cn("admin-card admin-animate-up")}>
                    <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3">
                        <div className="admin-stat-icon" data-tone={"text-emerald-700"}>
                            <Repeat />
                        </div>
                        </div>
                        <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Active Subscriptions</p>
                        <p className={cn("mt-1 text-2xl font-bold tracking-tight text-emerald-700")}>{meta?.summary?.active_subscriptions ?? "-"}</p>
                    </CardContent>
                </Card>
                <Card className={cn("admin-card admin-animate-up")}>
                    <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3">
                        <div className="admin-stat-icon" data-tone={"text-blue-700"}>
                            <DollarSign/>
                        </div>
                        </div>
                        <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Avg Monthly Value</p>
                        <p className={cn("mt-1 text-2xl font-bold tracking-tight text-blue-700")}>{meta?.summary?.avg_monthly_subscription != null ? displayCurrency(meta?.summary?.avg_monthly_subscription, "NGN") : "-"}</p>
                    </CardContent>
                </Card>
                <Card className={cn("admin-card admin-animate-up")}>
                    <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3">
                        <div className="admin-stat-icon" data-tone={"text-amber-700"}>
                            <TrendingDown />
                        </div>
                        </div>
                        <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Churn Rate</p>
                        <p className={cn("mt-1 text-2xl font-bold tracking-tight text-amber-700")}>{meta?.summary?.churn_rate ? `${meta?.summary?.churn_rate}%` : "-"}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by customer..." className="pl-9 h-10 rounded-xl" />
                </div>
                <div className="flex gap-1 flex-wrap bg-muted/60 rounded-xl p-1">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            disabled={loading}
                            onClick={() => changeStatus(tab)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize ${activeStatus === tab ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            {tab === "all" ? "All" : formatEnums(tab)}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <LoadingData/>
            ) : (
                <>
                    {/* Table */}
                    <Card className="admin-card admin-animate-up" style={{ animationDelay: "180ms" }}>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-border bg-muted/40">
                                            <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Customer</th>
                                            <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Phone</th>
                                            <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Plan</th>
                                            <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Box Weight</th>
                                            <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Frequency</th>
                                            <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Monthly</th>
                                            <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Next Billing</th>
                                            <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Status</th>
                                            <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {subscriptions.map((sub) => (
                                            <tr key={sub.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                                                <td className="px-4 py-3">
                                                    <p className="font-medium">{sub?.customer_name}</p>
                                                    <p className="text-xs text-muted-foreground">{sub?.customer_email}</p>
                                                </td>
                                                <td className="px-4 py-3 text-muted-foreground">{sub?.customer_phone}</td>
                                                <td className="px-4 py-3"><Badge variant="secondary">{sub?.plan_name}</Badge></td>
                                                <td className="px-4 py-3 text-muted-foreground">{sub?.box_weight}</td>
                                                <td className="px-4 py-3 text-muted-foreground">{getFrequencyWeeksString(sub?.frequency)}</td>
                                                <td className="px-4 py-3 font-semibold">{displayCurrency(sub?.monthly_value)}</td>
                                                <td className="px-4 py-3 text-muted-foreground">{sub?.next_billing_at ? format(new Date(sub?.next_billing_at), "dd MMM yyyy") : "N/A"}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusColors[sub.status]}`}>
                                                        {sub?.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex gap-1">
                                                        {sub?.status === "active" && (
                                                            <Button variant="ghost" size="sm" disabled={disablingId === sub?.id} onClick={() => handleStatus(sub?.id, "paused")} title="Pause">
                                                                {disablingId === sub?.id ? (
                                                                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                                                ) : (
                                                                    <Pause className="h-3.5 w-3.5" />
                                                                )}
                                                            </Button>
                                                        )}
                                                        {sub.status === "paused" && (
                                                            <Button variant="ghost" size="sm" disabled={disablingId === sub?.id} onClick={() => handleStatus(sub?.id, "active")} title="Resume">
                                                                {disablingId === sub?.id ? (
                                                                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                                                ) : (
                                                                    <Play className="h-3.5 w-3.5" />
                                                                )}
                                                            </Button>
                                                        )}
                                                        {sub.status !== "cancelled" && (
                                                            <Button variant="ghost" size="sm" disabled={disablingId === sub?.id} onClick={() => handleStatus(sub?.id, "cancel")} title="Cancel" className="text-destructive hover:text-destructive">
                                                                {disablingId === sub?.id ? (
                                                                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                                                ) : (
                                                                    <XIcon className="h-3.5 w-3.5" />
                                                                )}
                                                            </Button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {subscriptions.length === 0 && <div className="flex items-center justify-center py-12 text-muted-foreground">No subscriptions found.</div>}
                            </div>
                        </CardContent>
                    </Card>

                    {meta?.totalPages > 1 && !loading && subscriptions?.length > 0 && (
                        <Pagination className="mt-8">
                            <PaginationContent className="flex-wrap justify-center gap-2">

                            <PaginationItem>
                                <PaginationPrevious
                                    onClick={() => currentPage > 1 && changePage(currentPage - 1)}
                                />
                            </PaginationItem>

                            {Array.from({ length: Number(meta?.totalPages) }).map((_, i) => {
                                const page = i + 1;

                                return (
                                <PaginationItem key={page}>
                                    <PaginationLink
                                        isActive={currentPage === page}
                                        onClick={() => changePage(page)}
                                    >
                                        {page}
                                    </PaginationLink>
                                </PaginationItem>
                                );
                            })}

                            <PaginationItem>
                                <PaginationNext
                                    onClick={() =>
                                        currentPage < meta?.totalPages && changePage(currentPage + 1)
                                    }
                                />
                            </PaginationItem>

                            </PaginationContent>
                        </Pagination>
                    )}
                </>
            )}
        </div>
    );
};

export default AdminSubscriptions;
