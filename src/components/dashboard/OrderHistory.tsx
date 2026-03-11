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
import { FormattedOrderType } from "@/types/types";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import displayCurrency from "@/utils/displayCurrency";
import OrderStatusBadge from "../OrderStatusBadge";
import ViewOrder from "../ViewOrder";
import { LoadingData } from "../LoadingData";

const OrderHistory = () => {

    const navigate = useNavigate()
    const [orders, setOrders] = useState<FormattedOrderType[]>([]);
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        getOrders()
    }, [])

    const getOrders = async () => {
        try {
            const res = await axiosClient.get(`/orders/my-orders`);

            const orders = res.data.data || [];

            const formattedOrders: FormattedOrderType[] = orders.map((order: any) => ({
                id: order.id,
                userId: order.attributes.user_id,
                planId: order.attributes.plan_id,
                status: order.attributes.status,
                totalAmount: order.attributes.total_amount,
                createdAt: order.attributes.createdAt,
                updatedAt: order.attributes.updatedAt,

                items: order.attributes.items.map((item: any) => ({
                    productId: item.product_id,
                    name: item.name,
                    unitPrice: item.unit_price,
                    quantity: item.quantity,
                    itemType: item.item_type,
                    isPrefilled: item.is_prefilled,
                })),

                plan: {
                    id: order.relationships?.planDetails?.data?.id,
                    name: order.relationships?.planDetails?.data?.attributes?.name,
                    maxItems: order.relationships?.planDetails?.data?.attributes?.max_items,
                },
            }));

            setOrders(formattedOrders);

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
                                        <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Reference</th>
                                        <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Date</th>
                                        <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Items</th>
                                        <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Total</th>
                                        <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Status</th>
                                        <th className="px-4 py-3 text-left font-semibold text-muted-foreground">View</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map((order) => (
                                        <tr key={order.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                                            <td className="px-4 py-3 font-mono font-medium text-foreground">{order?.id}</td>
                                            <td className="px-4 py-3 text-muted-foreground">{order?.createdAt ? format(new Date(order?.createdAt), "dd MMM yyyy") : "N/A"}</td>
                                            {/* <td className="px-4 py-3 text-muted-foreground">{order?.createdAt ? format(new Date(order?.createdAt), "dd MMM yyyy, hh:mm a") : "N/A"}</td> */}
                                            <td className="px-4 py-3 text-muted-foreground">{order?.items?.length} item{order?.items?.length > 1 ? "s" : ""}</td>
                                            <td className="px-4 py-3 font-semibold">{displayCurrency(order?.totalAmount, "NGN")}</td>
                                            <td className="px-4 py-3">
                                                <OrderStatusBadge status={order.status} />
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
        </div>
    )}

export default OrderHistory