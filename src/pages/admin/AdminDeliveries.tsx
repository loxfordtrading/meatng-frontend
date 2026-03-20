import { useEffect, useState } from "react";
import { Search, MapPin, Truck, User, ChevronDown } from "lucide-react";
import { AdminMetricCard } from "@/components/admin/AdminMetricCard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { axiosClient } from "@/GlobalApi";
import { LoadingData } from "@/components/LoadingData";
import { DeliveryMetaType, DeliveryStatus, DeliveryType, OrderStatus, SubscriptionMetaType, SubscriptionType } from "@/types/admin";
import { cn } from "@/lib/utils";
import displayCurrency from "@/utils/displayCurrency";
import { format } from "date-fns";
import { toast } from "react-toastify";
import { ViewDelivery } from "@/components/admin/ViewDelivery";
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

const statusColors: Record<string, string> = {
    pending: "bg-amber-500/15 text-amber-700 border-amber-500/20",
    assigned: "bg-blue-500/15 text-blue-700 border-blue-500/20",
    in_transit: "bg-blue-500/15 text-blue-700 border-blue-500/20",
    delivered: "bg-emerald-500/15 text-emerald-700 border-emerald-500/20",
    failed: "bg-red-500/15 text-red-700 border-red-500/20",
    cancelled: "bg-red-500/15 text-red-700 border-red-500/20",
};

const statusTabs: (DeliveryStatus | "all")[] = ["all", "pending", "assigned", "in_transit", "delivered", "failed", "cancelled"];

