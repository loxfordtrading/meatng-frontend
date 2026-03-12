import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Eye, ChevronDown, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { mockAdminOrders, formatAdminPrice, type AdminOrder, type AdminOrderLineItem } from "@/data/adminData";
import { tokenStorage } from "@/lib/auth/tokenStorage";
import { createOrder, getOrderById, listOrders, updateOrderStatus, type Order as ApiOrder } from "@/lib/api/admin";
import { LoadingData } from "@/components/LoadingData";
import { toast } from "react-toastify";
import { axiosClient } from "@/GlobalApi";
import { OrderStatus, OrderType, OrdersMetaType } from "@/types/admin";
import displayCurrency from "@/utils/displayCurrency";
import { format } from "date-fns";

type StatusFilter = "all" | "Processing" | "In Transit" | "Delivered" | "Cancelled";

const statusColors: Record<string, string> = {
    Processing: "bg-amber-500/15 text-amber-700 border-amber-500/20",
    "In Transit": "bg-blue-500/15 text-blue-700 border-blue-500/20",
    Delivered: "bg-emerald-500/15 text-emerald-700 border-emerald-500/20",
    Cancelled: "bg-red-500/15 text-red-700 border-red-500/20",
};

const normalizeStatus = (s?: string): AdminOrder["status"] => {
    if (!s) return "Processing";
    const lower = s.toLowerCase();
    if (lower.includes("transit")) return "In Transit";
    if (lower.includes("deliver")) return "Delivered";
    if (lower.includes("cancel")) return "Cancelled";
    return "Processing";
};

const formatDate = (iso?: string): string => {
    if (!iso) return "—";
    try {
        return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
    } catch {
        return iso;
    }
};

const mapApiOrder = (o: ApiOrder): AdminOrder => {
    const raw = o.raw ?? {};
    const customer = (raw.customer ?? raw.user ?? {}) as Record<string, unknown>;
    const apiLineItems = o.lineItems ?? (Array.isArray(raw.line_items) ? raw.line_items as AdminOrderLineItem[] : undefined);
    return {
        id: o.id,
        customerName: String(raw.customerName ?? raw.customer_name ?? customer.name ?? customer.firstName ?? "—"),
        customerEmail: String(raw.customerEmail ?? raw.customer_email ?? customer.email ?? "—"),
        date: formatDate(o.createdAt ?? String(raw.createdAt ?? "")),
        items: Number(raw.items ?? raw.itemCount ?? (apiLineItems?.length ?? 0)),
        total: o.total ?? 0,
        status: normalizeStatus(o.status),
        plan: o.planName ?? String(raw.plan ?? raw.planName ?? raw.subscriptionPlan ?? "—"),
        planWeightKg: o.planWeightKg ?? Number(raw.planWeightKg ?? raw.plan_weight_kg ?? 0),
        address: String(raw.address ?? raw.deliveryAddress ?? raw.shipping_address ?? "—"),
        paymentMethod: String(raw.paymentMethod ?? raw.payment_method ?? "—"),
        lineItems: apiLineItems,
    };
};

const statusTabs: StatusFilter[] = ["all", "Processing", "In Transit", "Delivered", "Cancelled"];

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

