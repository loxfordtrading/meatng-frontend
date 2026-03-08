import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Search, Pause, Play, X as XIcon, TrendingDown, Repeat, DollarSign } from "lucide-react";
import { AdminMetricCard } from "@/components/admin/AdminMetricCard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { mockAdminSubscriptions, mockKPIs, formatAdminPrice, type AdminSubscription } from "@/data/adminData";
import { tokenStorage } from "@/lib/auth/tokenStorage";
import {
    createBox,
    deleteBox,
    getBoxById,
    listActiveBoxes,
    listBoxes,
    updateBox,
    type Box,
} from "@/lib/api/admin";

type SubFilter = "all" | "Active" | "Paused" | "Cancelled";

const statusColors: Record<string, string> = {
    Active: "bg-emerald-500/15 text-emerald-700 border-emerald-500/20",
    Paused: "bg-amber-500/15 text-amber-700 border-amber-500/20",
    Cancelled: "bg-red-500/15 text-red-700 border-red-500/20",
};

const AdminSubscriptions = () => {
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<SubFilter>("all");
    // const [subs, setSubs] = useState<AdminSubscription[]>(mockAdminSubscriptions);
    const [subs, setSubs] = useState<AdminSubscription[]>([]);
    const [selectedBox, setSelectedBox] = useState<Box | null>(null);
    const token = tokenStorage.getAdminToken();
    const queryClient = useQueryClient();

    const { data: boxes } = useQuery({
        queryKey: ["admin-boxes"],
        queryFn: async () => {
            try { return await listBoxes(token); } catch { return null; }
        },
        staleTime: 60_000,
    });
    const { data: activeBoxes } = useQuery({
        queryKey: ["admin-boxes-active"],
        queryFn: async () => {
            try { return await listActiveBoxes(token); } catch { return null; }
        },
        staleTime: 60_000,
    });
    const createBoxMutation = useMutation({
        mutationFn: () =>
            createBox(
                {
                    name: `Draft Box ${new Date().toISOString().slice(0, 16)}`,
                    description: "Draft template",
                    isActive: false,
                    price: 0,
                    weightKg: 0,
                },
                token,
            ),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-boxes"] });
            queryClient.invalidateQueries({ queryKey: ["admin-boxes-active"] });
        },
    });
    const updateBoxMutation = useMutation({
        mutationFn: ({ id, input }: { id: string; input: Parameters<typeof updateBox>[1] }) =>
            updateBox(id, input, token),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-boxes"] });
            queryClient.invalidateQueries({ queryKey: ["admin-boxes-active"] });
        },
    });
    const deleteBoxMutation = useMutation({
        mutationFn: (id: string) => deleteBox(id, token),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-boxes"] });
            queryClient.invalidateQueries({ queryKey: ["admin-boxes-active"] });
            setSelectedBox(null);
        },
    });

    const filtered = subs.filter((s) => {
        const matchSearch = s.customerName.toLowerCase().includes(search.toLowerCase());
        const matchFilter = filter === "all" || s.status === filter;
        return matchSearch && matchFilter;
    });

    const updateStatus = (id: string, status: AdminSubscription["status"]) => {
        setSubs((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)));
    };

    const activeSubs = subs.filter((s) => s.status === "Active");
    const avgValue = activeSubs.length ? activeSubs.reduce((s, sub) => s + sub.monthlyValue, 0) / activeSubs.length : 0;
    const tabs: SubFilter[] = ["all", "Active", "Paused", "Cancelled"];
    const handleViewBox = async (id: string) => {
        try {
            const detailed = await getBoxById(id, token);
            setSelectedBox(detailed);
        } catch {
            setSelectedBox(null);
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
                <AdminMetricCard
                    label="Active Subscriptions"
                    value={activeSubs.length.toString()}
                    icon={Repeat}
                    tone="emerald"
                    delayMs={0}
                />
                <AdminMetricCard
                    label="Avg Monthly Value"
                    value={formatAdminPrice(Math.round(avgValue))}
                    icon={DollarSign}
                    tone="blue"
                    delayMs={70}
                />
                <AdminMetricCard
                    label="Churn Rate"
                    value={`${mockKPIs.churnRate}%`}
                    icon={TrendingDown}
                    tone="amber"
                    change={-mockKPIs.churnRate}
                    delayMs={140}
                />
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by customer..." className="pl-9 h-10 rounded-xl" />
                </div>
                <div className="flex gap-1 bg-muted/60 rounded-xl p-1">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setFilter(tab)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize ${filter === tab ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            {tab === "all" ? "All" : tab}
                        </button>
                    ))}
                </div>
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
                                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Box Weight</th>
                                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Frequency</th>
                                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Monthly</th>
                                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Next Billing</th>
                                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Status</th>
                                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((sub) => (
                                    <tr key={sub.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                                        <td className="px-4 py-3">
                                            <p className="font-medium">{sub.customerName}</p>
                                            <p className="text-xs text-muted-foreground">{sub.customerEmail}</p>
                                        </td>
                                        <td className="px-4 py-3"><Badge variant="secondary">{sub.plan}</Badge></td>
                                        <td className="px-4 py-3 text-muted-foreground">{sub.weightKg}kg</td>
                                        <td className="px-4 py-3 text-muted-foreground">{sub.frequency}</td>
                                        <td className="px-4 py-3 font-semibold">{formatAdminPrice(sub.monthlyValue)}</td>
                                        <td className="px-4 py-3 text-muted-foreground">{sub.nextBilling}</td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusColors[sub.status]}`}>
                                                {sub.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex gap-1">
                                                {sub.status === "Active" && (
                                                    <Button variant="ghost" size="sm" onClick={() => updateStatus(sub.id, "Paused")} title="Pause">
                                                        <Pause className="h-3.5 w-3.5" />
                                                    </Button>
                                                )}
                                                {sub.status === "Paused" && (
                                                    <Button variant="ghost" size="sm" onClick={() => updateStatus(sub.id, "Active")} title="Resume">
                                                        <Play className="h-3.5 w-3.5" />
                                                    </Button>
                                                )}
                                                {sub.status !== "Cancelled" && (
                                                    <Button variant="ghost" size="sm" onClick={() => updateStatus(sub.id, "Cancelled")} title="Cancel" className="text-destructive hover:text-destructive">
                                                        <XIcon className="h-3.5 w-3.5" />
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filtered.length === 0 && <div className="flex items-center justify-center py-12 text-muted-foreground">No subscriptions found.</div>}
                    </div>
                </CardContent>
            </Card>

            <Card className="admin-card admin-animate-up" style={{ animationDelay: "220ms" }}>
                <CardContent className="space-y-4 p-4 sm:p-5">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                        <div>
                            <p className="font-semibold">Box Templates</p>
                            <p className="text-xs text-muted-foreground">
                                {boxes?.length ?? 0} total, {activeBoxes?.length ?? 0} active
                            </p>
                        </div>
                        <Button size="sm" variant="outline" onClick={() => createBoxMutation.mutate()} disabled={createBoxMutation.isPending}>
                            {createBoxMutation.isPending ? "Creating..." : "Create Draft Box"}
                        </Button>
                    </div>

                    <div className="space-y-2">
                        {(boxes ?? []).map((box) => (
                            <div key={box.id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                                <div>
                                    <p className="text-sm font-medium">{box.name ?? box.id}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {(box.weightKg ?? 0)}kg • {formatAdminPrice(box.price ?? 0)}
                                    </p>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Badge variant={box.isActive ? "default" : "secondary"}>
                                        {box.isActive ? "Active" : "Draft"}
                                    </Badge>
                                    <Button size="sm" variant="ghost" onClick={() => void handleViewBox(box.id)}>View</Button>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => updateBoxMutation.mutate({
                                            id: box.id,
                                            input: { isActive: !box.isActive, name: box.name, price: box.price, weightKg: box.weightKg },
                                        })}
                                    >
                                        {box.isActive ? "Disable" : "Enable"}
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => {
                                            const next = prompt("Rename box", box.name ?? "");
                                            if (!next || !next.trim()) return;
                                            updateBoxMutation.mutate({
                                                id: box.id,
                                                input: {
                                                    name: next.trim(),
                                                    isActive: box.isActive,
                                                    price: box.price,
                                                    weightKg: box.weightKg,
                                                    description: box.description,
                                                    planTier: box.planTier,
                                                    items: box.items,
                                                },
                                            });
                                        }}
                                    >
                                        Rename
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="text-destructive hover:text-destructive"
                                        onClick={() => {
                                            if (!confirm("Delete this box template?")) return;
                                            deleteBoxMutation.mutate(box.id);
                                        }}
                                    >
                                        Delete
                                    </Button>
                                </div>
                            </div>
                        ))}
                        {(boxes ?? []).length === 0 && (
                            <p className="text-sm text-muted-foreground">No box templates available.</p>
                        )}
                    </div>

                    {selectedBox && (
                        <div className="rounded-lg border border-border p-3 text-sm">
                            <p className="font-medium">{selectedBox.name ?? selectedBox.id}</p>
                            <p className="text-muted-foreground mt-1">{selectedBox.description ?? "No description"}</p>
                            <p className="text-xs text-muted-foreground mt-2">
                                Tier: {selectedBox.planTier ?? "N/A"} • Items: {selectedBox.items?.length ?? 0}
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminSubscriptions;