const AdminDeliveries = () => {

    const [searchParams, setSearchParams] = useSearchParams();
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<DeliveryStatus | "all">("all");
    const [deliveries, setDeliveries] = useState<DeliveryType[]>([]);
    const [meta, setMeta] = useState<DeliveryMetaType | null>(null);
    const [loading, setLoading] = useState(true)
    const [disablingId, setDisablingId] = useState<string | null>(null);
    const [status, setStatus] = useState<string | null>(null);

    const currentPage = Number(searchParams.get("page")) || 1;
    const activeStatus = searchParams.get("status") || "all";
    const [debouncedSearch, setDebouncedSearch] = useState(search);

    const handleUpdateStatus = async (id: string, status: string) => {
        try {
            setDisablingId(id);
            setStatus(status)

            await axiosClient.patch(`/delivery/records/${id}/status`, { status });
            toast.success(`Delivery marked as ${status}`)

            getDeliveries()
        } catch (error) {
            toast.error(error.response?.data?.message);
        } finally {
            setDisablingId(null);
            setStatus(null)
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
        getDeliveries()
    }, [currentPage, activeStatus, debouncedSearch])

    const getDeliveries = async () => {
        try {
            setLoading(true)

            let url = `/delivery/records?page=${currentPage}&limit=20`;

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

            setDeliveries(flattenedSubs);
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
                <h1 className="text-2xl font-display font-bold text-foreground">Delivery Management</h1>
                <p className="text-muted-foreground text-sm mt-1">View and manage customer delivery.</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className={cn("admin-card admin-animate-up")}>
                    <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3">
                        <div className="admin-stat-icon" data-tone={"text-emerald-700"}>
                            <MapPin />
                        </div>
                        </div>
                        <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Active Deliveries</p>
                        <p className={cn("mt-1 text-2xl font-bold tracking-tight text-emerald-700")}>{meta?.summary?.active_delivery ?? "-"}</p>
                    </CardContent>
                </Card>
                <Card className={cn("admin-card admin-animate-up")}>
                    <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3">
                        <div className="admin-stat-icon" data-tone={"text-blue-700"}>
                            <Truck/>
                        </div>
                        </div>
                        <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Upcoming Deliveries</p>
                        <p className={cn("mt-1 text-2xl font-bold tracking-tight text-blue-700")}>{meta?.summary?.upcoming_delivery ?? "-"}</p>
                    </CardContent>
                </Card>
                <Card className={cn("admin-card admin-animate-up")}>
                    <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3">
                        <div className="admin-stat-icon" data-tone={"text-amber-700"}>
                            <User />
                        </div>
                        </div>
                        <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Delivered</p>
                        <p className={cn("mt-1 text-2xl font-bold tracking-tight text-amber-700")}>{meta?.summary?.delivered ?? "-"}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by order ID or customer..."
                        className="pl-9 h-10 rounded-xl"
                    />
                </div>
                <div className="flex gap-1 flex-wrap bg-muted/60 rounded-xl p-1">
                    {statusTabs.map((tab) => (
                        <button
                            key={tab}
                            disabled={loading}
                            onClick={() => changeStatus(tab)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize ${statusFilter === tab ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
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
                            <div className="overflow-x-auto overflow-y-hidden">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-border bg-muted/40">
                                            <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Order Id</th>
                                            <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Customer</th>
                                            <th className="px-4 py-3 text-left font-semibold text-muted-foreground">State</th>
                                            <th className="px-4 py-3 text-left font-semibold text-muted-foreground">City</th>
                                            <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Delivery Fee</th>
                                            <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Date Created</th>
                                            <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Status</th>
                                            <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {deliveries.map((delivery) => (
                                            <tr key={delivery.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                                                <td className="px-4 py-3 text-muted-foreground">{delivery?.order_id}</td>
                                                <td className="px-4 py-3">
                                                    <p className="font-medium">{delivery?.first_name} {delivery?.last_name}</p>
                                                    <p className="text-xs text-muted-foreground">{delivery?.email}</p>
                                                </td>
                                                <td className="px-4 py-3 text-muted-foreground">{delivery?.state}</td>
                                                <td className="px-4 py-3 text-muted-foreground">{delivery?.city}</td>
                                                <td className="px-4 py-3 text-muted-foreground">{displayCurrency(delivery?.delivery_fee, "NGN")}</td>
                                                <td className="px-4 py-3 text-muted-foreground">{delivery?.createdAt ? format(new Date(delivery?.createdAt), "dd MMM yyyy") : "N/A"}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusColors[delivery?.status]}`}>
                                                        {delivery?.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex gap-1">
                                                        <ViewDelivery delivery={delivery} />
                                                        <div className="relative group">
                                                            <Button variant="ghost" size="sm" className="h-8 w-8 rounded-lg border border-border/70 p-0">
                                                                <ChevronDown className="h-3.5 w-3.5" />
                                                            </Button>
                                                            <div className="absolute right-0 top-full z-10 mt-1 w-36 rounded-lg border border-border bg-background shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                                                                <button disabled={disablingId === delivery?.id} onClick={() => handleUpdateStatus(delivery.id, "pending")} className="block w-full px-3 py-2 text-left text-xs hover:bg-muted">
                                                                    {(disablingId === delivery?.id) && (status == "pending") ? (
                                                                        "Updating..."
                                                                    ) : (
                                                                        "→ Pending"
                                                                    )}
                                                                </button>
                                                                <button disabled={disablingId === delivery?.id} onClick={() => handleUpdateStatus(delivery.id, "assigned")} className="block w-full px-3 py-2 text-left text-xs hover:bg-muted">
                                                                    {(disablingId === delivery?.id) && (status == "assigned") ? (
                                                                        "Updating..."
                                                                    ) : (
                                                                        "→ Assigned"
                                                                    )}
                                                                </button>
                                                                <button disabled={disablingId === delivery?.id} onClick={() => handleUpdateStatus(delivery.id, "in_transit")} className="block w-full px-3 py-2 text-left text-xs hover:bg-muted">
                                                                    {(disablingId === delivery?.id) && (status == "in_transit") ? (
                                                                        "Updating..."
                                                                    ) : (
                                                                        "→ In Transit"
                                                                    )}
                                                                </button>
                                                                <button disabled={disablingId === delivery?.id} onClick={() => handleUpdateStatus(delivery.id, "delivered")} className="block w-full px-3 py-2 text-left text-xs hover:bg-muted">
                                                                    {(disablingId === delivery?.id) && (status == "delivered") ? (
                                                                        "Updating..."
                                                                    ) : (
                                                                        "→ Delivered"
                                                                    )}
                                                                </button>
                                                                <button disabled={disablingId === delivery?.id} onClick={() => handleUpdateStatus(delivery.id, "failed")} className="block w-full px-3 py-2 text-left text-xs text-destructive hover:bg-muted">
                                                                    {(disablingId === delivery?.id) && (status == "failed") ? (
                                                                        "Updating..."
                                                                    ) : (
                                                                        "→ Failed"
                                                                    )}
                                                                </button>
                                                                <button disabled={disablingId === delivery?.id} onClick={() => handleUpdateStatus(delivery.id, "cancelled")} className="block w-full px-3 py-2 text-left text-xs text-destructive hover:bg-muted">
                                                                    {(disablingId === delivery?.id) && (status == "cancelled") ? (
                                                                        "Updating..."
                                                                    ) : (
                                                                        "→ Cancel"
                                                                    )}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {deliveries.length === 0 && <div className="flex items-center justify-center py-12 text-muted-foreground">No delivery found.</div>}
                            </div>
                        </CardContent>
                    </Card>

                    {meta?.totalPages > 1 && !loading && deliveries?.length > 0 && (
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

export default AdminDeliveries