const AdminOrders = () => {

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
    const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
    const [orders, setOrders] = useState<OrderType[]>([]);
    const [meta, setMeta] = useState<OrdersMetaType | null>(null);
    const [loading, setLoading] = useState(true)
    const token = tokenStorage.getAdminToken();
    const queryClient = useQueryClient();

    // const { data: apiOrders, isLoading, isError } = useQuery({
    //     queryKey: ["admin-orders"],
    //     queryFn: async () => {
    //         try { return await listOrders(token); } catch { return null; }
    //     },
    //     staleTime: 30_000,
    // });

    // const orders: AdminOrder[] = useMemo(() => {
    //     if (apiOrders) return apiOrders.map(mapApiOrder);
    //     return [];
    //     // return mockAdminOrders;
    // }, [apiOrders]);

    // const usingMock = !apiOrders;

    const statusMutation = useMutation({
        mutationFn: ({ id, status }: { id: string; status: string }) =>
            updateOrderStatus(id, status, token),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-orders"] }),
    });

    // const createOrderMutation = useMutation({
    //     mutationFn: () =>
    //         createOrder(
    //             {
    //                 status: "Processing",
    //                 total: 0,
    //                 currency: "NGN",
    //                 customerId: apiOrders?.[0]?.customerId,
    //             },
    //             token,
    //         ),
    //     onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-orders"] }),
    // });

    const updateStatus = (orderId: string, newStatus: AdminOrder["status"]) => {
        // if (!usingMock) statusMutation.mutate({ id: orderId, status: newStatus });
        if (selectedOrder?.id === orderId) setSelectedOrder((prev) => prev ? { ...prev, status: newStatus } : null);
    };
    const handleViewOrder = async (order: AdminOrder) => {
        setSelectedOrder(order);
        // if (usingMock) return;
        try {
            const detailed = await getOrderById(order.id, token);
            setSelectedOrder(mapApiOrder(detailed));
        } catch {
            // Keep list payload if detail fetch fails.
        }
    };

    const filteredOrders = orders.filter((o) => {
        // const matchesSearch =
        //     o.customerName.toLowerCase().includes(search.toLowerCase()) ||
        //     o.id.toLowerCase().includes(search.toLowerCase());
        // const matchesStatus = statusFilter === "all" || o.status === statusFilter;
        // return matchesSearch && matchesStatus;
    });

    useEffect(() => {
        getOrders()
    }, [])

    const getOrders = async () => {
        try {
            const res = await axiosClient.get(`/orders`);

            const orders = res.data.data || [];

            // flatten orders
            // const flattenedOrders = orders.map((order: any) => ({
            //     id: order.id,
            //     ...order.attributes,
            //     user: order.relationships?.userDetails?.data?.attributes || null,
            //     plan: order.relationships?.planDetails?.data?.attributes || null,
            // }));

            const flattenedOrders = orders.map((order: any) => ({
                id: order.id,
                ...order.attributes,
                status: mapStatus(order.attributes.status),
                user: order.relationships?.userDetails?.data?.attributes || null,
                plan: order.relationships?.planDetails?.data?.attributes || null,
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

    // if (isError) {
    //     return (
    //         <div className="flex justify-center py-24 text-muted-foreground">
    //         Failed to load orders
    //         </div>
    //     );
    // }

    return (
        <div className="space-y-6 animate-fade-in admin-page-bg rounded-3xl p-4 sm:p-5">
            <div>
                <h1 className="text-2xl font-display font-bold text-foreground">Order Management</h1>
                <p className="text-muted-foreground text-sm mt-1">
                    View, track, and manage all customer orders.
                    {/* {usingMock && <span className="ml-1 text-xs text-amber-600">(demo data)</span>} */}
                </p>
                {/* {!usingMock && (
                    <div className="mt-3">
                        <Button size="sm" variant="outline" onClick={() => createOrderMutation.mutate()} disabled={createOrderMutation.isPending}>
                            {createOrderMutation.isPending ? "Creating..." : "Create Test Order"}
                        </Button>
                    </div>
                )} */}
                {orders?.length > 0 && (
                    <div className="mt-3">
                        <Button size="sm" variant="outline" 
                            // onClick={() => createOrderMutation.mutate()} disabled={createOrderMutation.isPending}
                        >
                            Create Test Order
                            {/* {createOrderMutation.isPending ? "Creating..." : "Create Test Order"} */}
                        </Button>
                    </div>
                )}
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by name or reference..."
                        className="pl-9 h-10 rounded-xl"
                    />
                </div>
                <div className="flex gap-1 bg-muted/60 rounded-xl p-1">
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
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border bg-muted/40">
                                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Reference</th>
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
                                                {/* <Button variant="ghost" size="sm" className="h-8 w-8 rounded-lg border border-border/70 p-0" onClick={() => void handleViewOrder(order)}>
                                                    <Eye className="h-3.5 w-3.5" />
                                                </Button> */}
                                                {order?.status !== "Delivered" && order?.status !== "Cancelled" && (
                                                    <div className="relative group">
                                                        <Button variant="ghost" size="sm" className="h-8 w-8 rounded-lg border border-border/70 p-0">
                                                            <ChevronDown className="h-3.5 w-3.5" />
                                                        </Button>
                                                        <div className="absolute right-0 top-full z-10 mt-1 w-36 rounded-lg border border-border bg-background shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                                                            {order?.status === "Processing" && (
                                                                <button onClick={() => updateStatus(order.id, "In Transit")} className="block w-full px-3 py-2 text-left text-xs hover:bg-muted">
                                                                    → In Transit
                                                                </button>
                                                            )}
                                                            {(order.status === "Processing" || order.status === "In Transit") && (
                                                                <button onClick={() => updateStatus(order.id, "Delivered")} className="block w-full px-3 py-2 text-left text-xs hover:bg-muted">
                                                                    → Delivered
                                                                </button>
                                                            )}
                                                            <button onClick={() => updateStatus(order.id, "Cancelled")} className="block w-full px-3 py-2 text-left text-xs text-destructive hover:bg-muted">
                                                                → Cancel
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
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

            {/* Order Detail Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setSelectedOrder(null)} />
                    <Card className="admin-card relative z-10 max-w-lg w-full max-h-[80vh] overflow-y-auto animate-fade-in">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Order {selectedOrder?.id}</CardTitle>
                                <Button variant="ghost" size="sm" onClick={() => setSelectedOrder(null)}>✕</Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div><span className="text-muted-foreground">Customer</span><p className="font-medium">{selectedOrder.customerName}</p></div>
                                <div><span className="text-muted-foreground">Email</span><p className="font-medium">{selectedOrder.customerEmail}</p></div>
                                <div><span className="text-muted-foreground">Date</span><p className="font-medium">{selectedOrder.date}</p></div>
                                <div><span className="text-muted-foreground">Plan</span><p className="font-medium">{selectedOrder.plan}{selectedOrder.planWeightKg ? ` (${selectedOrder.planWeightKg}kg)` : ""}</p></div>
                                <div><span className="text-muted-foreground">Items</span><p className="font-medium">{selectedOrder.items} items</p></div>
                                <div><span className="text-muted-foreground">Payment</span><p className="font-medium">{selectedOrder.paymentMethod}</p></div>
                            </div>

                            {/* Line items breakdown */}
                            {selectedOrder.lineItems && selectedOrder.lineItems.length > 0 && (
                                <div className="rounded-lg border border-border p-3 space-y-3">
                                    {/* Mandatory items */}
                                    {selectedOrder.lineItems.filter((li) => li.type === "mandatory").length > 0 && (
                                        <div>
                                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Mandatory Cuts</p>
                                            {selectedOrder.lineItems.filter((li) => li.type === "mandatory").map((li) => (
                                                <div key={li.name} className="flex justify-between text-sm py-0.5">
                                                    <span>{li.name}</span>
                                                    <span className="text-muted-foreground">{li.weightG >= 1000 ? `${li.weightG / 1000}kg` : `${li.weightG}g`} x{li.quantity}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {/* Offal picks */}
                                    {selectedOrder.lineItems.filter((li) => li.type === "offal-pick").length > 0 && (
                                        <div>
                                            <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1.5">Offal Picks</p>
                                            {selectedOrder.lineItems.filter((li) => li.type === "offal-pick").map((li) => (
                                                <div key={li.name} className="flex justify-between text-sm py-0.5">
                                                    <span>{li.name}</span>
                                                    <span className="text-muted-foreground">{li.weightG >= 1000 ? `${li.weightG / 1000}kg` : `${li.weightG}g`} x{li.quantity}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {/* Build picks */}
                                    {selectedOrder.lineItems.filter((li) => li.type === "build-pick").length > 0 && (
                                        <div>
                                            <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1.5">Custom Picks</p>
                                            {selectedOrder.lineItems.filter((li) => li.type === "build-pick").map((li) => (
                                                <div key={li.name} className="flex justify-between text-sm py-0.5">
                                                    <span>{li.name}</span>
                                                    <span className="text-muted-foreground">{li.weightG >= 1000 ? `${li.weightG / 1000}kg` : `${li.weightG}g`} x{li.quantity}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {/* Add-ons */}
                                    {selectedOrder.lineItems.filter((li) => li.type === "add-on").length > 0 && (
                                        <div>
                                            <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider mb-1.5">Add-ons</p>
                                            {selectedOrder.lineItems.filter((li) => li.type === "add-on").map((li) => (
                                                <div key={li.name} className="flex justify-between text-sm py-0.5">
                                                    <span>{li.name}</span>
                                                    <span className="text-muted-foreground">{li.weightG >= 1000 ? `${li.weightG / 1000}kg` : `${li.weightG}g`} x{li.quantity}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="rounded-lg border border-border p-3">
                                <span className="text-xs text-muted-foreground">Delivery Address</span>
                                <p className="text-sm font-medium mt-1">{selectedOrder.address}</p>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground text-sm">Total</span>
                                <span className="text-xl font-bold text-primary">{formatAdminPrice(selectedOrder.total)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground text-sm">Status</span>
                                <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusColors[selectedOrder.status]}`}>
                                    {selectedOrder.status}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default AdminOrders;
