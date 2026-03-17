import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Users, ShoppingBag, DollarSign, Loader2, Trash2 } from "lucide-react";
import { AdminMetricCard } from "@/components/admin/AdminMetricCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { mockAdminCustomers, formatAdminPrice, type AdminCustomer } from "@/data/adminData";
import { tokenStorage } from "@/lib/auth/tokenStorage";
import { deleteAdminUser, listAdminUsers, type AdminUser as ApiUser } from "@/lib/api/admin";
import { axiosClient } from "@/GlobalApi";
import { toast } from "react-toastify";
import { CustomerMeta, CustomerType } from "@/types/admin";
import { format } from "date-fns";
import { LoadingData } from "@/components/LoadingData";
import displayCurrency from "@/utils/displayCurrency";
import { ViewCustomer } from "@/components/admin/ViewCustomer";
import { cn } from "@/lib/utils";

const statusBadge: Record<string, string> = {
    true: "bg-emerald-500/15 text-emerald-700 border-emerald-500/20",
    false: "bg-red-500/15 text-red-700 border-red-500/20",
};

const formatDate = (iso?: string): string => {
    if (!iso) return "—";
    try {
        return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
    } catch {
        return iso;
    }
};

const AdminCustomers = () => {
    const [search, setSearch] = useState("");
    const [selected, setSelected] = useState<CustomerType | null>(null);

    const [customers, setCustomers] = useState<CustomerType[]>([]);
    const [meta, setMeta] = useState<CustomerMeta | null>(null);
    const [loading, setLoading] = useState(true)
    const [deletingPlanId, setDeletingPlanId] = useState<string | null>(null);

    const token = tokenStorage.getAdminToken();
    const queryClient = useQueryClient();

    const { data: apiUsers, isLoading } = useQuery({
        queryKey: ["admin-users"],
        queryFn: async () => {
            try { return await listAdminUsers(token); } catch { return null; }
        },
        staleTime: 60_000,
    });

    // const customers: AdminCustomer[] = useMemo(() => {
    //     if (apiUsers) return apiUsers.map(mapApiUser);
    //     return [];
    //     // return mockAdminCustomers;          
    // }, [apiUsers]);

    // const usingMock = !apiUsers;
    const deleteMutation = useMutation({
        mutationFn: (id: string) => deleteAdminUser(id, token),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-users"] });
            setSelected(null);
        },
    });

    useEffect(() => {
        getCustomers()
    }, [])

    const getCustomers = async () => {
        try {
            setLoading(true)
            const res = await axiosClient.get(`/users/all`);

            const customers = res.data.data || [];

            const flattenedCustomers = customers.map((customer: any) => ({
                id: customer.id,
                ...customer.attributes,
            }));

            setCustomers(flattenedCustomers);
            setMeta(res.data.meta);  

        } catch (err: any) {
            toast.error(err.response?.data?.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this customer? This cannot be undone.")) return;
        try {
            setDeletingPlanId(id);
            const res = await axiosClient.delete(`/users/delete-user/${id}`)
            toast.success("Customer deleted successfully")
            getCustomers()
        } catch (error) {
            toast.error(error.response?.data?.message);
        } finally {
            setDeletingPlanId(null);
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
                <h1 className="text-2xl font-display font-bold text-foreground">Customer Management</h1>
                <p className="text-muted-foreground text-sm mt-1">
                    View and manage your customer base.
                    {/* {usingMock && <span className="ml-1 text-xs text-amber-600">(demo data)</span>} */}
                </p>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <Card className={cn("admin-card admin-animate-up")}>
                    <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3">
                        <div className="admin-stat-icon" data-tone={"text-emerald-700"}>
                            <Users />
                        </div>
                        </div>
                        <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Total Customers</p>
                        <p className={cn("mt-1 text-2xl font-bold tracking-tight text-emerald-700")}>{meta?.total_customers}</p>
                    </CardContent>
                </Card>
                <Card className={cn("admin-card admin-animate-up")}>
                    <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3">
                        <div className="admin-stat-icon" data-tone={"text-blue-700"}>
                            <ShoppingBag/>
                        </div>
                        </div>
                        <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Active Subscribers</p>
                        <p className={cn("mt-1 text-2xl font-bold tracking-tight text-blue-700")}>{meta?.active_subscribers}</p>
                    </CardContent>
                </Card>
                <Card className={cn("admin-card admin-animate-up")}>
                    <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3">
                        <div className="admin-stat-icon" data-tone={"text-amber-700"}>
                            <DollarSign />
                        </div>
                        </div>
                        <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Total Revenue</p>
                        <p className={cn("mt-1 text-2xl font-bold tracking-tight text-amber-700")}>{displayCurrency(meta?.total_revenue, "NGN")}</p>
                    </CardContent>
                </Card>
                <Card className={cn("admin-card admin-animate-up")}>
                    <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3">
                        <div className="admin-stat-icon" data-tone={"text-emerald-700"}>
                            <Users />
                        </div>
                        </div>
                        <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Verified Users</p>
                        <p className={cn("mt-1 text-2xl font-bold tracking-tight text-emerald-700")}>{meta?.verified_users}</p>
                    </CardContent>
                </Card>
                <Card className={cn("admin-card admin-animate-up")}>
                    <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3">
                        <div className="admin-stat-icon" data-tone={"text-blue-700"}>
                            <Users />
                        </div>
                        </div>
                        <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Community Members</p>
                        <p className={cn("mt-1 text-2xl font-bold tracking-tight text-blue-700")}>{meta?.community_members}</p>
                    </CardContent>
                </Card>
                <Card className={cn("admin-card admin-animate-up")}>
                    <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3">
                        <div className="admin-stat-icon" data-tone={"text-amber-700"}>
                            <Users />
                        </div>
                        </div>
                        <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Subscribed Users</p>
                        <p className={cn("mt-1 text-2xl font-bold tracking-tight text-amber-700")}>{meta?.subscribed_users}</p>
                    </CardContent>
                </Card>
                <Card className={cn("admin-card admin-animate-up")}>
                    <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3">
                        <div className="admin-stat-icon" data-tone={"text-emerald-700"}>
                            <Users />
                        </div>
                        </div>
                        <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Active Users</p>
                        <p className={cn("mt-1 text-2xl font-bold tracking-tight text-emerald-700")}>{meta?.active_users}</p>
                    </CardContent>
                </Card>
                <Card className={cn("admin-card admin-animate-up")}>
                    <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3">
                        <div className="admin-stat-icon" data-tone={"text-blue-700"}>
                            <ShoppingBag/>
                        </div>
                        </div>
                        <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Inactive Users</p>
                        <p className={cn("mt-1 text-2xl font-bold tracking-tight text-blue-700")}>{meta?.inactive_users}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search customers..." className="pl-9 h-10 rounded-xl" />
            </div>

            {/* Table */}
            <Card className="admin-card admin-animate-up" style={{ animationDelay: "180ms" }}>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border bg-muted/40">
                                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Customer</th>
                                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Plan</th>
                                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Status</th>
                                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Orders</th>
                                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Total Spent</th>
                                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Member Since</th>
                                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {customers.map((c) => (
                                    <tr key={c?.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-xs font-bold text-primary">
                                                    {c.first_name[0]} {c.last_name[0]}
                                                </div>
                                                <div>
                                                    <p className="font-medium">{c?.first_name} {c.last_name}</p>
                                                    <p className="text-xs text-muted-foreground">{c?.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">{c.plan_name ? <Badge variant="secondary">{c.plan_name}</Badge> : <span className="text-muted-foreground text-xs">—</span>}</td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                                                    statusBadge[String(c?.is_active)]
                                                }`}
                                            >
                                                {c?.is_active ? "Active" : "Inactive"}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground">{c?.total_orders}</td>
                                        <td className="px-4 py-3 font-semibold">{displayCurrency(c?.total_spent, "NGN")}</td>
                                        <td className="px-4 py-3 text-muted-foreground">{c?.member_since ? format(c?.member_since, "MMM dd, yyyy") : <span className="text-muted-foreground text-xs">—</span>}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1">
                                                <ViewCustomer customer={c} getCustomers={getCustomers}/>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                    onClick={() => handleDelete(c?.id)}
                                                    disabled={deletingPlanId === c?.id}
                                                >
                                                    {deletingPlanId === c?.id ? (
                                                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                                    ) : (
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    )}
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {customers?.length <= 0 && <div className="flex items-center justify-center py-12 text-muted-foreground">No customers found.</div>}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminCustomers;
