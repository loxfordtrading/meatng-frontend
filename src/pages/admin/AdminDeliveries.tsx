import { useState } from "react";
import { MapPin, Truck, User, ToggleLeft, ToggleRight } from "lucide-react";
import { AdminMetricCard } from "@/components/admin/AdminMetricCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { mockDeliveryZones, formatAdminPrice, type DeliveryZone } from "@/data/adminData";

const AdminDeliveries = () => {
    // const [zones, setZones] = useState<DeliveryZone[]>(mockDeliveryZones);
    const [zones, setZones] = useState<DeliveryZone[]>([]);

    const toggleZone = (id: string) => {
        setZones((prev) => prev.map((z) => (z.id === id ? { ...z, enabled: !z.enabled } : z)));
    };

    const enabledCount = zones.filter((z) => z.enabled).length;
    const totalDeliveries = zones.reduce((s, z) => s + z.upcomingDeliveries, 0);
    const uniqueDrivers = new Set(zones.filter((z) => z.driverName).map((z) => z.driverName)).size;

    // Group by state
    const grouped = zones.reduce<Record<string, DeliveryZone[]>>((acc, z) => {
        if (!acc[z.state]) acc[z.state] = [];
        acc[z.state].push(z);
        return acc;
    }, {});

    return (
        <div className="space-y-6 animate-fade-in admin-page-bg rounded-3xl p-4 sm:p-5">
            <div>
                <h1 className="text-2xl font-display font-bold text-foreground">Delivery Zones</h1>
                <p className="text-muted-foreground text-sm mt-1">Configure delivery areas and manage drivers.</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <AdminMetricCard
                    label="Active Zones"
                    value={`${enabledCount}/${zones.length}`}
                    icon={MapPin}
                    tone="emerald"
                    delayMs={0}
                />
                <AdminMetricCard
                    label="Upcoming Deliveries"
                    value={totalDeliveries.toString()}
                    icon={Truck}
                    tone="blue"
                    delayMs={70}
                />
                <AdminMetricCard
                    label="Active Drivers"
                    value={uniqueDrivers.toString()}
                    icon={User}
                    tone="teal"
                    delayMs={140}
                />
            </div>

            {/* Zones by State */}
            {Object.entries(grouped).map(([state, stateZones]) => (
                <Card key={state} className="admin-card admin-animate-up" style={{ animationDelay: "180ms" }}>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-primary" /> {state}
                            <Badge variant="secondary" className="ml-auto">{stateZones.length} zones</Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-border bg-muted/40">
                                        <th className="px-4 py-3 text-left font-semibold text-muted-foreground">LGA</th>
                                        <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Fee</th>
                                        <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Driver</th>
                                        <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Upcoming</th>
                                        <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Status</th>
                                        <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Toggle</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stateZones.map((zone) => (
                                        <tr key={zone.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                                            <td className="px-4 py-3 font-medium">{zone.lga}</td>
                                            <td className="px-4 py-3">{formatAdminPrice(zone.fee)}</td>
                                            <td className="px-4 py-3">{zone.driverName || <span className="text-muted-foreground italic">Unassigned</span>}</td>
                                            <td className="px-4 py-3">
                                                {zone.upcomingDeliveries > 0 ? (
                                                    <Badge variant="secondary">{zone.upcomingDeliveries} deliveries</Badge>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground">—</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <Badge variant={zone.enabled ? "default" : "destructive"}>
                                                    {zone.enabled ? "Active" : "Disabled"}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3">
                                                <button onClick={() => toggleZone(zone.id)} className="text-muted-foreground hover:text-foreground transition-colors">
                                                    {zone.enabled
                                                        ? <ToggleRight className="h-6 w-6 text-primary" />
                                                        : <ToggleLeft className="h-6 w-6" />
                                                    }
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            ))}
            {zones.length <= 0 && <div className="flex items-center justify-center py-12 text-muted-foreground font-medium">No delivery zones found.</div>}
        </div>
    );
};

export default AdminDeliveries;
