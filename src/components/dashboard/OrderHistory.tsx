import {
    Package,
    ChevronRight,
    Clock,
    Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ROUTES } from "@/lib/routes";
import { toast } from "react-toastify";
import { axiosClient } from "@/GlobalApi";
import { useEffect, useState } from "react";
import { FormattedOrderType, OrderMetaType } from "@/types/types";
import { useNavigate, useSearchParams } from "react-router-dom";
import { format } from "date-fns";
import displayCurrency from "@/utils/displayCurrency";
import OrderStatusBadge from "../OrderStatusBadge";
import { LoadingData } from "../LoadingData";
import { ViewOrder } from "../ViewOrder";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
  PaginationLink,
} from "@/components/ui/pagination";

const OrderHistory = () => {

    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate()
    const [orders, setOrders] = useState<FormattedOrderType[]>([]);
    const [loading, setLoading] = useState(true)
    const [meta, setMeta] = useState<OrderMetaType | null>(null);
    const currentPage = Number(searchParams.get("page")) || 1;

    const changePage = (page: number) => {
        const params = new URLSearchParams(searchParams);
        params.set("page", page.toString());

        setSearchParams(params);
    };

    useEffect(() => {
        getOrders()
    }, [currentPage])

    const getOrders = async () => {
        try {
            setLoading(true)
            let url = `/orders/my-orders?page=${currentPage}&limit=20`;

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

    return (
        <div className="space-y-6 animate-fade-in admin-page-bg rounded-3xl p-4 sm:p-5">
            <div>
                <h2 className="text-2xl font-display font-bold text-foreground">Order History</h2>
                <p className="text-muted-foreground mt-1">
                    Track your past and upcoming deliveries.
                </p>
            </div>

            {loading ? (
                <LoadingData/>
            ) : orders.length <= 0 ? (
                <Card className="admin-card">
                    <CardContent className="py-12 text-center">
                        <Package className="mx-auto h-10 w-10 text-muted-foreground/50" />
                        <p className="mt-3 text-muted-foreground">No orders yet. Start your first subscription!</p>
                        <Button className="mt-4" onClick={() => navigate(ROUTES.plans)}>
                            Browse Plans <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <Card className="admin-card">
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-border bg-muted/40">
                                        <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Order ID</th>
                                        <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Date</th>
                                        <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Items</th>
                                        <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Order Type</th>
                                        <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Total</th>
                                        <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Status</th>
                                        <th className="px-4 py-3 text-left font-semibold text-muted-foreground">View</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map((order) => (
                                        <tr key={order?.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                                            <td className="px-4 py-3 font-mono font-medium text-foreground">{order?.id}</td>
                                            <td className="px-4 py-3 text-muted-foreground">{order?.createdAt ? format(new Date(order?.createdAt), "dd MMM yyyy") : "N/A"}</td>
                                            <td className="px-4 py-3 text-muted-foreground">{order?.items?.length} item{order?.items?.length > 1 ? "s" : ""}</td>
                                            <td className="px-4 py-3 text-muted-foreground">{order?.order_type}</td>
                                            <td className="px-4 py-3 font-semibold">{displayCurrency(order?.total_amount, "NGN")}</td>
                                            <td className="px-4 py-3">
                                                <OrderStatusBadge status={order?.status} />
                                            </td>
                                            <td>
                                                <ViewOrder order={order} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}

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
    )}

export default OrderHistory