import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Eye, ChevronDown, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { LoadingData } from "@/components/LoadingData";
import { toast } from "react-toastify";
import { axiosClient } from "@/GlobalApi";
import { OrderStatus, OrderType, OrdersMetaType } from "@/types/admin";
import displayCurrency from "@/utils/displayCurrency";
import { format } from "date-fns";
import { ViewOrder } from "@/components/admin/ViewOrder";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
  PaginationLink,
} from "@/components/ui/pagination";
import { useSearchParams } from "react-router-dom";

const statusColors: Record<string, string> = {
    pending: "bg-amber-500/15 text-amber-700 border-amber-500/20",
    shipped: "bg-blue-500/15 text-blue-700 border-blue-500/20",
    delivered: "bg-emerald-500/15 text-emerald-700 border-emerald-500/20",
    paid: "bg-emerald-500/15 text-emerald-700 border-emerald-500/20",
    payment_failed: "bg-red-500/15 text-red-700 border-red-500/20",
    cancelled: "bg-red-500/15 text-red-700 border-red-500/20",
};

const statusTabs: (OrderStatus | "all")[] = ["all", "paid", "payment_failed", "pending", "shipped", "delivered", "cancelled"];

const AdminOrders = () => {

    const [searchParams, setSearchParams] = useSearchParams();
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
    const [orders, setOrders] = useState<OrderType[]>([]);
    const [meta, setMeta] = useState<OrdersMetaType | null>(null);
    const [loading, setLoading] = useState(true)
    const [disablingId, setDisablingId] = useState<string | null>(null);
    const [status, setStatus] = useState<string | null>(null);
    const currentPage = Number(searchParams.get("page")) || 1;

    const handleUpdateStatus = async (id: string, status: string) => {
        try {
            setDisablingId(id);
            setStatus(status)

            await axiosClient.patch(`/orders/${id}/status`, { status });
            toast.success(`Order marked as ${status}`)

            getOrders()
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
            // slug: activeCategory,
        });
    };

    useEffect(() => {
        getOrders()
    }, [currentPage])

    const getOrders = async () => {
        try {
            setLoading(true)

            let url = `/orders?page=${currentPage}&limit=20`;

            const res = await axiosClient.get(url);

            const orders = res.data.data || [];

            const flattenedOrders = orders.map((order: any) => ({
                id: order.id,
                ...order.attributes,
                status: order.attributes.status,
                user: order.relationships?.userDetails?.data?.attributes || null,
                plan: order.relationships?.planDetails?.data?.attributes || null,
                giftBoxDetails: order.relationships?.giftBoxDetails?.data?.attributes || null,
                giftFormDetails: order.relationships?.giftDetails?.data?.attributes || null,
            }));

            setOrders(flattenedOrders);
            setMeta(res.data.meta);  

        } catch (err: any) {
            toast.error(err.response?.data?.message);
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
            <div>
                <h1 className="text-2xl font-display font-bold text-foreground">Order Management</h1>
                <p className="text-muted-foreground text-sm mt-1">
                    View, track, and manage all customer orders.
                </p>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by name or reference..."
                        className="pl-9 h-10 rounded-xl"
                    />
                </div>
                <div className="flex gap-1 flex-wrap bg-muted/60 rounded-xl p-1">
                    {statusTabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setStatusFilter(tab)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize ${statusFilter === tab ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                        >
                            {tab === "all" ? "All" : tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <Card className="admin-card admin-animate-up" style={{ animationDelay: "160ms" }}>
                <CardContent className="p-0">
                    <div className="overflow-x-auto overflow-y-hidden">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border bg-muted/40">
                                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Reference</th>
                                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Order Type</th>
                                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Customer</th>
                                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Date</th>
                                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Plan</th>
                                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Total</th>
                                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Status</th>
                                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map((order) => (
                                    <tr key={order?.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                                        <td className="px-4 py-3 font-mono font-medium">{order?.id}</td>
                                        <td className="px-4 py-3 font-mono font-medium">{order?.order_type}</td>
                                        <td className="px-4 py-3">
                                            <p className="font-medium">{order?.user?.first_name} {order?.user?.last_name}</p>
                                            <p className="text-xs text-muted-foreground">{order?.user?.email}</p>
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground">{order?.createdAt ? format(order?.createdAt, "MMM dd, yyyy") : "None"}</td>
                                        <td className="px-4 py-3"><Badge variant="secondary">{order?.plan?.name}</Badge></td>
                                        <td className="px-4 py-3 font-semibold">{displayCurrency(order?.total_amount, "NGN")}</td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusColors[order?.status]}`}>
                                                {order?.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex gap-1">
                                                <ViewOrder order={order} />
                                                <div className="relative group">
                                                    <Button variant="ghost" size="sm" className="h-8 w-8 rounded-lg border border-border/70 p-0">
                                                        <ChevronDown className="h-3.5 w-3.5" />
                                                    </Button>
                                                    <div className="absolute right-0 top-full z-10 mt-1 w-36 rounded-lg border border-border bg-background shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                                                        <button disabled={disablingId === order?.id} onClick={() => handleUpdateStatus(order.id, "pending")} className="block w-full px-3 py-2 text-left text-xs hover:bg-muted">
                                                            {(disablingId === order?.id) && (status == "pending") ? (
                                                                "Updating..."
                                                            ) : (
                                                                "→ Pending"
                                                            )}
                                                        </button>
                                                        <button disabled={disablingId === order?.id} onClick={() => handleUpdateStatus(order.id, "paid")} className="block w-full px-3 py-2 text-left text-xs hover:bg-muted">
                                                            {(disablingId === order?.id) && (status == "paid") ? (
                                                                "Updating..."
                                                            ) : (
                                                                "→ Paid"
                                                            )}
                                                        </button>
                                                        <button disabled={disablingId === order?.id} onClick={() => handleUpdateStatus(order.id, "shipped")} className="block w-full px-3 py-2 text-left text-xs hover:bg-muted">
                                                            {(disablingId === order?.id) && (status == "shipped") ? (
                                                                "Updating..."
                                                            ) : (
                                                                "→ Shipped"
                                                            )}
                                                        </button>
                                                        <button disabled={disablingId === order?.id} onClick={() => handleUpdateStatus(order.id, "delivered")} className="block w-full px-3 py-2 text-left text-xs hover:bg-muted">
                                                            {(disablingId === order?.id) && (status == "delivered") ? (
                                                                "Updating..."
                                                            ) : (
                                                                "→ Delivered"
                                                            )}
                                                        </button>
                                                        <button disabled={disablingId === order?.id} onClick={() => handleUpdateStatus(order.id, "cancelled")} className="block w-full px-3 py-2 text-left text-xs text-destructive hover:bg-muted">
                                                            {(disablingId === order?.id) && (status == "cancelled") ? (
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
                        {orders.length <= 0 && (
                            <div className="flex items-center justify-center py-12 text-muted-foreground">No orders found.</div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {meta?.totalPages > 1 && !loading && orders?.length > 0 && (
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

        </div>
    );
};

export default AdminOrders;
