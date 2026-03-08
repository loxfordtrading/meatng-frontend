import { useState, useMemo } from "react";
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

const statusBadge: Record<string, string> = {
    Active: "bg-emerald-500/15 text-emerald-700 border-emerald-500/20",
    Paused: "bg-amber-500/15 text-amber-700 border-amber-500/20",
    Cancelled: "bg-red-500/15 text-red-700 border-red-500/20",
    "No Subscription": "bg-slate-500/15 text-slate-600 border-slate-500/20",
};

const formatDate = (iso?: string): string => {
    if (!iso) return "—";
    try {
        return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
    } catch {
        return iso;
    }
};

const mapApiUser = (u: ApiUser): AdminCustomer => {
    const raw = u.raw ?? {};
    const subStatus = String(raw.subscriptionStatus ?? raw.subscription_status ?? "");
    let status: AdminCustomer["status"] = "No Subscription";
    if (subStatus.toLowerCase().includes("active") || u.isActive) status = "Active";
    else if (subStatus.toLowerCase().includes("pause")) status = "Paused";
    else if (subStatus.toLowerCase().includes("cancel")) status = "Cancelled";

    return {
        id: u.id,
        name: u.name ?? String(raw.name ?? u.email?.split("@")[0] ?? "—"),
        email: u.email ?? "—",
        phone: u.phone ?? String(raw.phone ?? "—"),
        plan: String(raw.plan ?? raw.planName ?? raw.subscriptionPlan ?? "") || null,
        status,
        joinDate: formatDate(u.createdAt ?? String(raw.createdAt ?? "")),
        totalOrders: Number(raw.totalOrders ?? raw.order_count ?? 0),
        totalSpent: Number(raw.totalSpent ?? raw.total_spent ?? 0),
        lastOrder: String(raw.lastOrderDate ?? raw.last_order_date ?? "") || null,
    };
};

const AdminCustomers = () => {
    const [search, setSearch] = useState("");
    const [selected, setSelected] = useState<AdminCustomer | null>(null);

    const token = tokenStorage.getAdminToken();
    const queryClient = useQueryClient();

    const { data: apiUsers, isLoading } = useQuery({
        queryKey: ["admin-users"],
        queryFn: async () => {
            try { return await listAdminUsers(token); } catch { return null; }
        },
        staleTime: 60_000,
    });

    const customers: AdminCustomer[] = useMemo(() => {
        if (apiUsers) return apiUsers.map(mapApiUser);
        return [];
        // return mockAdminCustomers;          
    }, [apiUsers]);

    // const usingMock = !apiUsers;
    const deleteMutation = useMutation({
        mutationFn: (id: string) => deleteAdminUser(id, token),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-users"] });
            setSelected(null);
        },
    });

    const filtered = customers.filter(
        (c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase())
    );

    const activeCount = customers.filter((c) => c.status === "Active").length;
    const totalSpent = customers.reduce((s, c) => s + c.totalSpent, 0);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-24 admin-page-bg rounded-3xl">
                <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
            </div>
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <AdminMetricCard
                    label="Total Customers"
                    value={customers.length.toString()}
                    icon={Users}
                    tone="blue"
                    delayMs={0}
                />
                <AdminMetricCard
                    label="Active Subscribers"
                    value={activeCount.toString()}
                    icon={ShoppingBag}
                    tone="emerald"
                    delayMs={70}
                />
                <AdminMetricCard
                    label="Total Revenue"
                    value={formatAdminPrice(totalSpent)}
                    icon={DollarSign}
                    tone="amber"
                    delayMs={140}
                />
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
                                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Joined</th>
                                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((c) => (
                                    <tr key={c.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-xs font-bold text-primary">
                                                    {c.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                                                </div>
                                                <div>
                                                    <p className="font-medium">{c.name}</p>
                                                    <p className="text-xs text-muted-foreground">{c.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">{c.plan ? <Badge variant="secondary">{c.plan}</Badge> : <span className="text-muted-foreground text-xs">—</span>}</td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusBadge[c.status]}`}>{c.status}</span>
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground">{c.totalOrders}</td>
                                        <td className="px-4 py-3 font-semibold">{formatAdminPrice(c.totalSpent)}</td>
                                        <td className="px-4 py-3 text-muted-foreground">{c.joinDate}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1">
                                                <Button variant="ghost" size="sm" onClick={() => setSelected(c)}>View</Button>
                                                {/* {!usingMock && ( */}
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                        onClick={() => {
                                                            if (!confirm(`Delete ${c.name}? This cannot be undone.`)) return;
                                                            deleteMutation.mutate(c.id);
                                                        }}
                                                        disabled={deleteMutation.isPending}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                {/* )} */}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filtered.length === 0 && <div className="flex items-center justify-center py-12 text-muted-foreground">No customers found.</div>}
                    </div>
                </CardContent>
            </Card>

            {/* Detail Modal */}
            {selected && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setSelected(null)} />
                    <Card className="admin-card relative z-10 max-w-md w-full animate-fade-in">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>{selected.name}</CardTitle>
                                <Button variant="ghost" size="sm" onClick={() => setSelected(null)}>✕</Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div><span className="text-muted-foreground">Email</span><p className="font-medium">{selected.email}</p></div>
                                <div><span className="text-muted-foreground">Phone</span><p className="font-medium">{selected.phone}</p></div>
                                <div><span className="text-muted-foreground">Plan</span><p className="font-medium">{selected.plan || "None"}</p></div>
                                <div><span className="text-muted-foreground">Status</span><p className="font-medium">{selected.status}</p></div>
                                <div><span className="text-muted-foreground">Total Orders</span><p className="font-medium">{selected.totalOrders}</p></div>
                                <div><span className="text-muted-foreground">Total Spent</span><p className="font-medium">{formatAdminPrice(selected.totalSpent)}</p></div>
                                <div><span className="text-muted-foreground">Joined</span><p className="font-medium">{selected.joinDate}</p></div>
                                <div><span className="text-muted-foreground">Last Order</span><p className="font-medium">{selected.lastOrder || "—"}</p></div>
                            </div>
                            <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
                                <Button size="sm" variant="outline">Pause Subscription</Button>
                                <Button size="sm" variant="outline">Add Credit</Button>
                                <Button size="sm" variant="outline" className="text-destructive hover:text-destructive">Reset Password</Button>
                                {/* {!usingMock && ( */}
                                    <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={() => {
                                            if (!selected?.id) return;
                                            if (!confirm("Delete this customer account? This action cannot be undone.")) return;
                                            deleteMutation.mutate(selected.id);
                                        }}
                                        disabled={deleteMutation.isPending}
                                    >
                                        {deleteMutation.isPending ? "Deleting..." : "Delete User"}
                                    </Button>
                                {/* )} */}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default AdminCustomers;
